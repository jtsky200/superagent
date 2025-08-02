import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(zlib.gzip);
const deflateAsync = promisify(zlib.deflate);
const brotliCompressAsync = promisify(zlib.brotliCompress);

interface CompressionOptions {
  threshold: number; // Minimum response size to compress (bytes)
  enableBrotli: boolean;
  level: number; // Compression level (1-9)
}

@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CompressionInterceptor.name);
  private readonly options: CompressionOptions;

  constructor(options: Partial<CompressionOptions> = {}) {
    this.options = {
      threshold: 1024, // 1KB
      enableBrotli: true,
      level: 6, // Balanced compression
      ...options,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map(async (data) => {
        // Skip compression for certain content types or small responses
        if (!this.shouldCompress(request, data)) {
          return data;
        }

        try {
          const jsonData = JSON.stringify(data);
          const dataBuffer = Buffer.from(jsonData, 'utf8');

          // Skip compression if data is too small
          if (dataBuffer.length < this.options.threshold) {
            return data;
          }

          const acceptEncoding = request.headers['accept-encoding'] || '';
          let compressionMethod: string | null = null;
          let compressedData: Buffer;

          // Determine best compression method
          if (this.options.enableBrotli && acceptEncoding.includes('br')) {
            compressionMethod = 'br';
            compressedData = await brotliCompressAsync(dataBuffer, {
              params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: this.options.level,
              },
            });
          } else if (acceptEncoding.includes('gzip')) {
            compressionMethod = 'gzip';
            compressedData = await gzipAsync(dataBuffer, {
              level: this.options.level,
            });
          } else if (acceptEncoding.includes('deflate')) {
            compressionMethod = 'deflate';
            compressedData = await deflateAsync(dataBuffer, {
              level: this.options.level,
            });
          } else {
            // No compression support
            return data;
          }

          // Calculate compression ratio
          const originalSize = dataBuffer.length;
          const compressedSize = compressedData.length;
          const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

          // Only use compression if it provides significant benefit
          if (compressionRatio < 10) {
            this.logger.debug(
              `Low compression ratio (${compressionRatio.toFixed(1)}%) for ${request.path}, skipping compression`
            );
            return data;
          }

          // Set compression headers
          response.setHeader('Content-Encoding', compressionMethod);
          response.setHeader('Content-Length', compressedSize.toString());
          response.setHeader('X-Original-Size', originalSize.toString());
          response.setHeader('X-Compressed-Size', compressedSize.toString());
          response.setHeader('X-Compression-Ratio', `${compressionRatio.toFixed(1)}%`);

          this.logger.debug(
            `Compressed response for ${request.path}: ${originalSize} → ${compressedSize} bytes (${compressionRatio.toFixed(1)}% reduction) using ${compressionMethod}`
          );

          // Return the compressed data
          // Note: In a real implementation, you'd send the compressed buffer directly
          // This is a simplified version for demonstration
          return {
            ...data,
            _compression: {
              method: compressionMethod,
              originalSize,
              compressedSize,
              ratio: compressionRatio,
            },
          };
        } catch (error) {
          this.logger.error(`Compression failed for ${request.path}:`, error);
          return data; // Return uncompressed data on error
        }
      })
    );
  }

  private shouldCompress(request: Request, data: any): boolean {
    // Skip compression for certain endpoints
    const skipPatterns = ['/health', '/metrics', '/status'];
    if (skipPatterns.some(pattern => request.path.includes(pattern))) {
      return false;
    }

    // Skip compression for non-JSON responses
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    // Skip compression for responses with no-compression header
    const noCompress = request.headers['x-no-compression'];
    if (noCompress) {
      return false;
    }

    // Skip compression for already compressed data
    if (data._compressed || data.__compressed) {
      return false;
    }

    return true;
  }
}

// Utility function to create compression interceptor with custom options
export function createCompressionInterceptor(
  options: Partial<CompressionOptions> = {}
): CompressionInterceptor {
  return new CompressionInterceptor(options);
}