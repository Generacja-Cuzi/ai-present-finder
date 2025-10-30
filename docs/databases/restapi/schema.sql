CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE user_role_enum AS ENUM ('user', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    role user_role_enum NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE users IS 'User accounts authenticated via Google OAuth';
COMMENT ON COLUMN users.id IS 'Primary key - UUID v4';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.google_id IS 'Google OAuth user ID';
COMMENT ON COLUMN users.name IS 'User display name from Google';
COMMENT ON COLUMN users.access_token IS 'Google OAuth access token';
COMMENT ON COLUMN users.refresh_token IS 'Google OAuth refresh token';
COMMENT ON COLUMN users.role IS 'User role (user or admin) - controls access permissions';
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(255) NOT NULL UNIQUE,
    chat_name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE chats IS 'Chat sessions for gift recommendation conversations';
COMMENT ON COLUMN chats.id IS 'Primary key - UUID v4';
COMMENT ON COLUMN chats.chat_id IS 'Business identifier for the chat (unique)';
COMMENT ON COLUMN chats.chat_name IS 'Display name for the chat (e.g., occasion)';
COMMENT ON COLUMN chats.user_id IS 'Foreign key to users table';
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL,
    role message_role NOT NULL DEFAULT 'user',
    content TEXT NOT NULL,
    proposed_answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE messages IS 'Individual messages in chat conversations';
COMMENT ON COLUMN messages.id IS 'Primary key - UUID v4';
COMMENT ON COLUMN messages.chat_id IS 'Foreign key to chats table (using id, not chat_id)';
COMMENT ON COLUMN messages.role IS 'Message sender role (user, assistant, system)';
COMMENT ON COLUMN messages.content IS 'Message text content';
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at);
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id VARCHAR(255),
    image VARCHAR(500),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    link VARCHAR(1000) NOT NULL,
    price_value DECIMAL(10, 2),
    price_label VARCHAR(100),
    price_currency VARCHAR(10),
    price_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE listings IS 'Product listings/recommendations from e-commerce providers';
COMMENT ON COLUMN listings.id IS 'Primary key - UUID v4';
COMMENT ON COLUMN listings.chat_id IS 'Foreign key to chats.chat_id (business ID, not UUID)';
COMMENT ON COLUMN listings.image IS 'URL to product image';
COMMENT ON COLUMN listings.title IS 'Product title/name';
COMMENT ON COLUMN listings.description IS 'Product description';
COMMENT ON COLUMN listings.link IS 'URL to product page';
COMMENT ON COLUMN listings.price_value IS 'Numeric price value';
COMMENT ON COLUMN listings.price_label IS 'Display price label (e.g., "19.99 USD")';
COMMENT ON COLUMN listings.price_currency IS 'Currency code (USD, EUR, PLN, etc.)';
COMMENT ON COLUMN listings.price_negotiable IS 'Whether price is negotiable';
CREATE INDEX idx_listings_chat_id ON listings(chat_id);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE TABLE user_favorite_listings (
    user_id UUID NOT NULL,
    listing_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, listing_id)
);
COMMENT ON TABLE user_favorite_listings IS 'Junction table for user favorites (Many-to-Many)';
COMMENT ON COLUMN user_favorite_listings.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN user_favorite_listings.listing_id IS 'Foreign key to listings table';
COMMENT ON COLUMN user_favorite_listings.created_at IS 'When the listing was favorited';
CREATE INDEX idx_user_favorites_user ON user_favorite_listings(user_id);
CREATE INDEX idx_user_favorites_listing ON user_favorite_listings(listing_id);
ALTER TABLE chats
ADD CONSTRAINT fk_chats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE messages
ADD CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE listings
ADD CONSTRAINT fk_listings_chat FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE
SET NULL ON UPDATE CASCADE;
ALTER TABLE user_favorite_listings
ADD CONSTRAINT fk_user_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE user_favorite_listings
ADD CONSTRAINT fk_user_favorites_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE;