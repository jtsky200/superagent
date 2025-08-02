-- Migration: Create refresh_tokens table
-- Date: 2024-07-30

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_refresh_tokens_user_id_expires_at (user_id, expires_at),
    INDEX idx_refresh_tokens_token_hash (token_hash),
    INDEX idx_refresh_tokens_expires_at (expires_at),
    INDEX idx_refresh_tokens_blacklisted (is_blacklisted),
    
    -- Foreign key constraint
    CONSTRAINT fk_refresh_tokens_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Add comment
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication with security features';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA256 hash of the refresh token for security';
COMMENT ON COLUMN refresh_tokens.is_blacklisted IS 'Whether the token has been revoked';
COMMENT ON COLUMN refresh_tokens.ip_address IS 'IP address where token was created';
COMMENT ON COLUMN refresh_tokens.user_agent IS 'User agent where token was created'; 