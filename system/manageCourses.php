<?php
require_once 'db.php';

header('Content-Type: application/json');

// Error handler function
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit;
}

// Validate course data
function validateCourseData($title, $category) {
    if (empty($title) || empty($category)) {
        return 'กรุณากรอกข้อมูลให้ครบถ้วน';
    }
    if (strlen($title) > 255) {
        return 'ชื่อบทเรียนต้องไม่เกิน 255 ตัวอักษร';
    }
    return null;
}

// Check duplicate title
function checkDuplicateTitle($db, $title, $id = null) {
    try {
        if ($id) {
            $stmt = $db->prepare("SELECT COUNT(*) FROM lessons WHERE title = ? AND id != ?");
            $stmt->execute([$title, $id]);
        } else {
            $stmt = $db->prepare("SELECT COUNT(*) FROM lessons WHERE title = ?");
            $stmt->execute([$title]);
        }
        return $stmt->fetchColumn() > 0;
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}

// เพิ่มฟังก์ชันสำหรับจัดการรูปภาพ
function handleCoverImage($file) {
    if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    // ตรวจสอบขนาดไฟล์
    if ($file['size'] > 10 * 1024 * 1024) {
        throw new Exception('ขนาดไฟล์ต้องไม่เกิน 10MB');
    }

    // ตรวจสอบประเภทไฟล์
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('รองรับเฉพาะไฟล์ภาพ JPG, PNG และ GIF เท่านั้น');
    }

    // สร้างชื่อไฟล์ใหม่
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newFilename = uniqid() . '.' . $extension;
    $uploadPath = __DIR__ . '/../data/course_img/' . $newFilename;

    // อัพโหลดไฟล์
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('ไม่สามารถอัพโหลดไฟล์ได้');
    }

    return $newFilename;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!isset($_GET['action']) || $_GET['action'] !== 'get') {
            sendError('Invalid action');
        }

        if (isset($_GET['id'])) {
            // Get specific course
            $stmt = $db->prepare("
                SELECT l.*, 
                       (SELECT COUNT(*) FROM vocabulary WHERE lesson_id = l.id) as vocab_count
                FROM lessons l 
                WHERE l.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $course = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$course) {
                sendError('ไม่พบบทเรียนที่ต้องการ', 404);
            }
            
            echo json_encode(['success' => true, 'course' => $course]);
        } else {
            // Get all courses with additional info
            $stmt = $db->query("
                SELECT l.*, 
                       (SELECT COUNT(*) FROM vocabulary WHERE lesson_id = l.id) as vocab_count,
                       (SELECT COUNT(*) FROM exams WHERE lesson_id = l.id) as exam_count
                FROM lessons l
                ORDER BY l.created_at DESC
            ");
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'courses' => $courses]);
        }
    } 
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_POST['action'])) {
            // Add new course
            $error = validateCourseData($_POST['title'] ?? '', $_POST['category'] ?? '');
            if ($error) {
                sendError($error);
            }

            if (checkDuplicateTitle($db, $_POST['title'])) {
                sendError('มีบทเรียนชื่อนี้อยู่แล้ว');
            }

            $coverImg = null;
            if (isset($_FILES['cover_image'])) {
                $coverImg = handleCoverImage($_FILES['cover_image']);
            }

            $db->beginTransaction();
            try {
                $stmt = $db->prepare("
                    INSERT INTO lessons (title, category, cover_img, created_at) 
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ");
                $success = $stmt->execute([$_POST['title'], $_POST['category'], $coverImg]);
                $newId = $db->lastInsertId();
                
                $db->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'เพิ่มบทเรียนสำเร็จ',
                    'courseId' => $newId
                ]);
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        } else {
            switch ($_POST['action']) {
                case 'update':
                    $error = validateCourseData($_POST['title'] ?? '', $_POST['category'] ?? '');
                    if ($error) {
                        sendError($error);
                    }

                    if (checkDuplicateTitle($db, $_POST['title'], $_POST['id'])) {
                        sendError('มีบทเรียนชื่อนี้อยู่แล้ว');
                    }

                    $coverImg = null;
                    if (isset($_FILES['cover_image'])) {
                        $coverImg = handleCoverImage($_FILES['cover_image']);
                        
                        // ลบรูปภาพเก่า
                        $stmt = $db->prepare("SELECT cover_img FROM lessons WHERE id = ?");
                        $stmt->execute([$_POST['id']]);
                        $oldImage = $stmt->fetchColumn();
                        if ($oldImage) {
                            $oldPath = __DIR__ . '/../data/course_img/' . $oldImage;
                            if (file_exists($oldPath)) {
                                unlink($oldPath);
                            }
                        }
                    }

                    $sql = "UPDATE lessons SET title = ?, category = ?";
                    $params = [$_POST['title'], $_POST['category']];
                    
                    if ($coverImg) {
                        $sql .= ", cover_img = ?";
                        $params[] = $coverImg;
                    }
                    
                    $sql .= " WHERE id = ?";
                    $params[] = $_POST['id'];

                    $stmt = $db->prepare($sql);
                    $success = $stmt->execute($params);
                    
                    if ($success) {
                        echo json_encode([
                            'success' => true,
                            'message' => 'อัพเดทบทเรียนสำเร็จ'
                        ]);
                    } else {
                        sendError('ไม่สามารถอัพเดทบทเรียนได้');
                    }
                    break;

                case 'delete':
                    $db->beginTransaction();
                    try {
                        // Check if course has related data
                        $stmt = $db->prepare("
                            SELECT 
                                (SELECT COUNT(*) FROM vocabulary WHERE lesson_id = ?) as vocab_count,
                                (SELECT COUNT(*) FROM exams WHERE lesson_id = ?) as exam_count
                        ");
                        $stmt->execute([$_POST['id'], $_POST['id']]);
                        $counts = $stmt->fetch(PDO::FETCH_ASSOC);

                        // Delete related data first
                        if ($counts['vocab_count'] > 0) {
                            $stmt = $db->prepare("DELETE FROM vocabulary WHERE lesson_id = ?");
                            $stmt->execute([$_POST['id']]);
                        }
                        if ($counts['exam_count'] > 0) {
                            $stmt = $db->prepare("DELETE FROM exams WHERE lesson_id = ?");
                            $stmt->execute([$_POST['id']]);
                        }

                        // Delete the lesson
                        $stmt = $db->prepare("DELETE FROM lessons WHERE id = ?");
                        $success = $stmt->execute([$_POST['id']]);

                        $db->commit();
                        echo json_encode([
                            'success' => true,
                            'message' => 'ลบบทเรียนสำเร็จ'
                        ]);
                    } catch (Exception $e) {
                        $db->rollBack();
                        throw $e;
                    }
                    break;

                default:
                    sendError('Invalid action');
                    break;
            }
        }
    } else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Error in manageCourses.php: " . $e->getMessage());
    sendError('เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง', 500);
}