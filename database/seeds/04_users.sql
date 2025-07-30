-- Default Users Seed Data
-- Creates admin and demo users for development

INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active
) VALUES
-- Admin user (password: admin123)
(
    'admin@cadillac.ch',
    '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', -- This should be properly hashed in production
    'Admin',
    'User',
    'admin',
    true
),

-- Sales Manager (password: sales123)
(
    'sales.manager@cadillac.ch',
    '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ',
    'Sales',
    'Manager',
    'sales_manager',
    true
),

-- Sales Representative (password: sales123)
(
    'sales.rep@cadillac.ch',
    '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ',
    'Sales',
    'Representative',
    'sales_rep',
    true
),

-- Demo user (password: demo123)
(
    'demo@cadillac.ch',
    '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ',
    'Demo',
    'User',
    'user',
    true
),

-- ROOLL OZ user (password: rooll123)
(
    'rooll.oz@cadillac.ch',
    '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ',
    'ROOLL',
    'OZ',
    'rooll_oz',
    true
);

-- Update timestamps
UPDATE users SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

-- Note: In production, passwords should be properly hashed using bcrypt
-- The password hashes above are placeholders and should be replaced with actual bcrypt hashes

