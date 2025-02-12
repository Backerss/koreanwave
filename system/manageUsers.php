<?php
session_start();
require_once 'db.php';
header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_data']) || $_SESSION['user_data']['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['action'])) {
                switch ($_GET['action']) {
                    case 'list':
                        $stmt = $db->query("SELECT * FROM users ORDER BY created_at DESC");
                        echo json_encode([
                            'success' => true,
                            'data' => $stmt->fetchAll()
                        ]);
                        break;

                    case 'get':
                        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                        $stmt->execute([$_GET['id']]);
                        echo json_encode([
                            'success' => true,
                            'user' => $stmt->fetch()
                        ]);
                        break;
                }
            }
            break;

        case 'POST':
            switch ($_POST['action']) {
                case 'add':
                    // Validate required fields
                    if (empty($_POST['first_name']) || empty($_POST['last_name']) || empty($_POST['role']) || empty($_POST['password'])) {
                        throw new Exception('กรุณากรอกข้อมูลให้ครบถ้วน');
                    }

                    // Validate student_id format and uniqueness for students
                    if ($_POST['role'] === 'student') {
                        if (empty($_POST['student_id'])) {
                            throw new Exception('กรุณากรอกรหัสนักเรียน');
                        }
                        
                        // Check student ID format (5 digits)
                        if (!preg_match('/^\d{5}$/', $_POST['student_id'])) {
                            throw new Exception('รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก');
                        }

                        // Check if student ID already exists
                        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE student_id = ?");
                        $stmt->execute([$_POST['student_id']]);
                        if ($stmt->fetchColumn() > 0) {
                            throw new Exception('รหัสนักเรียนนี้มีในระบบแล้ว');
                        }
                    }

                    // Validate password
                    if (strlen($_POST['password']) < 6) {
                        throw new Exception('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
                    }

                    // Insert user
                    $sql = "INSERT INTO users (
                        student_id, first_name, last_name, 
                        grade_level, classroom, role, 
                        password_hash, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

                    try {
                        $stmt = $db->prepare($sql);
                        $stmt->execute([
                            $_POST['role'] === 'student' ? $_POST['student_id'] : null,
                            $_POST['first_name'],
                            $_POST['last_name'],
                            $_POST['role'] === 'student' ? $_POST['grade_level'] : null,
                            $_POST['role'] === 'student' ? $_POST['classroom'] : null,
                            $_POST['role'],
                            password_hash($_POST['password'], PASSWORD_DEFAULT)
                        ]);

                        echo json_encode(['success' => true]);
                    } catch (PDOException $e) {
                        throw new Exception('ไม่สามารถบันทึกข้อมูลได้: ' . $e->getMessage());
                    }
                    break;

                case 'update':
                    $sql = "UPDATE users SET 
                        student_id = ?, first_name = ?, last_name = ?,
                        grade_level = ?, classroom = ?, role = ?,
                        updated_at = NOW()
                        WHERE id = ?";

                    if (!empty($_POST['password'])) {
                        $sql = "UPDATE users SET 
                            student_id = ?, first_name = ?, last_name = ?,
                            grade_level = ?, classroom = ?, role = ?,
                            password_hash = ?, updated_at = NOW()
                            WHERE id = ?";
                    }

                    $params = [
                        $_POST['student_id'] ?: null,
                        $_POST['first_name'],
                        $_POST['last_name'],
                        $_POST['grade_level'] ?: null,
                        $_POST['classroom'] ?: null,
                        $_POST['role']
                    ];

                    if (!empty($_POST['password'])) {
                        $params[] = password_hash($_POST['password'], PASSWORD_DEFAULT);
                    }

                    $params[] = $_POST['id'];

                    $stmt = $db->prepare($sql);
                    $stmt->execute($params);

                    echo json_encode(['success' => true]);
                    break;

                case 'delete':
                    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
                    $stmt->execute([$_POST['id']]);
                    echo json_encode(['success' => true]);
                    break;
            }
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}