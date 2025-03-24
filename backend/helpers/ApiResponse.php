<?php
/**
 * ApiResponse - Helper class for standardized API responses
 */

class ApiResponse {
    /**
     * Send a success response with data
     * 
     * @param mixed $data The data to send
     * @param int $status HTTP status code
     * @param string $message Optional success message
     */
    public static function success($data = null, $status = 200, $message = 'Success') {
        self::send([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $status);
    }
    
    /**
     * Send an error response with message
     * 
     * @param string $message Error message
     * @param int $status HTTP status code
     * @param mixed $errors Optional additional error details
     */
    public static function error($message, $status = 400, $errors = null) {
        $response = [
            'status' => 'error',
            'message' => $message
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        self::send($response, $status);
    }
    
    /**
     * Send a not found response
     * 
     * @param string $resource The resource that was not found
     */
    public static function notFound($resource = 'Resource') {
        self::error("{$resource} not found", 404);
    }
    
    /**
     * Send a validation error response
     * 
     * @param array $errors Validation errors
     */
    public static function validationError($errors) {
        self::error('Validation failed', 422, $errors);
    }
    
    /**
     * Send an unauthorized response
     * 
     * @param string $message Error message
     */
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, 401);
    }
    
    /**
     * Send a forbidden response
     * 
     * @param string $message Error message
     */
    public static function forbidden($message = 'Forbidden') {
        self::error($message, 403);
    }
    
    /**
     * Send the response with appropriate headers
     * 
     * @param array $data Response data
     * @param int $status HTTP status code
     */
    private static function send($data, $status) {
        http_response_code($status);
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
} 