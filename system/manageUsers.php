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
const EMAIL_PATTERN = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;

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
    
    // Validate basic required fields
    if (empty(trim($data['first_name']))) {
        $errors[] = 'กรุณากรอกชื่อ';
    } elseif (strlen($data['first_name']) < NAME_MIN_LENGTH || strlen($data['first_name']) > NAME_MAX_LENGTH) {
        $errors[] = 'ชื่อต้องมีความยาวระหว่าง ' . NAME_MIN_LENGTH . ' ถึง ' . NAME_MAX_LENGTH . ' ตัวอักษร';
    }

    if (empty(trim($data['last_name']))) {
        $errors[] = 'กรุณากรอกนามสกุล';
    } elseif (strlen($data['last_name']) < NAME_MIN_LENGTH || strlen($data['last_name']) > NAME_MAX_LENGTH) {
        $errors[] = 'นามสกุลต้องมีความยาวระหว่าง ' . NAME_MIN_LENGTH . ' ถึง ' . NAME_MAX_LENGTH . ' ตัวอักษร';
    }

    // Validate email
    if (empty(trim($data['email']))) {
        $errors[] = 'กรุณากรอกอีเมล';
    } elseif (!preg_match(EMAIL_PATTERN, $data['email'])) {
        $errors[] = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else {
        // ตรวจสอบว่าอีเมลซ้ำหรือไม่
        global $db;
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$data['email'], $data['id'] ?? 0]);
        if ($stmt->fetch()) {
            $errors[] = 'อีเมลนี้ถูกใช้งานแล้ว';
        }
    }

    // Validate role
    if (empty($data['role']) || !in_array($data['role'], ['student', 'teacher', 'admin'])) {
        $errors[] = 'กรุณาเลือกประเภทผู้ใช้ที่ถูกต้อง';
    }

    // Validate gender
    if (empty($data['gender']) || !in_array($data['gender'], ['male', 'female', 'other'])) {
        $errors[] = 'กรุณาเลือกเพศ';
    }

    // Validate student specific fields
    if ($data['role'] === 'student') {
        if (empty($data['student_id'])) {
            $errors[] = 'กรุณากรอกรหัสนักเรียน';
        } elseif (!preg_match(STUDENT_ID_PATTERN, $data['student_id'])) {
            $errors[] = 'รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก';
        } else {
            // ตรวจสอบรหัสนักเรียนซ้ำ
            $stmt = $db->prepare("SELECT id FROM users WHERE student_id = ? AND id != ?");
            $stmt->execute([$data['student_id'], $data['id'] ?? 0]);
            if ($stmt->fetch()) {
                $errors[] = 'รหัสนักเรียนนี้ถูกใช้งานแล้ว';
            }
        }

        if (empty($data['grade_level']) || !in_array($data['grade_level'], range(1, 6))) {
            $errors[] = 'กรุณาเลือกระดับชั้น';
        }

        if (empty($data['classroom']) || !in_array($data['classroom'], range(1, 5))) {
            $errors[] = 'กรุณาเลือกห้องเรียน';
        }
    }

    // Validate password
    if (!$isUpdate && empty($data['password'])) {
        $errors[] = 'กรุณากรอกรหัสผ่าน';
    } elseif (!empty($data['password'])) {
        if (strlen($data['password']) < PASSWORD_MIN_LENGTH) {
            $errors[] = 'รหัสผ่านต้องมีความยาวอย่างน้อย ' . PASSWORD_MIN_LENGTH . ' ตัวอักษร';
        }
        if (!preg_match('/[A-Z]/', $data['password'])) {
            $errors[] = 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว';
        }
        if (!preg_match('/[a-z]/', $data['password'])) {
            $errors[] = 'รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว';
        }
        if (!preg_match('/[0-9]/', $data['password'])) {
            $errors[] = 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว';
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
                    if (!isset($_POST['id'])) {
                        sendResponse(false, null, 'Missing user ID', 400);
                    }

                    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
                    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                    $stmt->execute([$_POST['id']]);
                    if (!$stmt->fetch()) {
                        sendResponse(false, null, 'User not found', 404);
                    }

                    $errors = validateUserData($_POST, true);
                    if (!empty($errors)) {
                        sendResponse(false, null, implode("\n", $errors), 400);
                    }

                    $db->beginTransaction();
                    try {
                        // ดึงข้อมูลเดิม
                        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                        $stmt->execute([$_POST['id']]);
                        $oldData = $stmt->fetch(PDO::FETCH_ASSOC);

                        // สร้าง SQL และ parameters สำหรับ update
                        $updates = [
                            'first_name = ?',
                            'last_name = ?',
                            'email = ?',
                            'gender = ?',
                            'role = ?',
                            'club = ?',
                            'updated_at = NOW()'
                        ];
                        
                        $params = [
                            $_POST['first_name'],
                            $_POST['last_name'],
                            $_POST['email'],
                            $_POST['gender'],
                            $_POST['role'],
                            $_POST['club'] ?? null
                        ];

                        // เพิ่มฟิลด์สำหรับนักเรียน
                        if ($_POST['role'] === 'student') {
                            array_push($updates, 'student_id = ?', 'grade_level = ?', 'classroom = ?');
                            array_push($params, $_POST['student_id'], $_POST['grade_level'], $_POST['classroom']);
                        } else {
                            array_push($updates, 'student_id = NULL', 'grade_level = NULL', 'classroom = NULL');
                        }

                        // เพิ่มการอัพเดทรหัสผ่าน
                        if (!empty($_POST['password'])) {
                            array_push($updates, 'password_hash = ?');
                            array_push($params, password_hash($_POST['password'], PASSWORD_DEFAULT));
                        }

                        // เพิ่ม user ID เข้าไปใน params
                        array_push($params, $_POST['id']);

                        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
                        $stmt = $db->prepare($sql);
                        $success = $stmt->execute($params);

                        if ($success) {
                            // บันทึก log
                            $logger = new Logger($db, $_SESSION['user_data']['id']);
                            $newData = array_intersect_key($_POST, array_flip([
                                'student_id', 'first_name', 'last_name', 'role', 'email',
                                'gender', 'grade_level', 'classroom', 'club'
                            ]));

                            $logger->log(
                                'update',
                                'users',
                                "แก้ไขข้อมูลผู้ใช้: {$_POST['first_name']} {$_POST['last_name']} (บทบาท: {$_POST['role']})",
                                $_POST['id'],
                                $oldData,
                                $newData
                            );

                            $db->commit();
                            sendResponse(true);
                        } else {
                            throw new Exception('ไม่สามารถอัพเดทข้อมูลได้');
                        }
                    } catch (Exception $e) {
                        $db->rollBack();
                        error_log("Update user error: " . $e->getMessage());
                        sendResponse(false, null, 'ไม่สามารถอัพเดทข้อมูลได้: ' . $e->getMessage(), 500);
                    }
                    break;

                case 'delete':
                    if (!isset($_POST['id'])) {
                        sendResponse(false, null, 'Missing user ID', 400);
                        exit;
                    }

                    $db->beginTransaction();
                    try {
                        // ดึงข้อมูลผู้ใช้ก่อนลบ
                        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                        $stmt->execute([$_POST['id']]);
                        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

                        if (!$userData) {
                            throw new Exception('ไม่พบข้อมูลผู้ใช้');
                        }

                        // ลบผู้ใช้
                        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
                        $success = $stmt->execute([$_POST['id']]);

                        if (!$success) {
                            throw new Exception('ไม่สามารถลบผู้ใช้ได้');
                        }

                        // บันทึก log
                        $logger = new Logger($db, $_SESSION['user_data']['id']);
                        $logger->log(
                            'delete',
                            'users',
                            "ลบผู้ใช้: {$userData['first_name']} {$userData['last_name']} (บทบาท: {$userData['role']})",
                            $_POST['id'],
                            $userData,
                            null
                        );

                        $db->commit();
                        sendResponse(true, null, 'ลบผู้ใช้เรียบร้อยแล้ว');

                    } catch (Exception $e) {
                        $db->rollBack();
                        error_log("Delete user error: " . $e->getMessage());
                        sendResponse(false, null, 'ไม่สามารถลบผู้ใช้ได้: ' . $e->getMessage(), 500);
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