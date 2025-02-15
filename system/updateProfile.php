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

try {
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

            $uploadDir = '../uploads/avatars/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileName = $userId . '_' . time() . '_' . basename($file['name']);
            $filePath = $uploadDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $stmt = $db->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
                $avatarUrl = 'uploads/avatars/' . $fileName;
                $stmt->execute([$avatarUrl, $userId]);

                echo json_encode(['success' => true, 'avatar_url' => $avatarUrl]);
            } else {
                throw new Exception('ไม่สามารถอัพโหลดไฟล์ได้');
            }
            break;

        case 'updatePersonalInfo':
            $stmt = $db->prepare("
                UPDATE users 
                SET email = ?, tel = ?, gender = ?, club = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $_POST['email'],
                $_POST['phone'],
                $_POST['gender'],
                $_POST['club'],
                $userId
            ]);
            echo json_encode(['success' => true]);
            break;

        case 'updatePassword':
            if ($_POST['new_password'] !== $_POST['confirm_password']) {
                throw new Exception('รหัสผ่านใหม่ไม่ตรงกัน');
            }

            $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if (!password_verify($_POST['current_password'], $user['password'])) {
                throw new Exception('รหัสผ่านปัจจุบันไม่ถูกต้อง');
            }

            $newPasswordHash = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
            $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
            $stmt->execute([$newPasswordHash, $userId]);

            echo json_encode(['success' => true]);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}