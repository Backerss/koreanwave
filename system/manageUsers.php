<?php
session_start();
require_once 'db.php';
require_once 'Logger.php';
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
                    try {
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
                            $count = $stmt->fetchColumn();
                            
                            if ($count > 0) {
                                echo json_encode([
                                    'success' => false,
                                    'message' => 'รหัสนักเรียนนี้มีในระบบแล้ว'
                                ]);
                                exit; // เพิ่ม exit เพื่อหยุดการทำงานทันที
                            }
                        }

                        // Validate email และส่วนอื่นๆ ...
                        
                        // Insert user
                        $db->beginTransaction(); // เริ่ม transaction

                        try {
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
                                echo json_encode(['success' => true]);
                            } else {
                                throw new Exception('ไม่สามารถบันทึกข้อมูลได้');
                            }

                        } catch (Exception $e) {
                            $db->rollBack();
                            throw new Exception('ไม่สามารถบันทึกข้อมูลได้: ' . $e->getMessage());
                        }
                        
                    } catch (Exception $e) {
                        if ($db->inTransaction()) {
                            $db->rollBack();
                        }
                        echo json_encode([
                            'success' => false,
                            'message' => $e->getMessage()
                        ]);
                    }
                    break;

                case 'update':
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

                            echo json_encode(['success' => true]);
                        } else {
                            throw new Exception('ไม่สามารถอัพเดทข้อมูลได้');
                        }
                    } catch (Exception $e) {
                        echo json_encode([
                            'success' => false,
                            'message' => $e->getMessage()
                        ]);
                    }
                    break;

                case 'delete':
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

                            echo json_encode(['success' => true]);
                        } else {
                            throw new Exception('ไม่สามารถลบผู้ใช้ได้');
                        }
                    } catch (Exception $e) {
                        echo json_encode([
                            'success' => false,
                            'message' => $e->getMessage()
                        ]);
                    }
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