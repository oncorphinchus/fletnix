<?php
/**
 * Database configuration file
 */

// Get environment variables from Docker
$host = getenv('DB_HOST') ?: 'database';
$dbname = getenv('DB_NAME') ?: 'fletnix';
$username = getenv('DB_USER') ?: 'fletnix_user';
$password = getenv('DB_PASSWORD') ?: 'fletnix_password';

class Database {
    private static $conn = null;
    
    /**
     * Get database connection
     * 
     * @return PDO Database connection
     */
    public static function getConnection() {
        global $host, $dbname, $username, $password;
        
        if (self::$conn === null) {
            try {
                $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                
                self::$conn = new PDO($dsn, $username, $password, $options);
            } catch (PDOException $e) {
                // Log the error but don't expose details in production
                error_log("Database connection error: " . $e->getMessage());
                throw new Exception("Database connection failed");
            }
        }
        
        return self::$conn;
    }
} 