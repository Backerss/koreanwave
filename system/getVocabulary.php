<?php
require_once 'db.php';

if(isset($_GET['lessonId'])) {
    $lessonId = $_GET['lessonId'];
    
    try {
        $stmt = $db->prepare("
            SELECT id, word_th, word_en, word_kr, audio_url, deteil_word 
            FROM vocabulary 
            WHERE lesson_id = ?
            ORDER BY id DESC
        ");
        $stmt->execute([$lessonId]);
        $vocabulary = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'vocabulary' => $vocabulary
        ]);
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล'
        ]);
    }
}