-- Initialize Fletnix Database

-- Create Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(100),
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Media Categories table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Media Items table
CREATE TABLE IF NOT EXISTS `media` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `type` ENUM('movie', 'tvshow', 'episode') NOT NULL,
  `release_year` INT,
  `duration` INT COMMENT 'Duration in seconds',
  `file_path` VARCHAR(255) NOT NULL,
  `poster_path` VARCHAR(255),
  `backdrop_path` VARCHAR(255),
  `jellyfin_id` VARCHAR(50) COMMENT 'ID of the media in Jellyfin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create TV Shows table (for shows and seasons)
CREATE TABLE IF NOT EXISTS `tvshows` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `media_id` INT NOT NULL,
  `total_seasons` INT DEFAULT 1,
  `total_episodes` INT DEFAULT 1,
  `status` ENUM('ongoing', 'ended', 'canceled') DEFAULT 'ongoing',
  FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Episodes table
CREATE TABLE IF NOT EXISTS `episodes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `media_id` INT NOT NULL,
  `tvshow_id` INT NOT NULL,
  `season_number` INT NOT NULL,
  `episode_number` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `air_date` DATE,
  FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tvshow_id`) REFERENCES `tvshows` (`media_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create relationship table between Media and Categories
CREATE TABLE IF NOT EXISTS `media_categories` (
  `media_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`media_id`, `category_id`),
  FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Watch History table
CREATE TABLE IF NOT EXISTS `watch_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `media_id` INT NOT NULL,
  `position` INT NOT NULL DEFAULT 0 COMMENT 'Position in seconds',
  `completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `watched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`media_id`) REFERENCES `media` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create User Preferences table
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `user_id` INT PRIMARY KEY,
  `preferred_subtitle` VARCHAR(10) DEFAULT NULL,
  `preferred_audio` VARCHAR(10) DEFAULT NULL,
  `autoplay` BOOLEAN DEFAULT TRUE,
  `theme` ENUM('light', 'dark', 'system') DEFAULT 'system',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default categories
INSERT INTO `categories` (`name`, `description`) VALUES
('Action', 'Action movies and shows featuring intense sequences, fights, and high-energy scenarios'),
('Comedy', 'Humorous content designed to make viewers laugh'),
('Drama', 'Character-driven stories with emotional themes'),
('Sci-Fi', 'Content featuring futuristic technology, space travel, or scientific concepts'),
('Horror', 'Content designed to frighten, scare, or startle viewers'),
('Documentary', 'Non-fiction films presenting facts and information'),
('Animation', 'Content created with animation techniques'),
('Fantasy', 'Content featuring magical elements and supernatural phenomena'),
('Thriller', 'Suspenseful, exciting content designed to keep viewers on edge'),
('Romance', 'Content focused on romantic relationships');

-- Create default admin user (password: admin123)
INSERT INTO `users` (`username`, `email`, `password`, `display_name`, `role`) VALUES
('admin', 'admin@fletnix.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin'); 