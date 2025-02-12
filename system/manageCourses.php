<?php
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'get') {
        if (isset($_GET['id'])) {
            // Get specific course
            $stmt = $db->prepare("SELECT * FROM lessons WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $course = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'course' => $course]);
        } else {
            // Get all courses
            $stmt = $db->query("SELECT * FROM lessons ORDER BY created_at DESC");
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'courses' => $courses]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'update':
                // ตรวจสอบว่ามีชื่อบทเรียนซ้ำหรือไม่
                $stmt = $db->prepare("SELECT COUNT(*) FROM lessons WHERE title = ? AND id != ?");
                $stmt->execute([$_POST['title'], $_POST['id']]);
                if ($stmt->fetchColumn() > 0) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'มีบทเรียนชื่อนี้อยู่แล้ว'
                    ]);
                    exit;
                }

                $stmt = $db->prepare("UPDATE lessons SET title = ?, category = ? WHERE id = ?");
                $success = $stmt->execute([$_POST['title'], $_POST['category'], $_POST['id']]);
                echo json_encode(['success' => $success]);
                break;
                
            case 'delete':
                $stmt = $db->prepare("DELETE FROM lessons WHERE id = ?");
                $success = $stmt->execute([$_POST['id']]);
                echo json_encode(['success' => $success]);
                break;
        }
    } else {
        // ตรวจสอบว่ามีชื่อบทเรียนซ้ำหรือไม่
        $stmt = $db->prepare("SELECT COUNT(*) FROM lessons WHERE title = ?");
        $stmt->execute([$_POST['title']]);
        if ($stmt->fetchColumn() > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'มีบทเรียนชื่อนี้อยู่แล้ว'
            ]);
            exit;
        }

        // Add new course
        $stmt = $db->prepare("INSERT INTO lessons (title, category) VALUES (?, ?)");
        $success = $stmt->execute([$_POST['title'], $_POST['category']]);
        echo json_encode(['success' => $success]);
    }
}