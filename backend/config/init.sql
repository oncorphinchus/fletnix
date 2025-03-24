-- Use the fletnix database
USE fletnix;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('movie', 'series', 'episode') NOT NULL,
    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),
    overview TEXT,
    release_date DATE,
    runtime INT,
    jellyfin_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create history table
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress FLOAT DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    media_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    UNIQUE KEY user_media (user_id, media_id)
);

-- Insert some sample data
INSERT INTO users (username, email, password, display_name)
VALUES 
('admin', 'admin@example.com', '$2y$10$8sA7AMY5TZSIr.DfNsb6FeXRgHkZI1f.yD6mEn4W4wpgQgZO15CKG', 'Administrator'), -- Password: admin123
('user', 'user@example.com', '$2y$10$HZR8cVhFhpTQ7ygqKOO70eS7M.OfK0hZIZ1lDGS1aBQ9qg7WlGmIS', 'Test User'); -- Password: user123

-- Insert sample media
INSERT INTO media (title, type, poster_path, backdrop_path, overview, release_date, runtime, jellyfin_id)
VALUES
('The Matrix', 'movie', '/matrix_poster.jpg', '/matrix_backdrop.jpg', 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', '1999-03-31', 136, 'matrix1'),
('Inception', 'movie', '/inception_poster.jpg', '/inception_backdrop.jpg', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', '2010-07-16', 148, 'inception1'),
('Breaking Bad', 'series', '/bb_poster.jpg', '/bb_backdrop.jpg', 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.', '2008-01-20', NULL, 'bb1');

-- Add some sample watchlist items
INSERT INTO watchlist (user_id, media_id)
VALUES
(1, 1),
(1, 3),
(2, 2);

-- Add some sample history items
INSERT INTO history (user_id, media_id, progress)
VALUES
(1, 2, 0.75),
(2, 1, 1.0),
(2, 3, 0.25); 