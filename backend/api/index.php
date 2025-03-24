<?php
/**
 * API Router
 * 
 * This file handles all incoming API requests and routes them to the appropriate controller
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include required files
require_once __DIR__ . '/../helpers/ApiResponse.php';

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path from URI
$basePath = '/api';
$uri = substr($uri, strlen($basePath));

// Split URI into segments
$segments = explode('/', trim($uri, '/'));

// Get controller, action and ID from URI
$controllerName = ucfirst(isset($segments[0]) ? $segments[0] : 'index');
$id = isset($segments[1]) && !empty($segments[1]) ? $segments[1] : null;
$action = isset($segments[2]) ? $segments[2] : null;

// Additional path segments
$path = array_slice($segments, $id ? 2 : 1);

// Handle empty controller name
if (empty($controllerName) || $controllerName === 'Index') {
    ApiResponse::success([
        'message' => 'Welcome to Fletnix API',
        'endpoints' => [
            '/api/auth',
            '/api/users',
            '/api/media',
            '/api/history',
            '/api/jellyfin'
        ],
        'version' => '1.0.0'
    ]);
}

// Map controller names to file names
$controllerMap = [
    'Auth' => 'AuthController',
    'Users' => 'UserController',
    'User' => 'UserController',
    'Media' => 'MediaController',
    'History' => 'HistoryController',
    'Jellyfin' => 'JellyfinController'
];

// Determine controller file name
$controllerFile = isset($controllerMap[$controllerName]) ? $controllerMap[$controllerName] : $controllerName . 'Controller';

// Check if controller file exists
if (!file_exists(__DIR__ . '/controllers/' . $controllerFile . '.php')) {
    ApiResponse::notFound('Controller');
}

// Include controller file
require_once __DIR__ . '/controllers/' . $controllerFile . '.php';

// Create controller instance
$controllerClass = str_replace('Controller', '', $controllerFile) . 'Controller';
$controller = new $controllerClass();

// Get query parameters
$params = $_GET;

// Get request body for POST and PUT requests
$body = null;
if ($method === 'POST' || $method === 'PUT') {
    $input = file_get_contents('php://input');
    if (!empty($input)) {
        $body = json_decode($input, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            ApiResponse::error('Invalid JSON payload', 400);
        }
    } else {
        $body = $_POST;
    }
}

// Route the request based on method and URI
try {
    // Special paths
    if ($controllerName === 'Auth') {
        if ($id === 'login' && $method === 'POST') {
            $controller->login($body);
        } else if ($id === 'register' && $method === 'POST') {
            $controller->register($body);
        } else if ($id === 'refresh' && $method === 'POST') {
            $controller->refresh($body);
        } else {
            ApiResponse::notFound('Endpoint');
        }
    } else if ($controllerName === 'History' && $id === 'clear' && $method === 'DELETE') {
        $controller->clear($body ?: []);
    } else if ($controllerName === 'History' && $id === 'progress' && isset($path[0]) && $method === 'GET') {
        $controller->getProgress($path[0]);
    } else if ($controllerName === 'Jellyfin') {
        if ($id === 'info' && $method === 'GET') {
            $controller->getInfo($params);
        } else if ($id === 'libraries' && $method === 'GET') {
            $controller->getLibraries($params);
        } else if ($id === 'items' && $method === 'GET') {
            $controller->getItems($params);
        } else if ($id && $action === 'playback' && $method === 'GET') {
            $controller->getPlaybackUrl($id, $params);
        } else if ($id && $action === 'image') {
            $controller->getImageUrl($id, $path, $params);
        } else if ($id && $action === 'start' && $method === 'POST') {
            $controller->reportPlaybackStart($body);
        } else if ($id && $action === 'progress' && $method === 'POST') {
            $controller->reportPlaybackProgress($body);
        } else if ($id && $action === 'stop' && $method === 'POST') {
            $controller->reportPlaybackStopped($body);
        } else if ($id && $method === 'GET') {
            $controller->getItem($id, $path, $params);
        } else {
            ApiResponse::notFound('Endpoint');
        }
    } else {
        // Standard CRUD routes
        switch ($method) {
            case 'GET':
                if ($id) {
                    $controller->get($id, $path, $params);
                } else {
                    $controller->list($params);
                }
                break;
            case 'POST':
                $controller->create($body);
                break;
            case 'PUT':
                if (!$id) {
                    ApiResponse::error('ID is required for update operations', 400);
                }
                $controller->update($id, $body);
                break;
            case 'DELETE':
                if (!$id) {
                    ApiResponse::error('ID is required for delete operations', 400);
                }
                $controller->delete($id);
                break;
            default:
                ApiResponse::error('Method not allowed', 405);
                break;
        }
    }
} catch (Exception $e) {
    ApiResponse::error('Server error: ' . $e->getMessage(), 500);
} 