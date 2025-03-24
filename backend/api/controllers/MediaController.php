<?php
/**
 * Media Controller
 */

require_once __DIR__ . '/../models/Media.php';

class MediaController {
    private $mediaModel;
    
    public function __construct() {
        $this->mediaModel = new Media();
    }
    
    /**
     * Handle GET requests for a specific media item
     * 
     * @param string $id Media ID
     * @param array $path Additional path segments
     * @param array $params Query parameters
     */
    public function get($id, $path, $params) {
        $mediaItem = $this->mediaModel->getById($id);
        
        if (!$mediaItem) {
            ApiResponse::notFound('Media');
        }
        
        // Handle additional paths
        if (!empty($path)) {
            switch ($path[0]) {
                case 'stream':
                    $this->streamMedia($mediaItem);
                    break;
                case 'poster':
                    $this->servePoster($mediaItem);
                    break;
                case 'backdrop':
                    $this->serveBackdrop($mediaItem);
                    break;
                default:
                    ApiResponse::error('Invalid path', 400);
            }
        } else {
            // Return media details
            ApiResponse::success($mediaItem);
        }
    }
    
    /**
     * Handle GET requests for listing media items
     * 
     * @param array $params Query parameters
     */
    public function list($params) {
        // Check if it's a search request
        if (isset($params['search']) && !empty($params['search'])) {
            $result = $this->mediaModel->search($params['search'], $params);
            ApiResponse::success($result);
        }
        
        // Check if it's a category request
        if (isset($params['category']) && !empty($params['category'])) {
            $result = $this->mediaModel->getByCategory($params['category'], $params);
            ApiResponse::success($result);
        }
        
        // Check if it's a recent items request
        if (isset($params['recent']) && $params['recent'] === 'true') {
            $limit = isset($params['limit']) ? intval($params['limit']) : 10;
            $result = $this->mediaModel->getRecent($limit);
            ApiResponse::success(['items' => $result]);
        }
        
        // Default: return all media with pagination
        $result = $this->mediaModel->getAll($params);
        ApiResponse::success($result);
    }
    
    /**
     * Handle POST requests to create a new media item
     * 
     * @param array $data Request data
     */
    public function create($data) {
        // Check if user is authenticated and has admin role
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData || $userData['role'] !== 'admin') {
            ApiResponse::forbidden('Only admins can create media items');
        }
        
        // Validate required fields
        $errors = $this->validateMediaData($data);
        
        if (!empty($errors)) {
            ApiResponse::validationError($errors);
        }
        
        // Create the media item
        $mediaId = $this->mediaModel->create($data);
        
        if (!$mediaId) {
            ApiResponse::error('Failed to create media item', 500);
        }
        
        // Get the created media item
        $mediaItem = $this->mediaModel->getById($mediaId);
        
        ApiResponse::success($mediaItem, 201);
    }
    
    /**
     * Handle PUT requests to update a media item
     * 
     * @param string $id Media ID
     * @param array $data Request data
     */
    public function update($id, $data) {
        // Check if user is authenticated and has admin role
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData || $userData['role'] !== 'admin') {
            ApiResponse::forbidden('Only admins can update media items');
        }
        
        // Check if media exists
        $mediaItem = $this->mediaModel->getById($id);
        
        if (!$mediaItem) {
            ApiResponse::notFound('Media');
        }
        
        // Update the media item
        $success = $this->mediaModel->update($id, $data);
        
        if (!$success) {
            ApiResponse::error('Failed to update media item', 500);
        }
        
        // Get the updated media item
        $updatedItem = $this->mediaModel->getById($id);
        
        ApiResponse::success($updatedItem);
    }
    
    /**
     * Handle DELETE requests to delete a media item
     * 
     * @param string $id Media ID
     */
    public function delete($id) {
        // Check if user is authenticated and has admin role
        $userData = JWTHandler::getAuthUser();
        
        if (!$userData || $userData['role'] !== 'admin') {
            ApiResponse::forbidden('Only admins can delete media items');
        }
        
        // Check if media exists
        $mediaItem = $this->mediaModel->getById($id);
        
        if (!$mediaItem) {
            ApiResponse::notFound('Media');
        }
        
        // Delete the media item
        $success = $this->mediaModel->delete($id);
        
        if (!$success) {
            ApiResponse::error('Failed to delete media item', 500);
        }
        
        ApiResponse::success(null, 200, 'Media item deleted successfully');
    }
    
    /**
     * Stream a media file
     * 
     * @param array $mediaItem Media item data
     */
    private function streamMedia($mediaItem) {
        $filePath = $mediaItem['file_path'];
        $fullPath = realpath(__DIR__ . '/../../media/' . $filePath);
        
        if (!file_exists($fullPath)) {
            ApiResponse::error('Media file not found', 404);
        }
        
        // Get file info
        $fileSize = filesize($fullPath);
        $fileExtension = pathinfo($fullPath, PATHINFO_EXTENSION);
        
        // Set content type based on extension
        $contentType = 'video/mp4'; // Default
        
        switch (strtolower($fileExtension)) {
            case 'mp4':
                $contentType = 'video/mp4';
                break;
            case 'webm':
                $contentType = 'video/webm';
                break;
            case 'ogg':
            case 'ogv':
                $contentType = 'video/ogg';
                break;
            case 'mkv':
                $contentType = 'video/x-matroska';
                break;
            case 'avi':
                $contentType = 'video/x-msvideo';
                break;
        }
        
        // Support for range requests (partial content)
        $rangeRequest = false;
        $rangeStart = 0;
        $rangeEnd = $fileSize - 1;
        
        if (isset($_SERVER['HTTP_RANGE'])) {
            $rangeRequest = true;
            
            preg_match('/bytes=(\d+)-(\d+)?/', $_SERVER['HTTP_RANGE'], $matches);
            
            $rangeStart = intval($matches[1]);
            
            if (isset($matches[2])) {
                $rangeEnd = intval($matches[2]);
            }
        }
        
        // Set headers
        header('Content-Type: ' . $contentType);
        header('Accept-Ranges: bytes');
        
        if ($rangeRequest) {
            // Partial content response
            http_response_code(206);
            header("Content-Range: bytes {$rangeStart}-{$rangeEnd}/{$fileSize}");
            header('Content-Length: ' . ($rangeEnd - $rangeStart + 1));
        } else {
            // Full content response
            header('Content-Length: ' . $fileSize);
        }
        
        // Stream the file
        $fp = fopen($fullPath, 'rb');
        
        if ($rangeRequest) {
            fseek($fp, $rangeStart);
        }
        
        $buffer = 1024 * 8;
        $bytesToRead = $rangeEnd - $rangeStart + 1;
        
        while (!feof($fp) && $bytesToRead > 0) {
            $bytesToSend = min($buffer, $bytesToRead);
            $data = fread($fp, $bytesToSend);
            echo $data;
            $bytesToRead -= strlen($data);
            flush();
        }
        
        fclose($fp);
        exit;
    }
    
    /**
     * Serve a poster image
     * 
     * @param array $mediaItem Media item data
     */
    private function servePoster($mediaItem) {
        if (empty($mediaItem['poster_path'])) {
            ApiResponse::error('Poster not found', 404);
        }
        
        $this->serveImage($mediaItem['poster_path']);
    }
    
    /**
     * Serve a backdrop image
     * 
     * @param array $mediaItem Media item data
     */
    private function serveBackdrop($mediaItem) {
        if (empty($mediaItem['backdrop_path'])) {
            ApiResponse::error('Backdrop not found', 404);
        }
        
        $this->serveImage($mediaItem['backdrop_path']);
    }
    
    /**
     * Serve an image file
     * 
     * @param string $imagePath Path to the image
     */
    private function serveImage($imagePath) {
        $fullPath = realpath(__DIR__ . '/../../media/' . $imagePath);
        
        if (!file_exists($fullPath)) {
            ApiResponse::error('Image file not found', 404);
        }
        
        // Get file info
        $fileExtension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        
        // Set content type based on extension
        $contentType = 'image/jpeg'; // Default
        
        switch ($fileExtension) {
            case 'jpg':
            case 'jpeg':
                $contentType = 'image/jpeg';
                break;
            case 'png':
                $contentType = 'image/png';
                break;
            case 'gif':
                $contentType = 'image/gif';
                break;
            case 'webp':
                $contentType = 'image/webp';
                break;
        }
        
        // Set headers
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($fullPath));
        header('Cache-Control: max-age=86400'); // Cache for a day
        
        // Output the file
        readfile($fullPath);
        exit;
    }
    
    /**
     * Validate media data
     * 
     * @param array $data Media data
     * @return array Validation errors
     */
    private function validateMediaData($data) {
        $errors = [];
        
        if (!isset($data['title']) || empty($data['title'])) {
            $errors['title'] = 'Title is required';
        }
        
        if (!isset($data['type']) || empty($data['type'])) {
            $errors['type'] = 'Type is required';
        } elseif (!in_array($data['type'], ['movie', 'tvshow', 'episode'])) {
            $errors['type'] = 'Type must be movie, tvshow, or episode';
        }
        
        if (!isset($data['file_path']) || empty($data['file_path'])) {
            $errors['file_path'] = 'File path is required';
        }
        
        if (isset($data['release_year'])) {
            if (!is_numeric($data['release_year']) || $data['release_year'] < 1900 || $data['release_year'] > date('Y') + 5) {
                $errors['release_year'] = 'Release year must be a valid year';
            }
        }
        
        if (isset($data['duration'])) {
            if (!is_numeric($data['duration']) || $data['duration'] <= 0) {
                $errors['duration'] = 'Duration must be a positive number';
            }
        }
        
        // Type-specific validations
        if ($data['type'] === 'tvshow' && isset($data['tvshow_details'])) {
            if (!isset($data['tvshow_details']['total_seasons']) || !is_numeric($data['tvshow_details']['total_seasons']) || $data['tvshow_details']['total_seasons'] <= 0) {
                $errors['tvshow_details.total_seasons'] = 'Total seasons must be a positive number';
            }
            
            if (!isset($data['tvshow_details']['total_episodes']) || !is_numeric($data['tvshow_details']['total_episodes']) || $data['tvshow_details']['total_episodes'] <= 0) {
                $errors['tvshow_details.total_episodes'] = 'Total episodes must be a positive number';
            }
        }
        
        if ($data['type'] === 'episode' && isset($data['episode_details'])) {
            if (!isset($data['episode_details']['tvshow_id']) || !is_numeric($data['episode_details']['tvshow_id']) || $data['episode_details']['tvshow_id'] <= 0) {
                $errors['episode_details.tvshow_id'] = 'TV show ID is required';
            }
            
            if (!isset($data['episode_details']['season_number']) || !is_numeric($data['episode_details']['season_number']) || $data['episode_details']['season_number'] <= 0) {
                $errors['episode_details.season_number'] = 'Season number must be a positive number';
            }
            
            if (!isset($data['episode_details']['episode_number']) || !is_numeric($data['episode_details']['episode_number']) || $data['episode_details']['episode_number'] <= 0) {
                $errors['episode_details.episode_number'] = 'Episode number must be a positive number';
            }
            
            if (!isset($data['episode_details']['title']) || empty($data['episode_details']['title'])) {
                $errors['episode_details.title'] = 'Episode title is required';
            }
        }
        
        return $errors;
    }

    /**
     * Scan local media directory and return available files
     */
    public function scanLocalMedia() {
        // Check if user is authenticated
        // Temporarily disabled for testing
        // $userData = JWTHandler::getAuthUser();
        
        // if (!$userData) {
        //     ApiResponse::unauthorized();
        // }
        
        // Define directories to scan
        $mediaRoot = getenv('MEDIA_DIR') ?: '/media';
        $moviesDir = $mediaRoot . '/movies';
        $tvDir = $mediaRoot . '/tv';
        
        $response = [
            'movies' => [],
            'series' => []
        ];
        
        // Scan movies directory
        if (file_exists($moviesDir) && is_readable($moviesDir)) {
            $movieFiles = scandir($moviesDir);
            foreach ($movieFiles as $file) {
                if ($file === '.' || $file === '..') continue;
                
                $filePath = $moviesDir . '/' . $file;
                if (is_file($filePath)) {
                    // Get file extension
                    $extension = pathinfo($file, PATHINFO_EXTENSION);
                    $title = pathinfo($file, PATHINFO_FILENAME);
                    
                    // Only include video files
                    $videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'webm'];
                    if (in_array(strtolower($extension), $videoExtensions)) {
                        $response['movies'][] = [
                            'id' => 'movie_' . md5($file),
                            'title' => $this->formatTitle($title),
                            'type' => 'movie',
                            'filename' => $file,
                            'filepath' => '/api/media/file/movies/' . $file, // Path for direct access via API
                            'filesize' => filesize($filePath),
                            'thumbnailPath' => '/placeholder.jpg'
                        ];
                    }
                }
            }
        }
        
        // Scan TV directory
        if (file_exists($tvDir) && is_readable($tvDir)) {
            $tvDirs = scandir($tvDir);
            foreach ($tvDirs as $dir) {
                if ($dir === '.' || $dir === '..') continue;
                
                $dirPath = $tvDir . '/' . $dir;
                if (is_dir($dirPath)) {
                    $response['series'][] = [
                        'id' => 'series_' . md5($dir),
                        'title' => $this->formatTitle($dir),
                        'type' => 'series',
                        'foldername' => $dir,
                        'folderpath' => '/api/media/file/tv/' . $dir,
                        'thumbnailPath' => '/placeholder.jpg'
                    ];
                }
            }
        }
        
        // Add log for debugging
        error_log('Scanned media: ' . json_encode($response));
        
        ApiResponse::success($response);
    }

    /**
     * Format a filename into a nicer title
     */
    private function formatTitle($filename) {
        // Replace dots and underscores with spaces
        $title = str_replace(['_', '.'], ' ', $filename);
        
        // Capitalize first letter of each word
        $title = ucwords($title);
        
        return $title;
    }

    /**
     * Serves a local media file directly
     * 
     * @param array $path Additional path segments
     */
    public function serveMediaFile($path) {
        if (empty($path) || count($path) < 2) {
            ApiResponse::error('Invalid media path', 400);
        }
        
        $mediaType = $path[0]; // 'movies' or 'tv'
        $fileName = implode('/', array_slice($path, 1)); // Rest of the path
        
        $mediaRoot = getenv('MEDIA_DIR') ?: '/media';
        $fullPath = realpath($mediaRoot . '/' . $mediaType . '/' . $fileName);
        
        if (!$fullPath || !file_exists($fullPath) || !is_file($fullPath)) {
            error_log("File not found: $mediaRoot/$mediaType/$fileName (Resolved to: $fullPath)");
            ApiResponse::error('Media file not found', 404);
        }
        
        // Security check - make sure the file is still within our media directory
        if (strpos($fullPath, realpath($mediaRoot)) !== 0) {
            ApiResponse::error('Access denied', 403);
        }
        
        // Get file info
        $fileSize = filesize($fullPath);
        $fileExtension = pathinfo($fullPath, PATHINFO_EXTENSION);
        
        // Set content type based on extension
        $contentType = 'video/mp4'; // Default
        
        switch (strtolower($fileExtension)) {
            case 'mp4':
                $contentType = 'video/mp4';
                break;
            case 'webm':
                $contentType = 'video/webm';
                break;
            case 'ogg':
            case 'ogv':
                $contentType = 'video/ogg';
                break;
            case 'mkv':
                $contentType = 'video/x-matroska';
                break;
            case 'avi':
                $contentType = 'video/x-msvideo';
                break;
            case 'mov':
                $contentType = 'video/quicktime';
                break;
            case 'wmv':
                $contentType = 'video/x-ms-wmv';
                break;
            case 'flv':
                $contentType = 'video/x-flv';
                break;
            case 'm4v':
                $contentType = 'video/x-m4v';
                break;
            case '3gp':
                $contentType = 'video/3gpp';
                break;
        }

        // Clean output buffer to prevent any unexpected output before headers
        if (ob_get_level()) {
            ob_end_clean();
        }
        
        // Set headers
        header('Content-Type: ' . $contentType);
        header('Accept-Ranges: bytes');
        
        // Allow CORS for video files
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
        
        if (isset($_SERVER['HTTP_RANGE'])) {
            // Handle range requests
            $rangeRequest = true;
            
            preg_match('/bytes=(\d+)-(\d+)?/', $_SERVER['HTTP_RANGE'], $matches);
            
            $rangeStart = intval($matches[1]);
            
            if (isset($matches[2])) {
                $rangeEnd = intval($matches[2]);
            } else {
                $rangeEnd = $fileSize - 1;
            }
            
            // Partial content response
            http_response_code(206);
            header("Content-Range: bytes {$rangeStart}-{$rangeEnd}/{$fileSize}");
            header('Content-Length: ' . ($rangeEnd - $rangeStart + 1));
        } else {
            // Full content response
            header('Content-Length: ' . $fileSize);
        }
        
        // Stream the file
        $fp = fopen($fullPath, 'rb');
        
        if ($rangeRequest) {
            fseek($fp, $rangeStart);
            $bytesToRead = $rangeEnd - $rangeStart + 1;
        } else {
            $bytesToRead = $fileSize;
        }
        
        $buffer = 1024 * 8;
        
        while (!feof($fp) && $bytesToRead > 0) {
            $bytesToSend = min($buffer, $bytesToRead);
            $data = fread($fp, $bytesToSend);
            echo $data;
            $bytesToRead -= strlen($data);
            flush();
        }
        
        fclose($fp);
        exit;
    }
} 