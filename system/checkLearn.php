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
        // ถ้ายังไม่มีข้อมูล ให้สร้างใหม่
        $sql = "INSERT INTO learning_progress (user_id, lesson_id, current_vocab_index) 
                VALUES (?, ?, 0)";
        $stmt = $db->prepare($sql);
        $stmt->execute([$userId, $lessonId]);
        
        echo json_encode([
            'success' => true,
            'hasPretest' => false,
            'currentVocabIndex' => 0
        ]);
    } else {
        // ถ้ามีข้อมูลแล้ว
        echo json_encode([
            'success' => true,
            'hasPretest' => ($result['pretest_done'] == 1),
            'currentVocabIndex' => $result['current_vocab_index']
        ]);
    }
}

// ถ้าเป็นการอัพเดทความก้าวหน้า
if ($action === 'update') {
    $currentVocabIndex = $_POST['currentVocabIndex'];
    
    // เช็คจำนวนคำศัพท์ทั้งหมดในบทเรียน
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM vocabulary WHERE lesson_id = ?");
    $stmt->execute([$lessonId]);
    $totalVocab = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // ถ้า currentVocabIndex เท่ากับจำนวนคำศัพท์ทั้งหมด-1 แสดงว่าเรียนครบแล้ว
    $completed = ($currentVocabIndex == $totalVocab - 1) ? 1 : 0;
    
    $sql = "UPDATE learning_progress 
            SET current_vocab_index = ?,
                completed = ?,
                last_accessed = CURRENT_TIMESTAMP
            WHERE user_id = ? AND lesson_id = ?";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([$currentVocabIndex, $completed, $userId, $lessonId]);
    
    echo json_encode(['success' => true]);
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