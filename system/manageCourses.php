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

            $db->beginTransaction();
            try {
                $stmt = $db->prepare("
                    INSERT INTO lessons (title, category, created_at) 
                    VALUES (?, ?, CURRENT_TIMESTAMP)
                ");
                $success = $stmt->execute([$_POST['title'], $_POST['category']]);
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

                    $stmt = $db->prepare("
                        UPDATE lessons 
                        SET title = ?, category = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    ");
                    $success = $stmt->execute([
                        $_POST['title'],
                        $_POST['category'],
                        $_POST['id']
                    ]);
                    
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