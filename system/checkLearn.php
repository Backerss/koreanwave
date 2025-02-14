<?php
session_start();
require_once 'db.php';

function checkLessonExams($lessonId) {
    global $db;
    
    try {
        $stmt = $db->prepare("
            SELECT exam_type 
            FROM exams 
            WHERE lesson_id = ?
        ");
        $stmt->execute([$lessonId]);
        $exams = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        return [
            'success' => true,
            'hasPretest' => in_array('pretest', $exams),
            'hasPosttest' => in_array('posttest', $exams),
            'userRole' => $_SESSION['user_data']['role'] ?? 'student'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// รับค่าที่ส่งมาแบบ GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['lesson_id'])) {
        $result = checkLessonExams($_GET['lesson_id']);
        echo json_encode($result);
        exit;
    } else {
        echo json_encode(['success' => false, 'message' => 'No lesson_id provided']);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProgress') {
    $lessonId = $_GET['lesson_id'];
    $userId = $_SESSION['user_data']['id'];
    
    try {
        // ดึงข้อมูลความก้าวหน้า
        $stmt = $db->prepare("
            SELECT current_vocab_index, completed, pretest_done, posttest_done
            FROM learning_progress 
            WHERE user_id = ? AND lesson_id = ?
        ");
        $stmt->execute([$userId, $lessonId]);
        $progress = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($progress) {
            echo json_encode([
                'success' => true,
                'currentVocabIndex' => (int)$progress['current_vocab_index'],
                'completed' => (bool)$progress['completed'],
                'pretestDone' => (bool)$progress['pretest_done'],
                'posttestDone' => (bool)$progress['posttest_done']
            ]);
        } else {
            // ถ้ายังไม่มีข้อมูล สร้างใหม่
            $stmt = $db->prepare("
                INSERT INTO learning_progress 
                (user_id, lesson_id, current_vocab_index, completed, pretest_done, posttest_done)
                VALUES (?, ?, 0, 0, 0, 0)
            ");
            $stmt->execute([$userId, $lessonId]);
            
            echo json_encode([
                'success' => true,
                'currentVocabIndex' => 0,
                'completed' => false,
                'pretestDone' => false,
                'posttestDone' => false
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// รับค่าที่ส่งมา
$lessonId = $_POST['lessonId']; 
$userId = $_SESSION['user_data']['id'];
$action = $_POST['action'] ?? 'check'; // default เป็น check

// ถ้าเป็นการเช็คสถานะ
if ($action === 'check') {
    // เช็คว่ามีข้อมูลในตารางหรือยัง
    $sql = "SELECT * FROM learning_progress 
            WHERE user_id = ? AND lesson_id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([$userId, $lessonId]);
    $result = $stmt->fetch();

    if (!$result) {
        // สร้างข้อมูลใหม่
        $sql = "INSERT INTO learning_progress 
                (user_id, lesson_id, current_vocab_index, pretest_done) 
                VALUES (?, ?, 0, 0)";
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId, $lessonId]);
        
        echo json_encode([
            'success' => true,
            'hasPretest' => false,
            'currentVocabIndex' => 0
        ]);
    } else {
        // ส่งข้อมูลที่มีอยู่
        echo json_encode([
            'success' => true,
            'hasPretest' => (bool)$result['pretest_done'],
            'currentVocabIndex' => (int)$result['current_vocab_index']
        ]);
    }
}

// ถ้าเป็นการอัพเดทความก้าวหน้า
if ($action === 'update') {
    $currentVocabIndex = $_POST['currentVocabIndex'];
    $lessonId = $_POST['lessonId'];
    $userId = $_SESSION['user_data']['id'];
    
    error_log("Updating progress for user $userId, lesson $lessonId, index $currentVocabIndex");
    
    try {
        // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        $stmt = $db->prepare("
            SELECT current_vocab_index 
            FROM learning_progress 
            WHERE user_id = ? AND lesson_id = ?
        ");
        $stmt->execute([$userId, $lessonId]);
        $existingProgress = $stmt->fetch();
        
        error_log("Existing progress: " . json_encode($existingProgress));
        
        if ($existingProgress) {
            // อัพเดทข้อมูลที่มีอยู่
            $stmt = $db->prepare("
                UPDATE learning_progress 
                SET current_vocab_index = ?,
                    last_accessed = CURRENT_TIMESTAMP
                WHERE user_id = ? AND lesson_id = ?
            ");
            $success = $stmt->execute([$currentVocabIndex, $userId, $lessonId]);
            error_log("Update success: " . ($success ? "true" : "false"));
        } else {
            // สร้างข้อมูลใหม่
            $stmt = $db->prepare("
                INSERT INTO learning_progress 
                (user_id, lesson_id, current_vocab_index, created_at, last_accessed)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $success = $stmt->execute([$userId, $lessonId, $currentVocabIndex]);
            error_log("Insert success: " . ($success ? "true" : "false"));
        }
        
        // ดึงค่าปัจจุบันเพื่อยืนยัน
        $stmt = $db->prepare("
            SELECT current_vocab_index 
            FROM learning_progress 
            WHERE user_id = ? AND lesson_id = ?
        ");
        $stmt->execute([$userId, $lessonId]);
        $currentProgress = $stmt->fetch();
        
        error_log("Final progress state: " . json_encode($currentProgress));
        
        echo json_encode([
            'success' => $success,
            'currentVocabIndex' => (int)$currentProgress['current_vocab_index'],
            'requestedIndex' => (int)$currentVocabIndex,
            'synchronized' => (int)$currentProgress['current_vocab_index'] === (int)$currentVocabIndex
        ]);
        
    } catch (Exception $e) {
        error_log("Error updating progress: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มเงื่อนไขสำหรับ markAsCompleted
if ($action === 'markAsCompleted') {
    try {
        $stmt = $db->prepare("
            UPDATE learning_progress 
            SET completed = 1,
                last_accessed = CURRENT_TIMESTAMP
            WHERE user_id = ? AND lesson_id = ?
        ");
        
        $success = $stmt->execute([$userId, $lessonId]);
        
        echo json_encode([
            'success' => $success,
            'completed' => true
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'checkExams') {
    $lessonId = $_POST['lessonId'];
    $userId = $_SESSION['user_data']['id'];

    try {
        // ตรวจสอบสถานะการทำแบบทดสอบจากตาราง learning_progress
        $stmt = $db->prepare("
            SELECT pretest_done, posttest_done 
            FROM learning_progress 
            WHERE user_id = ? AND lesson_id = ?
        ");
        $stmt->execute([$userId, $lessonId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {
            // ถ้ายังไม่มีข้อมูล สร้างใหม่
            $stmt = $db->prepare("
                INSERT INTO learning_progress (user_id, lesson_id, pretest_done, posttest_done)
                VALUES (?, ?, 0, 0)
            ");
            $stmt->execute([$userId, $lessonId]);
            
            echo json_encode([
                'success' => true,
                'pretest_done' => false,
                'posttest_done' => false
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'pretest_done' => (bool)$result['pretest_done'],
                'posttest_done' => (bool)$result['posttest_done']
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>