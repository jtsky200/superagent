-- Migration: Create customer_notes table
-- Date: 2024-07-30

CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_customer_notes_customer_id_created_at (customer_id, created_at),
    INDEX idx_customer_notes_created_at (created_at),
    
    -- Foreign key constraint
    CONSTRAINT fk_customer_notes_customer_id 
        FOREIGN KEY (customer_id) 
        REFERENCES customers(id) 
        ON DELETE CASCADE
);

-- Add comment
COMMENT ON TABLE customer_notes IS 'Stores notes and comments for customers';
COMMENT ON COLUMN customer_notes.content IS 'Note content text';
COMMENT ON COLUMN customer_notes.customer_id IS 'Reference to customer'; 