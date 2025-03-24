<?php
/**
 * History Controller
 */

require_once __DIR__ . '/../models/History.php';
require_once __DIR__ . '/../models/Media.php';
require_once __DIR__ . '/../../helpers/JWTHandler.php';
require_once __DIR__ . '/../../helpers/ApiResponse.php';

class HistoryController {
    private $historyModel;
    private $mediaModel;
    
    public function __construct() {
        $this->historyModel = new History();
        $this->mediaModel = new Media();
    }
    
    /**
     * Handle GET requests for user's viewing history
     * 
     * @param array $params Query parameters
     */
    public function list($params) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        $userId = $userData['sub'];
        
        // Get user's viewing history
        $history = $this->historyModel->getByUser($userId, $params);
        $count = $this->historyModel->countByUser($userId);
        
        $result = [
            'items' => $history,
            'total' => $count,
            'limit' => isset($params['limit']) ? intval($params['limit']) : 20,
            'offset' => isset($params['offset']) ? intval($params['offset']) : 0
        ];
        
        ApiResponse::success($result);
    }
    
    /**
     * Handle GET requests for a specific history entry
     * 
     * @param string $id History ID
     * @param array $path Additional path segments
     * @param array $params Query parameters
     */
    public function get($id, $path, $params) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Get history entry
        $history = $this->historyModel->getById($id);
        
        if (!$history) {
            ApiResponse::notFound('History entry');
        }
        
        // Check if the history belongs to the authenticated user or user is admin
        if ($history['user_id'] != $userData['sub'] && $userData['role'] !== 'admin') {
            ApiResponse::forbidden('You do not have permission to access this resource');
        }
        
        ApiResponse::success($history);
    }
    
    /**
     * Handle POST requests to create or update a history entry
     * 
     * @param array $data Request data
     */
    public function create($data) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Validate required fields
        $errors = [];
        
        if (!isset($data['media_id']) || empty($data['media_id'])) {
            $errors['media_id'] = 'Media ID is required';
        } else {
            // Check if media exists
            $media = $this->mediaModel->getById($data['media_id']);
            if (!$media) {
                $errors['media_id'] = 'Media not found';
            }
        }
        
        if (!isset($data['progress']) || !is_numeric($data['progress'])) {
            $errors['progress'] = 'Valid progress is required (in seconds)';
        }
        
        if (!empty($errors)) {
            ApiResponse::validationError($errors);
        }
        
        // Set user ID to the authenticated user
        $data['user_id'] = $userData['sub'];
        
        // Create or update history entry
        $result = $this->historyModel->upsert($data);
        
        if (!$result) {
            ApiResponse::error('Failed to save viewing history', 500);
        }
        
        // If it's a new record, get the history entry by ID
        if (is_numeric($result)) {
            $history = $this->historyModel->getById($result);
        } 
        // If it's an update (returns true), get by media and user
        else {
            $history = $this->historyModel->getByMediaAndUser($data['media_id'], $data['user_id']);
        }
        
        ApiResponse::success($history, 201);
    }
    
    /**
     * Handle DELETE requests to delete a history entry
     * 
     * @param string $id History ID
     */
    public function delete($id) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Get history entry
        $history = $this->historyModel->getById($id);
        
        if (!$history) {
            ApiResponse::notFound('History entry');
        }
        
        // Check if the history belongs to the authenticated user or user is admin
        if ($history['user_id'] != $userData['sub'] && $userData['role'] !== 'admin') {
            ApiResponse::forbidden('You do not have permission to delete this resource');
        }
        
        // Delete history entry
        $success = $this->historyModel->delete($id);
        
        if (!$success) {
            ApiResponse::error('Failed to delete history entry', 500);
        }
        
        ApiResponse::success(null, 200, 'History entry deleted successfully');
    }
    
    /**
     * Handle DELETE requests to delete all history for a user
     * Special path: /history/clear
     * 
     * @param array $data Request data
     */
    public function clear($data) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Users can only clear their own history unless they are admins
        $userId = isset($data['user_id']) ? $data['user_id'] : $userData['sub'];
        
        if ($userId != $userData['sub'] && $userData['role'] !== 'admin') {
            ApiResponse::forbidden('You do not have permission to clear history for this user');
        }
        
        // Clear user's history
        $success = $this->historyModel->deleteByUser($userId);
        
        if (!$success) {
            ApiResponse::error('Failed to clear viewing history', 500);
        }
        
        ApiResponse::success(null, 200, 'Viewing history cleared successfully');
    }
    
    /**
     * Handle GET requests for media progress
     * Special path: /history/progress/{mediaId}
     * 
     * @param string $mediaId Media ID
     */
    public function getProgress($mediaId) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Get viewing progress for the media
        $history = $this->historyModel->getByMediaAndUser($mediaId, $userData['sub']);
        
        if (!$history) {
            // If no history exists, return zero progress
            ApiResponse::success(['progress' => 0]);
        }
        
        ApiResponse::success(['progress' => (int)$history['progress']]);
    }
} 