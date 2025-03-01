<?php
session_start();
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_data'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'กรุณาเข้าสู่ระบบ']);
    exit;
}

$userId = $_SESSION['user_data']['id'];

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'getProfileData') {
        // Get user ID from session
        $userId = $_SESSION['user_id']; // Adjust based on your session variable name
        
        try {
            // Query to get user profile data
            $stmt = $db->prepare("SELECT id, profile_img, avatar_url FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($userData) {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'data' => $userData
                ]);
            } else {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'message' => 'ไม่พบข้อมูลผู้ใช้'
                ]);
            }
        } catch (Exception $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' . $e->getMessage()
            ]);
        }
        exit;
    }
}

try {
    if (!isset($_POST['action'])) {
        throw new Exception('Missing action parameter');
    }

    if ($_SESSION['user_data']['role'] === 'student' && 
        in_array($_POST['action'], ['updatePassword', 'updateAvatar'])) {
        throw new Exception('ไม่มีสิทธิ์ในการดำเนินการนี้');
    }

    switch ($_POST['action']) {
        case 'updateAvatar':
            if (!isset($_FILES['avatar'])) {
                throw new Exception('ไม่พบไฟล์รูปภาพ');
            }

            $file = $_FILES['avatar'];
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            
            if (!in_array($file['type'], $allowedTypes)) {
                throw new Exception('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)');
            }

            // Change directory to data/avatars
            $uploadDir = '../data/avatars/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileName = $userId . '_' . time() . '_' . basename($file['name']);
            $filePath = $uploadDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                // Update query to use profile_img field instead of avatar_url
                $stmt = $db->prepare("UPDATE users SET profile_img = ? WHERE id = ?");
                $avatarPath = 'data/avatars/' . $fileName;
                $stmt->execute([$avatarPath, $userId]);

                // Update session data
                $_SESSION['user_data']['profile_img'] = $avatarPath;
                
                echo json_encode(['success' => true, 'avatar_url' => $avatarPath]);
            } else {
                throw new Exception('ไม่สามารถอัพโหลดไฟล์ได้');
            }
            break;

        case 'updatePersonalInfo':
            $userRole = $_SESSION['user_data']['role'];
            
            if ($userRole === 'student') {
                $sql = "UPDATE users SET gender = ?, club = ? WHERE id = ?";
                $params = [
                    $_POST['gender'],
                    $_POST['club'],
                    $userId
                ];
            } else {
                $sql = "UPDATE users SET 
                    first_name = ?, 
                    last_name = ?, 
                    email = ?, 
                    gender = ?, 
                    club = ? 
                    WHERE id = ?";
                $params = [
                    $_POST['first_name'],
                    $_POST['last_name'],
                    $_POST['email'],
                    $_POST['gender'],
                    $_POST['club'],
                    $userId
                ];
            }

            $stmt = $db->prepare($sql);
            if ($stmt->execute($params)) {
                echo json_encode(['success' => true]);
            } else {
                throw new Exception('ไม่สามารถบันทึกข้อมูลได้');
            }
            break;

        case 'updatePassword':
            if (empty($_POST['current_password']) || 
                empty($_POST['new_password']) || 
                empty($_POST['confirm_password'])) {
                throw new Exception('กรุณากรอกข้อมูลให้ครบถ้วน');
            }

            if ($_POST['new_password'] !== $_POST['confirm_password']) {
                throw new Exception('รหัสผ่านใหม่ไม่ตรงกัน');
            }

            if (strlen($_POST['new_password']) < 8) {
                throw new Exception('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
            }

            $stmt = $db->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!password_verify($_POST['current_password'], $user['password_hash'])) {
                throw new Exception('รหัสผ่านปัจจุบันไม่ถูกต้อง');
            }

            $newPasswordHash = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
            $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $success = $stmt->execute([$newPasswordHash, $userId]);

            if (!$success) {
                throw new Exception('ไม่สามารถอัพเดทรหัสผ่านได้');
            }

            echo json_encode(['success' => true]);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}