<?php
/**
 * User Controller
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../../helpers/JWTHandler.php';
require_once __DIR__ . '/../../helpers/ApiResponse.php';

class UserController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    /**
     * Handle GET requests for a specific user
     * 
     * @param string $id User ID
     * @param array $path Additional path segments
     * @param array $params Query parameters
     */
    public function get($id, $path, $params) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Only admin or the user itself can access user data
        if ($userData['role'] !== 'admin' && $userData['sub'] != $id) {
            ApiResponse::forbidden('You do not have permission to access this resource');
        }
        
        // Get user details
        $user = $this->userModel->getById($id);
        
        if (!$user) {
            ApiResponse::notFound('User');
        }
        
        ApiResponse::success($user);
    }
    
    /**
     * Handle GET requests for listing users
     * 
     * @param array $params Query parameters
     */
    public function list($params) {
        // Check if user is authenticated and has admin role
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData || $userData['role'] !== 'admin') {
            ApiResponse::forbidden('Only admins can list users');
        }
        
        // Get all users
        $users = $this->userModel->getAll($params);
        
        ApiResponse::success($users);
    }
    
    /**
     * Handle POST requests to create a new user
     * Only admins can create users directly
     * Normal users should use the registration process
     * 
     * @param array $data Request data
     */
    public function create($data) {
        // Check if user is authenticated and has admin role
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData || $userData['role'] !== 'admin') {
            ApiResponse::forbidden('Only admins can create users directly');
        }
        
        // Validate required fields (same as registration)
        $errors = [];
        
        if (!isset($data['username']) || empty($data['username'])) {
            $errors['username'] = 'Username is required';
        } elseif ($this->userModel->usernameExists($data['username'])) {
            $errors['username'] = 'Username already exists';
        }
        
        if (!isset($data['email']) || empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
        } elseif ($this->userModel->emailExists($data['email'])) {
            $errors['email'] = 'Email already exists';
        }
        
        if (!isset($data['password']) || empty($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }
        
        if (!empty($errors)) {
            ApiResponse::validationError($errors);
        }
        
        // Set display name to username if not provided
        if (!isset($data['display_name']) || empty($data['display_name'])) {
            $data['display_name'] = $data['username'];
        }
        
        // Create user
        $userId = $this->userModel->create($data);
        
        if (!$userId) {
            ApiResponse::error('Failed to create user', 500);
        }
        
        // Get created user
        $user = $this->userModel->getById($userId);
        
        ApiResponse::success($user, 201);
    }
    
    /**
     * Handle PUT requests to update a user
     * 
     * @param string $id User ID
     * @param array $data Request data
     */
    public function update($id, $data) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Only admin or the user itself can update user data
        if ($userData['role'] !== 'admin' && $userData['sub'] != $id) {
            ApiResponse::forbidden('You do not have permission to modify this resource');
        }
        
        // Check if user exists
        $user = $this->userModel->getById($id);
        
        if (!$user) {
            ApiResponse::notFound('User');
        }
        
        // Only admin can change role
        if (isset($data['role']) && $userData['role'] !== 'admin') {
            unset($data['role']);
        }
        
        // Update user
        $success = $this->userModel->update($id, $data);
        
        if (!$success) {
            ApiResponse::error('Failed to update user', 500);
        }
        
        // Get updated user
        $updatedUser = $this->userModel->getById($id);
        
        ApiResponse::success($updatedUser);
    }
    
    /**
     * Handle DELETE requests to delete a user
     * 
     * @param string $id User ID
     */
    public function delete($id) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Only admin or the user itself can delete the user
        if ($userData['role'] !== 'admin' && $userData['sub'] != $id) {
            ApiResponse::forbidden('You do not have permission to delete this resource');
        }
        
        // Check if user exists
        $user = $this->userModel->getById($id);
        
        if (!$user) {
            ApiResponse::notFound('User');
        }
        
        // Delete user
        $success = $this->userModel->delete($id);
        
        if (!$success) {
            ApiResponse::error('Failed to delete user', 500);
        }
        
        ApiResponse::success(null, 200, 'User deleted successfully');
    }
} 