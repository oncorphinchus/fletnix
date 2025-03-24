<?php
/**
 * Authentication Controller
 */

require_once __DIR__ . '/../models/User.php';

class AuthController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    /**
     * Handle GET requests
     * 
     * @param string $id Not used for this controller
     * @param array $path Additional path segments
     * @param array $params Query parameters
     */
    public function get($id, $path, $params) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized('Not logged in');
        }
        
        // Get user details from the database using sub (subject) ID
        $user = $this->userModel->getById($userData['sub']);
        
        if (!$user) {
            ApiResponse::notFound('User');
        }
        
        ApiResponse::success([
            'user' => $user,
            'token_info' => [
                'expires_at' => date('Y-m-d H:i:s', $userData['exp'])
            ]
        ]);
    }
    
    /**
     * Handle POST requests (login, register)
     * 
     * @param array $data Request data
     */
    public function create($data) {
        $action = isset($data['action']) ? $data['action'] : '';
        
        switch ($action) {
            case 'login':
                $this->login($data);
                break;
            case 'register':
                $this->register($data);
                break;
            default:
                ApiResponse::error('Invalid action', 400);
        }
    }
    
    /**
     * Handle login
     * 
     * @param array $data Login data
     */
    private function login($data) {
        // Validate required fields
        if (!isset($data['username']) || !isset($data['password'])) {
            ApiResponse::validationError([
                'username' => isset($data['username']) ? null : 'Username is required',
                'password' => isset($data['password']) ? null : 'Password is required'
            ]);
        }
        
        // Authenticate user
        $user = $this->userModel->authenticate($data['username'], $data['password']);
        
        if (!$user) {
            ApiResponse::error('Invalid username or password', 401);
        }
        
        // Generate JWT token
        $token = JWTHandler::generateToken($user);
        
        // Return user data and token
        ApiResponse::success([
            'user' => $user,
            'token' => $token
        ]);
    }
    
    /**
     * Handle registration
     * 
     * @param array $data Registration data
     */
    private function register($data) {
        // Validate required fields
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
        
        // Generate JWT token
        $token = JWTHandler::generateToken($user);
        
        // Return user data and token
        ApiResponse::success([
            'user' => $user,
            'token' => $token
        ], 201);
    }
    
    /**
     * Handle PUT requests (update)
     * Not used for this controller
     */
    public function update($id, $data) {
        ApiResponse::error('Method not allowed', 405);
    }
    
    /**
     * Handle DELETE requests (logout)
     * Not used for this controller since JWTs are stateless
     */
    public function delete($id) {
        ApiResponse::error('Method not allowed', 405);
    }
    
    /**
     * Handle GET requests for listing
     * Not used for this controller
     */
    public function list($params) {
        ApiResponse::error('Method not allowed', 405);
    }
} 