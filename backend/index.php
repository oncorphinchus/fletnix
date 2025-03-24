<?php
/**
 * Fletnix Backend - Main Entry Point
 */

// Set content type to JSON for all responses
header('Content-Type: application/json');

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Return basic information about the API
echo json_encode([
    'name' => 'Fletnix API',
    'version' => '1.0.0',
    'description' => 'Fletnix self-hosted media server backend',
    'endpoints' => [
        '/api' => 'API information',
        '/api/auth' => 'Authentication',
        '/api/users' => 'User management',
        '/api/media' => 'Media management',
        '/api/history' => 'Viewing history',
        '/api/jellyfin' => 'Jellyfin integration'
    ],
    'documentation' => '/docs',
    'status' => 'operational'
], JSON_PRETTY_PRINT); 