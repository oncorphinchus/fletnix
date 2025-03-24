-- Database Initialization Script for Fletnix
-- Create and use the Fletnix database
CREATE DATABASE IF NOT EXISTS fletnix;
USE fletnix;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS viewing_history;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    profile_image VARCHAR(255) DEFAULT NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create media table
CREATE TABLE media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jellyfin_id VARCHAR(100) UNIQUE,
    title VARCHAR(255) NOT NULL,
    type ENUM('movie', 'series', 'episode', 'other') NOT NULL,
    description TEXT,
    release_year INT,
    duration INT,  -- Duration in seconds
    thumbnail_path VARCHAR(255),
    backdrop_path VARCHAR(255),
    file_path VARCHAR(255),
    genre VARCHAR(100),
    rating DECIMAL(3,1),
    tmdb_id VARCHAR(20),
    imdb_id VARCHAR(20),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_title (title),
    INDEX idx_jellyfin_id (jellyfin_id),
    FULLTEXT INDEX ft_media (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create viewing_history table
CREATE TABLE viewing_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    progress INT DEFAULT 0,  -- Progress in seconds
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    INDEX idx_user_media (user_id, media_id),
    INDEX idx_watched_at (watched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_preferences table
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    subtitle_language VARCHAR(10) DEFAULT 'en',
    audio_language VARCHAR(10) DEFAULT 'en',
    autoplay BOOLEAN DEFAULT TRUE,
    quality_preference VARCHAR(20) DEFAULT 'auto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, display_name, role)
VALUES ('admin', 'admin@fletnix.local', '$2y$10$QmD0Ss2GJDmM8RdC1BSjq.Mu6fzlhTUJYq7X9cCxEYHGhTKBoCjfG', 'Administrator', 'admin');

-- Insert some sample media records
INSERT INTO media (jellyfin_id, title, type, description, release_year, duration, genre, rating) 
VALUES 
('sample1', 'Big Buck Bunny', 'movie', 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself.', 2008, 596, 'Animation', 7.8),
('sample2', 'Sintel', 'movie', 'A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales.', 2010, 882, 'Animation', 7.5),
('sample3', 'Tears of Steel', 'movie', 'In a futuristic world, a group of scientists work to repair the past.', 2012, 734, 'Sci-Fi', 6.9),
('sample4', 'Elephants Dream', 'movie', 'Two characters explore a mechanical, post-industrial environment.', 2006, 654, 'Animation', 6.7); 