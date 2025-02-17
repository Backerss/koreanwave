<?php
class Logger {
    private $db;
    private $userId;

    public function __construct($db, $userId) {
        $this->db = $db;
        $this->userId = $userId;
    }

    public function log($action, $module, $description, $targetId = null, $oldValues = null, $newValues = null) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO activity_logs 
                (user_id, action, module, description, target_id, old_values, new_values, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $this->userId,
                $action,
                $module,
                $description,
                $targetId,
                $oldValues ? json_encode($oldValues) : null,
                $newValues ? json_encode($newValues) : null,
                $_SERVER['REMOTE_ADDR']
            ]);

            return true;
        } catch (Exception $e) {
            error_log("Logging error: " . $e->getMessage());
            return false;
        }
    }
}