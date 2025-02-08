<?php
session_start();
require_once 'db.php';

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
?>