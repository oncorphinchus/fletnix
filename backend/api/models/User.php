<?php
/**
 * User Model
 */

class User {
    private $conn;
    private $table = 'users';
    
    public function __construct() {
        $this->conn = Database::getConnection();
    }
    
    /**
     * Get all users
     * 
     * @param array $params Query parameters
     * @return array Users data
     */
    public function getAll($params = []) {
        $limit = isset($params['limit']) ? intval($params['limit']) : 10;
        $offset = isset($params['offset']) ? intval($params['offset']) : 0;
        
        $query = "SELECT id, username, email, display_name, created_at 
                 FROM {$this->table} 
                 ORDER BY id DESC 
                 LIMIT :limit OFFSET :offset";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Get a user by ID
     * 
     * @param int $id User ID
     * @return array|false User data or false if not found
     */
    public function getById($id) {
        $query = "SELECT id, username, email, display_name, created_at 
                 FROM {$this->table} 
                 WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Get a user by username
     * 
     * @param string $username Username
     * @return array|false User data or false if not found
     */
    public function getByUsername($username) {
        $query = "SELECT id, username, email, password, display_name, created_at 
                 FROM {$this->table} 
                 WHERE username = :username";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        return $stmt->fetch();
    }
    
    /**
     * Create a new user
     * 
     * @param array $data User data
     * @return int|false New user ID or false on failure
     */
    public function create($data) {
        // Check if username or email already exists
        if ($this->usernameExists($data['username']) || $this->emailExists($data['email'])) {
            return false;
        }
        
        // Hash the password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $query = "INSERT INTO {$this->table} 
                 (username, email, password, display_name) 
                 VALUES 
                 (:username, :email, :password, :display_name)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $data['username']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':display_name', $data['display_name']);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    /**
     * Update a user
     * 
     * @param int $id User ID
     * @param array $data User data
     * @return bool Success or failure
     */
    public function update($id, $data) {
        // Start building the query
        $query = "UPDATE {$this->table} SET";
        $params = [];
        
        // Add fields to update
        if (isset($data['email'])) {
            // Check if email exists and it's not the current user's email
            $user = $this->getById($id);
            if ($user && $user['email'] !== $data['email'] && $this->emailExists($data['email'])) {
                return false;
            }
            
            $query .= " email = :email,";
            $params[':email'] = $data['email'];
        }
        
        if (isset($data['display_name'])) {
            $query .= " display_name = :display_name,";
            $params[':display_name'] = $data['display_name'];
        }
        
        if (isset($data['password'])) {
            $query .= " password = :password,";
            $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        
        // Remove trailing comma
        $query = rtrim($query, ',');
        
        // Add where clause
        $query .= " WHERE id = :id";
        $params[':id'] = $id;
        
        $stmt = $this->conn->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        return $stmt->execute();
    }
    
    /**
     * Delete a user
     * 
     * @param int $id User ID
     * @return bool Success or failure
     */
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        
        return $stmt->execute();
    }
    
    /**
     * Check if username exists
     * 
     * @param string $username Username
     * @return bool True if exists, false otherwise
     */
    public function usernameExists($username) {
        $query = "SELECT COUNT(*) FROM {$this->table} WHERE username = :username";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        return $stmt->fetchColumn() > 0;
    }
    
    /**
     * Check if email exists
     * 
     * @param string $email Email
     * @return bool True if exists, false otherwise
     */
    public function emailExists($email) {
        $query = "SELECT COUNT(*) FROM {$this->table} WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->fetchColumn() > 0;
    }
    
    /**
     * Authenticate a user
     * 
     * @param string $username Username
     * @param string $password Password
     * @return array|false User data or false on failure
     */
    public function authenticate($username, $password) {
        $user = $this->getByUsername($username);
        
        if (!$user) {
            return false;
        }
        
        if (password_verify($password, $user['password'])) {
            // Remove password from return data
            unset($user['password']);
            return $user;
        }
        
        return false;
    }
} 