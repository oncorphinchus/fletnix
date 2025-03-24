<?php
/**
 * Media Model
 */

class Media {
    private $conn;
    private $table = 'media';
    
    public function __construct() {
        $this->conn = Database::getConnection();
    }
    
    /**
     * Get all media items with filtering and pagination
     * 
     * @param array $params Query parameters
     * @return array Media items
     */
    public function getAll($params = []) {
        $limit = isset($params['limit']) ? intval($params['limit']) : 20;
        $offset = isset($params['offset']) ? intval($params['offset']) : 0;
        $type = isset($params['type']) ? $params['type'] : null;
        $search = isset($params['search']) ? $params['search'] : null;
        $category = isset($params['category']) ? intval($params['category']) : null;
        
        // Start building the query
        $query = "SELECT m.*, 
                 GROUP_CONCAT(DISTINCT c.name) as categories
                 FROM {$this->table} m
                 LEFT JOIN media_categories mc ON m.id = mc.media_id
                 LEFT JOIN categories c ON mc.category_id = c.id";
        
        $whereConditions = [];
        $queryParams = [];
        
        // Add type filter
        if ($type) {
            $whereConditions[] = "m.type = :type";
            $queryParams[':type'] = $type;
        }
        
        // Add search filter
        if ($search) {
            $whereConditions[] = "(m.title LIKE :search OR m.description LIKE :search)";
            $queryParams[':search'] = "%{$search}%";
        }
        
        // Add category filter
        if ($category) {
            $whereConditions[] = "mc.category_id = :category";
            $queryParams[':category'] = $category;
        }
        
        // Add WHERE clause if needed
        if (!empty($whereConditions)) {
            $query .= " WHERE " . implode(" AND ", $whereConditions);
        }
        
        // Group by media ID to avoid duplicates
        $query .= " GROUP BY m.id";
        
        // Add sorting
        $query .= " ORDER BY m.created_at DESC";
        
        // Add pagination
        $query .= " LIMIT :limit OFFSET :offset";
        $queryParams[':limit'] = $limit;
        $queryParams[':offset'] = $offset;
        
        $stmt = $this->conn->prepare($query);
        
        // Bind parameters
        foreach ($queryParams as $key => $value) {
            if (is_int($value)) {
                $stmt->bindValue($key, $value, PDO::PARAM_INT);
            } else {
                $stmt->bindValue($key, $value);
            }
        }
        
        $stmt->execute();
        $result = $stmt->fetchAll();
        
        // Get total count for pagination
        $countQuery = "SELECT COUNT(DISTINCT m.id) as total FROM {$this->table} m";
        
        if ($category) {
            $countQuery .= " LEFT JOIN media_categories mc ON m.id = mc.media_id";
        }
        
        if (!empty($whereConditions)) {
            $countQuery .= " WHERE " . implode(" AND ", $whereConditions);
        }
        
        $countStmt = $this->conn->prepare($countQuery);
        
        // Bind parameters for count query
        foreach ($queryParams as $key => $value) {
            if ($key !== ':limit' && $key !== ':offset') {
                if (is_int($value)) {
                    $countStmt->bindValue($key, $value, PDO::PARAM_INT);
                } else {
                    $countStmt->bindValue($key, $value);
                }
            }
        }
        
        $countStmt->execute();
        $totalCount = $countStmt->fetch()['total'];
        
        // Process results to include pagination info
        return [
            'items' => $result,
            'pagination' => [
                'total' => $totalCount,
                'limit' => $limit,
                'offset' => $offset
            ]
        ];
    }
    
    /**
     * Get a single media item by ID
     * 
     * @param int $id Media ID
     * @return array|false Media item data or false if not found
     */
    public function getById($id) {
        // Main media query
        $query = "SELECT m.* FROM {$this->table} m WHERE m.id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        
        $media = $stmt->fetch();
        
        if (!$media) {
            return false;
        }
        
        // Get categories
        $categoriesQuery = "SELECT c.id, c.name 
                          FROM categories c
                          JOIN media_categories mc ON c.id = mc.category_id
                          WHERE mc.media_id = :id";
        $categoriesStmt = $this->conn->prepare($categoriesQuery);
        $categoriesStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $categoriesStmt->execute();
        $media['categories'] = $categoriesStmt->fetchAll();
        
        // If it's a TV show, get additional details
        if ($media['type'] === 'tvshow') {
            $tvshowQuery = "SELECT * FROM tvshows WHERE media_id = :id";
            $tvshowStmt = $this->conn->prepare($tvshowQuery);
            $tvshowStmt->bindParam(':id', $id, PDO::PARAM_INT);
            $tvshowStmt->execute();
            $media['tvshow_details'] = $tvshowStmt->fetch();
        }
        
        // If it's an episode, get additional details
        if ($media['type'] === 'episode') {
            $episodeQuery = "SELECT e.*, m2.title as show_title 
                           FROM episodes e
                           JOIN media m2 ON e.tvshow_id = m2.id
                           WHERE e.media_id = :id";
            $episodeStmt = $this->conn->prepare($episodeQuery);
            $episodeStmt->bindParam(':id', $id, PDO::PARAM_INT);
            $episodeStmt->execute();
            $media['episode_details'] = $episodeStmt->fetch();
        }
        
        return $media;
    }
    
    /**
     * Create a new media item
     * 
     * @param array $data Media data
     * @return int|false New media ID or false on failure
     */
    public function create($data) {
        $this->conn->beginTransaction();
        
        try {
            // Insert basic media info
            $query = "INSERT INTO {$this->table} 
                     (title, description, type, release_year, duration, file_path, poster_path, backdrop_path, jellyfin_id) 
                     VALUES 
                     (:title, :description, :type, :release_year, :duration, :file_path, :poster_path, :backdrop_path, :jellyfin_id)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':type', $data['type']);
            $stmt->bindParam(':release_year', $data['release_year'], PDO::PARAM_INT);
            $stmt->bindParam(':duration', $data['duration'], PDO::PARAM_INT);
            $stmt->bindParam(':file_path', $data['file_path']);
            $stmt->bindParam(':poster_path', $data['poster_path']);
            $stmt->bindParam(':backdrop_path', $data['backdrop_path']);
            $stmt->bindParam(':jellyfin_id', $data['jellyfin_id']);
            
            $stmt->execute();
            $mediaId = $this->conn->lastInsertId();
            
            // Add categories if provided
            if (isset($data['categories']) && is_array($data['categories'])) {
                foreach ($data['categories'] as $categoryId) {
                    $categoryQuery = "INSERT INTO media_categories (media_id, category_id) VALUES (:media_id, :category_id)";
                    $categoryStmt = $this->conn->prepare($categoryQuery);
                    $categoryStmt->bindParam(':media_id', $mediaId, PDO::PARAM_INT);
                    $categoryStmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
                    $categoryStmt->execute();
                }
            }
            
            // Add TV show details if it's a TV show
            if ($data['type'] === 'tvshow' && isset($data['tvshow_details'])) {
                $tvshowQuery = "INSERT INTO tvshows (media_id, total_seasons, total_episodes, status) 
                               VALUES (:media_id, :total_seasons, :total_episodes, :status)";
                $tvshowStmt = $this->conn->prepare($tvshowQuery);
                $tvshowStmt->bindParam(':media_id', $mediaId, PDO::PARAM_INT);
                $tvshowStmt->bindParam(':total_seasons', $data['tvshow_details']['total_seasons'], PDO::PARAM_INT);
                $tvshowStmt->bindParam(':total_episodes', $data['tvshow_details']['total_episodes'], PDO::PARAM_INT);
                $tvshowStmt->bindParam(':status', $data['tvshow_details']['status']);
                $tvshowStmt->execute();
            }
            
            // Add episode details if it's an episode
            if ($data['type'] === 'episode' && isset($data['episode_details'])) {
                $episodeQuery = "INSERT INTO episodes (media_id, tvshow_id, season_number, episode_number, title, air_date) 
                                VALUES (:media_id, :tvshow_id, :season_number, :episode_number, :title, :air_date)";
                $episodeStmt = $this->conn->prepare($episodeQuery);
                $episodeStmt->bindParam(':media_id', $mediaId, PDO::PARAM_INT);
                $episodeStmt->bindParam(':tvshow_id', $data['episode_details']['tvshow_id'], PDO::PARAM_INT);
                $episodeStmt->bindParam(':season_number', $data['episode_details']['season_number'], PDO::PARAM_INT);
                $episodeStmt->bindParam(':episode_number', $data['episode_details']['episode_number'], PDO::PARAM_INT);
                $episodeStmt->bindParam(':title', $data['episode_details']['title']);
                $episodeStmt->bindParam(':air_date', $data['episode_details']['air_date']);
                $episodeStmt->execute();
            }
            
            $this->conn->commit();
            return $mediaId;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error creating media: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Update a media item
     * 
     * @param int $id Media ID
     * @param array $data Media data
     * @return bool Success or failure
     */
    public function update($id, $data) {
        $this->conn->beginTransaction();
        
        try {
            // Update basic media info
            $fields = [];
            $params = [':id' => $id];
            
            $updateableFields = ['title', 'description', 'release_year', 'duration', 'file_path', 'poster_path', 'backdrop_path', 'jellyfin_id'];
            
            foreach ($updateableFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "{$field} = :{$field}";
                    $params[":{$field}"] = $data[$field];
                }
            }
            
            if (!empty($fields)) {
                $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
                
                $stmt = $this->conn->prepare($query);
                
                foreach ($params as $key => $value) {
                    if (is_int($value)) {
                        $stmt->bindValue($key, $value, PDO::PARAM_INT);
                    } else {
                        $stmt->bindValue($key, $value);
                    }
                }
                
                $stmt->execute();
            }
            
            // Update categories if provided
            if (isset($data['categories']) && is_array($data['categories'])) {
                // Delete existing categories
                $deleteCatQuery = "DELETE FROM media_categories WHERE media_id = :media_id";
                $deleteCatStmt = $this->conn->prepare($deleteCatQuery);
                $deleteCatStmt->bindParam(':media_id', $id, PDO::PARAM_INT);
                $deleteCatStmt->execute();
                
                // Add new categories
                foreach ($data['categories'] as $categoryId) {
                    $categoryQuery = "INSERT INTO media_categories (media_id, category_id) VALUES (:media_id, :category_id)";
                    $categoryStmt = $this->conn->prepare($categoryQuery);
                    $categoryStmt->bindParam(':media_id', $id, PDO::PARAM_INT);
                    $categoryStmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
                    $categoryStmt->execute();
                }
            }
            
            // Update TV show details if provided
            if (isset($data['tvshow_details'])) {
                $tvShowDetails = $data['tvshow_details'];
                $tvShowFields = [];
                $tvShowParams = [':media_id' => $id];
                
                $tvShowUpdateableFields = ['total_seasons', 'total_episodes', 'status'];
                
                foreach ($tvShowUpdateableFields as $field) {
                    if (isset($tvShowDetails[$field])) {
                        $tvShowFields[] = "{$field} = :{$field}";
                        $tvShowParams[":{$field}"] = $tvShowDetails[$field];
                    }
                }
                
                if (!empty($tvShowFields)) {
                    // Check if record exists
                    $checkQuery = "SELECT COUNT(*) FROM tvshows WHERE media_id = :media_id";
                    $checkStmt = $this->conn->prepare($checkQuery);
                    $checkStmt->bindParam(':media_id', $id, PDO::PARAM_INT);
                    $checkStmt->execute();
                    
                    if ($checkStmt->fetchColumn() > 0) {
                        // Update existing record
                        $tvShowQuery = "UPDATE tvshows SET " . implode(', ', $tvShowFields) . " WHERE media_id = :media_id";
                    } else {
                        // Insert new record
                        $fields = array_merge(['media_id'], array_map(function($field) {
                            return preg_replace('/^:/', '', $field);
                        }, array_keys($tvShowParams)));
                        
                        $placeholders = array_keys($tvShowParams);
                        
                        $tvShowQuery = "INSERT INTO tvshows (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
                    }
                    
                    $tvShowStmt = $this->conn->prepare($tvShowQuery);
                    
                    foreach ($tvShowParams as $key => $value) {
                        if (is_int($value)) {
                            $tvShowStmt->bindValue($key, $value, PDO::PARAM_INT);
                        } else {
                            $tvShowStmt->bindValue($key, $value);
                        }
                    }
                    
                    $tvShowStmt->execute();
                }
            }
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error updating media: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete a media item
     * 
     * @param int $id Media ID
     * @return bool Success or failure
     */
    public function delete($id) {
        $this->conn->beginTransaction();
        
        try {
            // Delete related records (the database has ON DELETE CASCADE for foreign keys)
            $query = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error deleting media: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get media items by category
     * 
     * @param int $categoryId Category ID
     * @param array $params Query parameters
     * @return array Media items
     */
    public function getByCategory($categoryId, $params = []) {
        $params['category'] = $categoryId;
        return $this->getAll($params);
    }
    
    /**
     * Get recently added media items
     * 
     * @param int $limit Number of items to return
     * @return array Media items
     */
    public function getRecent($limit = 10) {
        $query = "SELECT * FROM {$this->table} ORDER BY created_at DESC LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Search media items by title or description
     * 
     * @param string $searchTerm Search term
     * @param array $params Query parameters
     * @return array Media items
     */
    public function search($searchTerm, $params = []) {
        $params['search'] = $searchTerm;
        return $this->getAll($params);
    }
} 