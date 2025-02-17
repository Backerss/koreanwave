<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

// ตรวจสอบสิทธิ์
if (!isset($_SESSION['user_data']) || 
    !in_array($_SESSION['user_data']['role'], ['admin', 'teacher'])) {
    die(json_encode(['success' => false, 'message' => 'Unauthorized']));
}

try {
    $params = [];
    $whereConditions = [];

    // สร้าง WHERE clause ตามฟิลเตอร์
    if (!empty($_GET['module'])) {
        $whereConditions[] = "l.module = ?";
        $params[] = $_GET['module'];
    }

    if (!empty($_GET['action'])) {
        $whereConditions[] = "l.action = ?";
        $params[] = $_GET['action'];
    }

    if (!empty($_GET['date_from'])) {
        $whereConditions[] = "DATE(l.created_at) >= ?";
        $params[] = $_GET['date_from'];
    }

    if (!empty($_GET['date_to'])) {
        $whereConditions[] = "DATE(l.created_at) <= ?";
        $params[] = $_GET['date_to'];
    }

    $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

    // Query หลัก
    $sql = "
        SELECT 
            l.*,
            u.first_name,
            u.last_name,
            u.role
        FROM activity_logs l
        JOIN users u ON l.user_id = u.id
        $whereClause
        ORDER BY l.created_at DESC
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $logs
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}