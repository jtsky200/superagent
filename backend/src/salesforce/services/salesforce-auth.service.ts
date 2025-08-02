import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import * as crypto from 'crypto';
import { SalesforceToken } from '../entities/salesforce-token.entity';
import { SalesforceTokenDto, SalesforceConfigDto } from '../dto/salesforce-auth.dto';

@Injectable()
export class SalesforceAuthService {
  private readonly logger = new Logger(SalesforceAuthService.name);

  constructor(
    @InjectRepository(SalesforceToken)
    private salesforceTokenRepository: Repository<SalesforceToken>,
    private configService: ConfigService,
  ) {}

  /**
   * Generate authorization URL for Salesforce OAuth flow
   */
  generateAuthUrl(userId: string): string {
    const clientId = this.configService.get<string>('SALESFORCE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('SALESFORCE_REDIRECT_URI');
    const environment = this.configService.get<string>('SALESFORCE_ENVIRONMENT', 'sandbox');
    
    const baseUrl = environment === 'production' 
      ? this.configService.get<string>('SALESFORCE_PRODUCTION_URL')
      : this.configService.get<string>('SALESFORCE_SANDBOX_URL');

    if (!clientId || !redirectUri) {
      throw new BadRequestException('Salesforce OAuth configuration is incomplete');
    }

    // Generate state parameter for CSRF protection
    const state = this.generateState(userId);

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: 'api refresh_token',
      prompt: 'consent'
    });

    const authUrl = `${baseUrl}/services/oauth2/authorize?${authParams.toString()}`;
    
    this.logger.log(`Generated auth URL for user ${userId}: ${authUrl}`);
    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<SalesforceTokenDto> {
    const userId = this.verifyState(state);
    if (!userId) {
      throw new UnauthorizedException('Invalid state parameter');
    }

    const clientId = this.configService.get<string>('SALESFORCE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SALESFORCE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('SALESFORCE_REDIRECT_URI');
    const environment = this.configService.get<string>('SALESFORCE_ENVIRONMENT', 'sandbox');

    const tokenUrl = environment === 'production'
      ? `${this.configService.get<string>('SALESFORCE_PRODUCTION_URL')}/services/oauth2/token`
      : `${this.configService.get<string>('SALESFORCE_SANDBOX_URL')}/services/oauth2/token`;

    const tokenData = {
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
    };

    try {
      const response: AxiosResponse<SalesforceTokenDto> = await axios.post(
        tokenUrl,
        new URLSearchParams(tokenData).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const tokenInfo = response.data;

      // Get user info
      const userInfo = await this.getUserInfo(tokenInfo.access_token, tokenInfo.instance_url);

      // Save token to database
      await this.saveToken(userId, tokenInfo, userInfo, environment);

      this.logger.log(`Successfully obtained token for user ${userId}`);
      return tokenInfo;

    } catch (error) {
      this.logger.error(`Token exchange failed for user ${userId}:`, error.response?.data || error.message);
      throw new BadRequestException('Failed to exchange code for token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(userId: string): Promise<SalesforceTokenDto> {
    const tokenRecord = await this.salesforceTokenRepository.findOne({
      where: { userId, isActive: true }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('No active Salesforce token found');
    }

    const clientId = this.configService.get<string>('SALESFORCE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SALESFORCE_CLIENT_SECRET');

    const tokenUrl = tokenRecord.environment === 'production'
      ? `${this.configService.get<string>('SALESFORCE_PRODUCTION_URL')}/services/oauth2/token`
      : `${this.configService.get<string>('SALESFORCE_SANDBOX_URL')}/services/oauth2/token`;

    const refreshData = {
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenRecord.refreshToken,
    };

    try {
      const response: AxiosResponse<SalesforceTokenDto> = await axios.post(
        tokenUrl,
        new URLSearchParams(refreshData).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const newTokenInfo = response.data;

      // Update token in database
      tokenRecord.accessToken = newTokenInfo.access_token;
      tokenRecord.issuedAt = newTokenInfo.issued_at;
      tokenRecord.signature = newTokenInfo.signature;
      tokenRecord.lastUsedAt = new Date();

      if (newTokenInfo.refresh_token) {
        tokenRecord.refreshToken = newTokenInfo.refresh_token;
      }

      await this.salesforceTokenRepository.save(tokenRecord);

      this.logger.log(`Successfully refreshed token for user ${userId}`);
      return newTokenInfo;

    } catch (error) {
      this.logger.error(`Token refresh failed for user ${userId}:`, error.response?.data || error.message);
      
      // Mark token as inactive if refresh fails
      tokenRecord.isActive = false;
      await this.salesforceTokenRepository.save(tokenRecord);
      
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  /**
   * Get valid access token for user (refresh if needed)
   */
  async getValidToken(userId: string): Promise<string> {
    const tokenRecord = await this.salesforceTokenRepository.findOne({
      where: { userId, isActive: true }
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('No active Salesforce token found. Please reconnect.');
    }

    // Check if token needs refresh (if it's more than 2 hours old)
    const tokenAge = Date.now() - parseInt(tokenRecord.issuedAt);
    const twoHours = 2 * 60 * 60 * 1000;

    if (tokenAge > twoHours) {
      this.logger.log(`Token for user ${userId} is older than 2 hours, refreshing...`);
      const refreshedToken = await this.refreshToken(userId);
      return refreshedToken.access_token;
    }

    // Update last used timestamp
    tokenRecord.lastUsedAt = new Date();
    await this.salesforceTokenRepository.save(tokenRecord);

    return tokenRecord.accessToken;
  }

  /**
   * Get Salesforce configuration for user
   */
  async getSalesforceConfig(userId: string): Promise<SalesforceConfigDto> {
    const tokenRecord = await this.salesforceTokenRepository.findOne({
      where: { userId, isActive: true }
    });

    const config: SalesforceConfigDto = {
      environment: tokenRecord?.environment || 'sandbox',
      instanceUrl: tokenRecord?.instanceUrl || '',
      isConnected: !!tokenRecord,
    };

    if (tokenRecord?.userInfo) {
      config.userInfo = {
        id: tokenRecord.salesforceUserId,
        username: tokenRecord.userInfo.username,
        display_name: tokenRecord.userInfo.display_name,
        email: tokenRecord.userInfo.email,
        organization_id: tokenRecord.userInfo.organization_id,
      };
    }

    return config;
  }

  /**
   * Disconnect Salesforce integration
   */
  async disconnect(userId: string): Promise<void> {
    await this.salesforceTokenRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );

    this.logger.log(`Disconnected Salesforce integration for user ${userId}`);
  }

  /**
   * Revoke Salesforce token
   */
  async revokeToken(userId: string): Promise<void> {
    const tokenRecord = await this.salesforceTokenRepository.findOne({
      where: { userId, isActive: true }
    });

    if (!tokenRecord) {
      return;
    }

    try {
      const revokeUrl = `${tokenRecord.instanceUrl}/services/oauth2/revoke`;
      
      await axios.post(
        revokeUrl,
        new URLSearchParams({ token: tokenRecord.accessToken }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.logger.log(`Successfully revoked token for user ${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to revoke token for user ${userId}:`, error.message);
      // Continue with local disconnect even if revocation fails
    }

    await this.disconnect(userId);
  }

  public generateState(userId: string): string {
    const timestamp = Date.now().toString();
    const secret = this.configService.get<string>('JWT_SECRET');
    const data = `${userId}:${timestamp}`;
    const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
    
    return Buffer.from(`${data}:${signature}`).toString('base64');
  }

  public verifyState(state: string): string | null {
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf8');
      const [userId, timestamp, signature] = decoded.split(':');
      
      const secret = this.configService.get<string>('JWT_SECRET');
      const data = `${userId}:${timestamp}`;
      const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');
      
      if (signature !== expectedSignature) {
        return null;
      }

      // Check if state is not older than 10 minutes
      const stateAge = Date.now() - parseInt(timestamp);
      if (stateAge > 10 * 60 * 1000) {
        return null;
      }

      return userId;
    } catch (error) {
      this.logger.error('Failed to verify state:', error.message);
      return null;
    }
  }

  private async getUserInfo(accessToken: string, instanceUrl: string): Promise<any> {
    try {
      const response = await axios.get(`${instanceUrl}/services/oauth2/userinfo`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return {
        username: response.data.preferred_username,
        display_name: response.data.name,
        email: response.data.email,
        organization_id: response.data.organization_id,
      };
    } catch (error) {
      this.logger.warn('Failed to get user info:', error.message);
      return null;
    }
  }

  private async saveToken(
    userId: string, 
    tokenInfo: SalesforceTokenDto, 
    userInfo: any,
    environment: string
  ): Promise<void> {
    // Deactivate existing tokens
    await this.salesforceTokenRepository.update(
      { userId },
      { isActive: false }
    );

    // Save new token
    const tokenRecord = this.salesforceTokenRepository.create({
      userId,
      accessToken: tokenInfo.access_token,
      refreshToken: tokenInfo.refresh_token,
      instanceUrl: tokenInfo.instance_url,
      salesforceUserId: tokenInfo.id,
      tokenType: tokenInfo.token_type,
      issuedAt: tokenInfo.issued_at,
      signature: tokenInfo.signature,
      userInfo,
      environment: environment as 'sandbox' | 'production',
      isActive: true,
      lastUsedAt: new Date(),
    });

    await this.salesforceTokenRepository.save(tokenRecord);
  }
}