<?php
session_start();
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if (isset($_SESSION['user_data'])) {
    // รีเฟรช session
    session_regenerate_id(true);
    http_response_code(200);
    echo json_encode(['status' => 'valid']);
} else {
    http_response_code(401);
    echo json_encode(['status' => 'invalid']);
}