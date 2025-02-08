<?php
require_once 'db.php';

if(isset($_GET['vocab_id'])) {
    $vocabId = $_GET['vocab_id'];
    
    try {
        $stmt = $db->prepare("SELECT * FROM vocabulary WHERE id = ?");
        $stmt->execute([$vocabId]);
        $vocab = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($vocab) {
            echo json_encode([
                'success' => true,
                'vocab' => $vocab
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'ไม่พบข้อมูลคำศัพท์'
            ]);
        }
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        ]);
    }
}