<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    // กิจกรรมทั้งหมด
    $totalActivities = $db->query("
        SELECT COUNT(*) 
        FROM activity_logs
    ")->fetchColumn();

    // ผู้ใช้ที่ใช้งานวันนี้
    $activeUsers = $db->query("
        SELECT COUNT(DISTINCT user_id) 
        FROM activity_logs 
        WHERE DATE(created_at) = CURDATE()
    ")->fetchColumn();

    // กิจกรรมวันนี้
    $todayActivities = $db->query("
        SELECT COUNT(*) 
        FROM activity_logs 
        WHERE DATE(created_at) = CURDATE()
    ")->fetchColumn();

    // เฉลี่ยต่อวัน
    $avgActivities = $db->query("
        SELECT ROUND(COUNT(*) / COUNT(DISTINCT DATE(created_at)), 2)
        FROM activity_logs
    ")->fetchColumn();

    echo json_encode([
        'success' => true,
        'data' => [
            'totalActivities' => $totalActivities,
            'activeUsers' => $activeUsers,
            'todayActivities' => $todayActivities,
            'avgActivities' => $avgActivities
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}