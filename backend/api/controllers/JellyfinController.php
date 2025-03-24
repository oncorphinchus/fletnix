<?php
/**
 * Jellyfin Controller
 * 
 * Handles integration with the Jellyfin media server
 */

require_once __DIR__ . '/../../helpers/JWTHandler.php';
require_once __DIR__ . '/../../helpers/ApiResponse.php';

class JellyfinController {
    private $apiKey;
    private $baseUrl;
    
    public function __construct() {
        // Get Jellyfin configuration from environment variables
        $this->apiKey = getenv('JELLYFIN_API_KEY');
        $this->baseUrl = getenv('JELLYFIN_URL');
    }
    
    /**
     * Check if Jellyfin connection is configured and working
     * 
     * @return bool Connection status
     */
    private function checkConnection() {
        return !empty($this->apiKey) && !empty($this->baseUrl);
    }
    
    /**
     * Make API request to Jellyfin server
     * 
     * @param string $endpoint API endpoint
     * @param string $method HTTP method (GET, POST, etc.)
     * @param array $data Request data for POST/PUT
     * @return array Response data or false on failure
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = rtrim($this->baseUrl, '/') . '/' . ltrim($endpoint, '/');
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-MediaBrowser-Token: ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        
        if ($method === 'POST' || $method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } else if ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            error_log("Jellyfin API Error: " . $error);
            return false;
        }
        
        if ($httpCode >= 400) {
            error_log("Jellyfin API Error: HTTP Code " . $httpCode);
            error_log("Response: " . $response);
            return false;
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Handle GET requests for Jellyfin information
     * 
     * @param array $params Query parameters
     */
    public function getInfo($params = []) {
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Get system info from Jellyfin
        $info = $this->makeRequest('System/Info');
        
        if (!$info) {
            ApiResponse::error('Failed to connect to Jellyfin server', 503);
        }
        
        // Return only necessary information
        $result = [
            'version' => $info['Version'] ?? 'Unknown',
            'serverName' => $info['ServerName'] ?? 'Jellyfin',
            'operatingSystem' => $info['OperatingSystem'] ?? 'Unknown',
            'status' => 'connected'
        ];
        
        ApiResponse::success($result);
    }
    
    /**
     * Handle GET requests for Jellyfin libraries
     * 
     * @param array $params Query parameters
     */
    public function getLibraries($params = []) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Get user libraries from Jellyfin
        $libraries = $this->makeRequest('Library/VirtualFolders');
        
        if (!$libraries) {
            ApiResponse::error('Failed to fetch Jellyfin libraries', 503);
        }
        
        // Format library data
        $result = [];
        foreach ($libraries as $library) {
            $result[] = [
                'id' => $library['ItemId'] ?? '',
                'name' => $library['Name'] ?? 'Unknown Library',
                'type' => $library['CollectionType'] ?? 'mixed',
                'path' => $library['Locations'][0] ?? '',
                'itemCount' => $library['ItemCount'] ?? 0
            ];
        }
        
        ApiResponse::success($result);
    }
    
    /**
     * Handle GET requests for Jellyfin media items
     * 
     * @param array $params Query parameters (limit, offset, sortBy, sortOrder, etc.)
     */
    public function getItems($params = []) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Build query parameters
        $limit = isset($params['limit']) ? intval($params['limit']) : 20;
        $offset = isset($params['offset']) ? intval($params['offset']) : 0;
        $sortBy = isset($params['sortBy']) ? $params['sortBy'] : 'SortName';
        $sortOrder = (isset($params['sortOrder']) && strtolower($params['sortOrder']) === 'desc') ? 'Descending' : 'Ascending';
        $parentId = isset($params['parentId']) ? $params['parentId'] : null;
        $includeItemTypes = isset($params['type']) ? $params['type'] : null;
        
        // Build endpoint
        $endpoint = 'Items?';
        $endpoint .= 'Recursive=true';
        $endpoint .= '&Limit=' . $limit;
        $endpoint .= '&StartIndex=' . $offset;
        $endpoint .= '&SortBy=' . $sortBy;
        $endpoint .= '&SortOrder=' . $sortOrder;
        
        if ($parentId) {
            $endpoint .= '&ParentId=' . $parentId;
        }
        
        if ($includeItemTypes) {
            $endpoint .= '&IncludeItemTypes=' . $includeItemTypes;
        }
        
        // Get items from Jellyfin
        $response = $this->makeRequest($endpoint);
        
        if (!$response) {
            ApiResponse::error('Failed to fetch Jellyfin items', 503);
        }
        
        // Format items data
        $items = [];
        foreach ($response['Items'] as $item) {
            $items[] = [
                'id' => $item['Id'] ?? '',
                'name' => $item['Name'] ?? 'Unknown Item',
                'type' => $item['Type'] ?? 'Unknown',
                'mediaType' => $item['MediaType'] ?? null,
                'overview' => $item['Overview'] ?? null,
                'imageTags' => $item['ImageTags'] ?? [],
                'backdropImageTags' => $item['BackdropImageTags'] ?? [],
                'premiereDate' => $item['PremiereDate'] ?? null,
                'runTimeTicks' => $item['RunTimeTicks'] ?? null,
                'genres' => $item['Genres'] ?? []
            ];
        }
        
        $result = [
            'items' => $items,
            'totalRecordCount' => $response['TotalRecordCount'] ?? 0,
            'limit' => $limit,
            'offset' => $offset
        ];
        
        ApiResponse::success($result);
    }
    
    /**
     * Handle GET requests for a specific Jellyfin item
     * 
     * @param string $id Item ID
     * @param array $path Additional path segments
     * @param array $params Query parameters
     */
    public function getItem($id, $path, $params) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Get item from Jellyfin
        $item = $this->makeRequest('Items/' . $id);
        
        if (!$item) {
            ApiResponse::notFound('Jellyfin item');
        }
        
        // Return detailed item information
        ApiResponse::success($item);
    }
    
    /**
     * Handle GET requests for Jellyfin image URLs
     * 
     * @param string $id Item ID
     * @param array $path Additional path segments (image type)
     * @param array $params Query parameters (width, height, etc.)
     */
    public function getImageUrl($id, $path, $params) {
        // Determine image type
        $imageType = $path[1] ?? 'Primary';
        $width = isset($params['width']) ? intval($params['width']) : 400;
        $height = isset($params['height']) ? intval($params['height']) : null;
        
        // Build image URL
        $url = rtrim($this->baseUrl, '/') . '/Items/' . $id . '/Images/' . $imageType;
        $url .= '?api_key=' . $this->apiKey;
        
        if ($width) {
            $url .= '&width=' . $width;
        }
        
        if ($height) {
            $url .= '&height=' . $height;
        }
        
        $result = ['url' => $url];
        
        ApiResponse::success($result);
    }
    
    /**
     * Handle GET requests for Jellyfin playback URL
     * 
     * @param string $id Item ID
     * @param array $params Query parameters
     */
    public function getPlaybackUrl($id, $params = []) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Get stream parameters
        $container = isset($params['container']) ? $params['container'] : 'mp4';
        $mediaSourceId = isset($params['mediaSourceId']) ? $params['mediaSourceId'] : $id;
        $audioCodec = isset($params['audioCodec']) ? $params['audioCodec'] : null;
        $videoCodec = isset($params['videoCodec']) ? $params['videoCodec'] : null;
        
        // Build streaming URL
        $url = rtrim($this->baseUrl, '/') . '/Videos/' . $id . '/stream';
        $url .= '?api_key=' . $this->apiKey;
        $url .= '&Static=true';
        $url .= '&Container=' . $container;
        $url .= '&MediaSourceId=' . $mediaSourceId;
        
        if ($audioCodec) {
            $url .= '&AudioCodec=' . $audioCodec;
        }
        
        if ($videoCodec) {
            $url .= '&VideoCodec=' . $videoCodec;
        }
        
        // Return streaming URL
        $result = [
            'url' => $url,
            'type' => 'video/' . $container
        ];
        
        ApiResponse::success($result);
    }
    
    /**
     * Handle POST requests to report playback started
     * 
     * @param array $data Request data
     */
    public function reportPlaybackStart($data) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Validate required fields
        if (!isset($data['itemId']) || empty($data['itemId'])) {
            ApiResponse::validationError(['itemId' => 'Item ID is required']);
        }
        
        // Prepare playback info
        $playbackInfo = [
            'ItemId' => $data['itemId'],
            'SessionId' => $userData['sub'] . '-' . time(),
            'MediaSourceId' => $data['mediaSourceId'] ?? $data['itemId'],
            'AudioStreamIndex' => $data['audioStreamIndex'] ?? 0,
            'SubtitleStreamIndex' => $data['subtitleStreamIndex'] ?? null,
            'IsPaused' => false,
            'PositionTicks' => $data['positionTicks'] ?? 0,
            'PlaybackStartTimeTicks' => $data['playbackStartTimeTicks'] ?? 0,
            'VolumeLevel' => $data['volumeLevel'] ?? 100,
            'IsMuted' => $data['isMuted'] ?? false
        ];
        
        // Report playback started to Jellyfin
        $response = $this->makeRequest('Sessions/Playing', 'POST', $playbackInfo);
        
        ApiResponse::success(['status' => 'reported']);
    }
    
    /**
     * Handle POST requests to report playback progress
     * 
     * @param array $data Request data
     */
    public function reportPlaybackProgress($data) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Validate required fields
        if (!isset($data['itemId']) || empty($data['itemId'])) {
            ApiResponse::validationError(['itemId' => 'Item ID is required']);
        }
        
        if (!isset($data['positionTicks']) || !is_numeric($data['positionTicks'])) {
            ApiResponse::validationError(['positionTicks' => 'Position is required']);
        }
        
        // Prepare playback info
        $playbackInfo = [
            'ItemId' => $data['itemId'],
            'SessionId' => $userData['sub'] . '-' . time(),
            'MediaSourceId' => $data['mediaSourceId'] ?? $data['itemId'],
            'AudioStreamIndex' => $data['audioStreamIndex'] ?? 0,
            'SubtitleStreamIndex' => $data['subtitleStreamIndex'] ?? null,
            'IsPaused' => $data['isPaused'] ?? false,
            'PositionTicks' => $data['positionTicks'],
            'PlaybackStartTimeTicks' => $data['playbackStartTimeTicks'] ?? 0,
            'VolumeLevel' => $data['volumeLevel'] ?? 100,
            'IsMuted' => $data['isMuted'] ?? false,
            'EventName' => 'timeupdate'
        ];
        
        // Report playback progress to Jellyfin
        $response = $this->makeRequest('Sessions/Playing/Progress', 'POST', $playbackInfo);
        
        ApiResponse::success(['status' => 'reported']);
    }
    
    /**
     * Handle POST requests to report playback stopped
     * 
     * @param array $data Request data
     */
    public function reportPlaybackStopped($data) {
        // Check if user is authenticated
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData) {
            ApiResponse::unauthorized();
        }
        
        // Check if Jellyfin is configured
        if (!$this->checkConnection()) {
            ApiResponse::error('Jellyfin connection not configured', 503);
        }
        
        // Validate required fields
        if (!isset($data['itemId']) || empty($data['itemId'])) {
            ApiResponse::validationError(['itemId' => 'Item ID is required']);
        }
        
        if (!isset($data['positionTicks']) || !is_numeric($data['positionTicks'])) {
            ApiResponse::validationError(['positionTicks' => 'Position is required']);
        }
        
        // Prepare playback info
        $playbackInfo = [
            'ItemId' => $data['itemId'],
            'SessionId' => $userData['sub'] . '-' . time(),
            'MediaSourceId' => $data['mediaSourceId'] ?? $data['itemId'],
            'PositionTicks' => $data['positionTicks'],
            'PlaybackStartTimeTicks' => $data['playbackStartTimeTicks'] ?? 0
        ];
        
        // Report playback stopped to Jellyfin
        $response = $this->makeRequest('Sessions/Playing/Stopped', 'POST', $playbackInfo);
        
        ApiResponse::success(['status' => 'reported']);
    }
} 