<?php
/**
 * History Model
 * 
 * Handles user viewing history operations
 */

require_once __DIR__ . '/../../config/database.php';

class History {
    private $db;
    private $table = 'viewing_history';

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Get viewing history by ID
     * 
     * @param int $id The history entry ID
     * @return array|false History data or false if not found
     */
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT h.*, m.title as media_title 
                FROM {$this->table} h
                JOIN media m ON h.media_id = m.id
                WHERE h.id = :id
            ");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            $history = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $history ?: false;
        } catch (PDOException $e) {
            error_log("History fetch error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get a user's viewing history
     * 
     * @param int $userId The user ID
     * @param array $params Additional parameters (limit, offset, sort)
     * @return array Array of viewing history entries
     */
    public function getByUser($userId, $params = []) {
        try {
            $limit = isset($params['limit']) ? intval($params['limit']) : 20;
            $offset = isset($params['offset']) ? intval($params['offset']) : 0;
            $sort = isset($params['sort']) ? $params['sort'] : 'watched_at';
            $direction = (isset($params['direction']) && strtoupper($params['direction']) === 'ASC') ? 'ASC' : 'DESC';
            
            // Validate sort column to prevent SQL injection
            $allowedSortColumns = ['id', 'media_id', 'watched_at', 'progress'];
            if (!in_array($sort, $allowedSortColumns)) {
                $sort = 'watched_at';
            }
            
            $stmt = $this->db->prepare("
                SELECT h.*, m.title as media_title, m.thumbnail_path
                FROM {$this->table} h
                JOIN media m ON h.media_id = m.id
                WHERE h.user_id = :user_id
                ORDER BY h.{$sort} {$direction}
                LIMIT :limit OFFSET :offset
            ");
            
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return $history;
        } catch (PDOException $e) {
            error_log("History fetch error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get history by media ID and user ID
     * 
     * @param int $mediaId The media ID
     * @param int $userId The user ID
     * @return array|false History data or false if not found
     */
    public function getByMediaAndUser($mediaId, $userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM {$this->table}
                WHERE media_id = :media_id AND user_id = :user_id
                ORDER BY watched_at DESC
                LIMIT 1
            ");
            
            $stmt->bindParam(':media_id', $mediaId, PDO::PARAM_INT);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            $history = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $history ?: false;
        } catch (PDOException $e) {
            error_log("History fetch error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create or update a viewing history entry
     * 
     * @param array $data The history data (user_id, media_id, progress)
     * @return int|false The history ID or false on failure
     */
    public function upsert($data) {
        try {
            // Check if entry already exists
            $existing = $this->getByMediaAndUser($data['media_id'], $data['user_id']);
            
            // If it exists, update it
            if ($existing) {
                return $this->update($existing['id'], $data);
            } 
            // Otherwise create a new entry
            else {
                return $this->create($data);
            }
        } catch (PDOException $e) {
            error_log("History upsert error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Create a new viewing history entry
     * 
     * @param array $data The history data (user_id, media_id, progress)
     * @return int|false The history ID or false on failure
     */
    public function create($data) {
        try {
            // Set current timestamp if not provided
            if (!isset($data['watched_at'])) {
                $data['watched_at'] = date('Y-m-d H:i:s');
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO {$this->table} (user_id, media_id, progress, watched_at)
                VALUES (:user_id, :media_id, :progress, :watched_at)
            ");
            
            $stmt->bindParam(':user_id', $data['user_id'], PDO::PARAM_INT);
            $stmt->bindParam(':media_id', $data['media_id'], PDO::PARAM_INT);
            $stmt->bindParam(':progress', $data['progress'], PDO::PARAM_INT);
            $stmt->bindParam(':watched_at', $data['watched_at']);
            
            $stmt->execute();
            
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            error_log("History creation error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update a viewing history entry
     * 
     * @param int $id The history ID
     * @param array $data The history data (progress)
     * @return bool Success status
     */
    public function update($id, $data) {
        try {
            // Always update watched_at to the current time
            $data['watched_at'] = date('Y-m-d H:i:s');
            
            $stmt = $this->db->prepare("
                UPDATE {$this->table}
                SET progress = :progress, watched_at = :watched_at
                WHERE id = :id
            ");
            
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':progress', $data['progress'], PDO::PARAM_INT);
            $stmt->bindParam(':watched_at', $data['watched_at']);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("History update error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a viewing history entry
     * 
     * @param int $id The history ID
     * @return bool Success status
     */
    public function delete($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("History deletion error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete all viewing history for a user
     * 
     * @param int $userId The user ID
     * @return bool Success status
     */
    public function deleteByUser($userId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("History deletion error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Count user's history entries
     * 
     * @param int $userId User ID
     * @return int Count of history entries
     */
    public function countByUser($userId) {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM {$this->table} WHERE user_id = :user_id");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            return (int) $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("History count error: " . $e->getMessage());
            return 0;
        }
    }
} 