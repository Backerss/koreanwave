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
        // Add new course
        $stmt = $db->prepare("INSERT INTO lessons (title, category) VALUES (?, ?)");
        $success = $stmt->execute([$_POST['title'], $_POST['category']]);
        echo json_encode(['success' => $success]);
    }
}