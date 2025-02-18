<?php
session_start();
require_once 'db.php';
require_once 'Logger.php';

// Security headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Constants
const STUDENT_ID_PATTERN = '/^\d{5}$/';
const PASSWORD_MIN_LENGTH = 8;

// Utility functions
function sendResponse($success, $data = null, $message = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
    exit;
}

function validateUserData($data, $isUpdate = false) {
    $errors = [];
    
    if (empty($data['first_name'])) $errors[] = 'กรุณากรอกชื่อ';
    if (empty($data['last_name'])) $errors[] = 'กรุณากรอกนามสกุล';
    if (empty($data['role'])) $errors[] = 'กรุณาเลือกประเภทผู้ใช้';
    if (!$isUpdate && empty($data['password'])) $errors[] = 'กรุณากรอกรหัสผ่าน';
    
    if (!empty($data['password']) && strlen($data['password']) < PASSWORD_MIN_LENGTH) {
        $errors[] = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
    }
    
    if ($data['role'] === 'student') {
        if (empty($data['student_id'])) {
            $errors[] = 'กรุณากรอกรหัสนักเรียน';
        } elseif (!preg_match(STUDENT_ID_PATTERN, $data['student_id'])) {
            $errors[] = 'รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก';
        }
    }
    
    return $errors;
}

// Access control
if (!isset($_SESSION['user_data']) || $_SESSION['user_data']['role'] !== 'admin') {
    sendResponse(false, null, 'Unauthorized access', 403);
}

try {
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (!isset($_GET['action'])) {
                sendResponse(false, null, 'Invalid request', 400);
            }

            switch ($_GET['action']) {
                case 'list':
                    $stmt = $db->prepare("
                        SELECT id, student_id, first_name, last_name, email, 
                               role, grade_level, classroom, gender, club, 
                               created_at, updated_at 
                        FROM users 
                        ORDER BY created_at DESC
                    ");
                    $stmt->execute();
                    sendResponse(true, ['users' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
                    break;

                case 'get':
                    if (!isset($_GET['id'])) {
                        sendResponse(false, null, 'Missing user ID', 400);
                    }
                    
                    $stmt = $db->prepare("
                        SELECT id, student_id, first_name, last_name, email, 
                               role, grade_level, classroom, gender, club 
                        FROM users 
                        WHERE id = ?
                    ");
                    $stmt->execute([$_GET['id']]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if (!$user) {
                        sendResponse(false, null, 'User not found', 404);
                    }
                    
                    sendResponse(true, ['user' => $user]);
                    break;
                    
                default:
                    sendResponse(false, null, 'Invalid action', 400);
            }
            break;

        case 'POST':
            if (!isset($_POST['action'])) {
                sendResponse(false, null, 'Invalid request', 400);
            }

            switch ($_POST['action']) {
                case 'add':
                    $errors = validateUserData($_POST);
                    if (!empty($errors)) {
                        sendResponse(false, null, implode("\n", $errors), 400);
                    }

                    $db->beginTransaction();
                    try {
                        // Validate email และส่วนอื่นๆ ...
                        
                        // Insert user
                        $sql = "INSERT INTO users (
                            student_id, first_name, last_name, 
                            grade_level, classroom, role,
                            email, password_hash, gender, club,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

                        $stmt = $db->prepare($sql);
                        $success = $stmt->execute([
                            $_POST['role'] === 'student' ? $_POST['student_id'] : null,
                            $_POST['first_name'],
                            $_POST['last_name'],
                            $_POST['role'] === 'student' ? $_POST['grade_level'] : null,
                            $_POST['role'] === 'student' ? $_POST['classroom'] : null,
                            $_POST['role'],
                            $_POST['email'],
                            password_hash($_POST['password'], PASSWORD_DEFAULT),
                            $_POST['gender'],
                            $_POST['club']
                        ]);

                        if ($success) {
                            // สร้าง Logger instance
                            $logger = new Logger($db, $_SESSION['user_data']['id']);
                            
                            // เก็บ log การเพิ่มผู้ใช้
                            $newUserId = $db->lastInsertId();
                            $logData = [
                                'student_id' => $_POST['student_id'] ?? null,
                                'first_name' => $_POST['first_name'],
                                'last_name' => $_POST['last_name'],
                                'role' => $_POST['role'],
                                'email' => $_POST['email'],
                                'gender' => $_POST['gender'],
                                'grade_level' => $_POST['grade_level'] ?? null,
                                'classroom' => $_POST['classroom'] ?? null,
                                'club' => $_POST['club']
                            ];

                            $logger->log(
                                'create',
                                'users',
                                "เพิ่มผู้ใช้ใหม่: {$_POST['first_name']} {$_POST['last_name']} (บทบาท: {$_POST['role']})",
                                $newUserId,
                                null,
                                $logData
                            );

                            $db->commit();
                            sendResponse(true);
                        } else {
                            throw new Exception('ไม่สามารถบันทึกข้อมูลได้');
                        }

                    } catch (Exception $e) {
                        $db->rollBack();
                        throw new Exception('ไม่สามารถบันทึกข้อมูลได้: ' . $e->getMessage());
                    }
                    break;

                case 'update':
                    $errors = validateUserData($_POST, true);
                    if (!empty($errors)) {
                        sendResponse(false, null, implode("\n", $errors), 400);
                    }

                    $db->beginTransaction();
                    try {
                        // ดึงข้อมูลเดิมก่อนอัพเดท
                        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                        $stmt->execute([$_POST['id']]);
                        $oldData = $stmt->fetch(PDO::FETCH_ASSOC);

                        $sql = "UPDATE users SET 
                            student_id = ?, first_name = ?, last_name = ?,
                            grade_level = ?, classroom = ?, role = ?,
                            email = ?, gender = ?, club = ?, updated_at = NOW()
                            WHERE id = ?";

                        $params = [
                            $_POST['role'] === 'student' ? $_POST['student_id'] : null,
                            $_POST['first_name'],
                            $_POST['last_name'],
                            $_POST['role'] === 'student' ? $_POST['grade_level'] : null,
                            $_POST['role'] === 'student' ? $_POST['classroom'] : null,
                            $_POST['role'],
                            $_POST['email'],
                            $_POST['gender'],
                            $_POST['club'],
                            $_POST['id']
                        ];

                        if (!empty($_POST['password'])) {
                            $sql = "UPDATE users SET 
                                student_id = ?, first_name = ?, last_name = ?,
                                grade_level = ?, classroom = ?, role = ?,
                                email = ?, password_hash = ?, gender = ?, club = ?, updated_at = NOW()
                                WHERE id = ?";
                            array_splice($params, 7, 0, password_hash($_POST['password'], PASSWORD_DEFAULT));
                        }

                        $stmt = $db->prepare($sql);
                        $success = $stmt->execute($params);

                        if ($success) {
                            // สร้าง Logger instance
                            $logger = new Logger($db, $_SESSION['user_data']['id']);

                            // เตรียมข้อมูลใหม่สำหรับ log
                            $newData = [
                                'student_id' => $_POST['student_id'] ?? null,
                                'first_name' => $_POST['first_name'],
                                'last_name' => $_POST['last_name'],
                                'role' => $_POST['role'],
                                'email' => $_POST['email'],
                                'gender' => $_POST['gender'],
                                'grade_level' => $_POST['grade_level'] ?? null,
                                'classroom' => $_POST['classroom'] ?? null,
                                'club' => $_POST['club']
                            ];

                            // เก็บ log การแก้ไขผู้ใช้
                            $logger->log(
                                'update',
                                'users',
                                "แก้ไขข้อมูลผู้ใช้: {$_POST['first_name']} {$_POST['last_name']} (บทบาท: {$_POST['role']})",
                                $_POST['id'],
                                $oldData,
                                $newData
                            );

                            sendResponse(true);
                        } else {
                            throw new Exception('ไม่สามารถอัพเดทข้อมูลได้');
                        }
                    } catch (Exception $e) {
                        $db->rollBack();
                        throw new Exception('ไม่สามารถอัพเดทข้อมูลได้: ' . $e->getMessage());
                    }
                    break;

                case 'delete':
                    if (!isset($_POST['id'])) {
                        sendResponse(false, null, 'Missing user ID', 400);
                    }

                    $db->beginTransaction();
                    try {
                        // ดึงข้อมูลผู้ใช้ก่อนลบ
                        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                        $stmt->execute([$_POST['id']]);
                        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

                        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
                        $success = $stmt->execute([$_POST['id']]);

                        if ($success) {
                            // สร้าง Logger instance
                            $logger = new Logger($db, $_SESSION['user_data']['id']);

                            // เก็บ log การลบผู้ใช้
                            $logger->log(
                                'delete',
                                'users',
                                "ลบผู้ใช้: {$userData['first_name']} {$userData['last_name']} (บทบาท: {$userData['role']})",
                                $_POST['id'],
                                $userData,
                                null
                            );

                            sendResponse(true);
                        } else {
                            throw new Exception('ไม่สามารถลบผู้ใช้ได้');
                        }
                    } catch (Exception $e) {
                        $db->rollBack();
                        throw new Exception('ไม่สามารถลบผู้ใช้ได้: ' . $e->getMessage());
                    }
                    break;

                default:
                    sendResponse(false, null, 'Invalid action', 400);
            }
            break;

        default:
            sendResponse(false, null, 'Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Error in manageUsers.php: " . $e->getMessage());
    sendResponse(false, null, 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง', 500);
}