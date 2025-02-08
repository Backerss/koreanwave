<?php
require_once 'db.php';

if(isset($_GET['lessonId'])) {
    $lessonId = $_GET['lessonId'];
    
    try {        
        // Get lesson data
        $lessonStmt = $db->prepare("SELECT * FROM lessons WHERE id = ?");
        $lessonStmt->execute([$lessonId]);
        $lesson = $lessonStmt->fetch(PDO::FETCH_ASSOC);

        if($lesson) {
            // Get all vocabulary for this lesson including audio_url
            $vocabStmt = $db->prepare("
                SELECT id, word_th, word_en, word_kr, audio_url, deteil_word, 
                       example_one, example_two, img_url 
                FROM vocabulary 
                WHERE lesson_id = ?
            ");
            $vocabStmt->execute([$lessonId]);
            $vocabulary = $vocabStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'lesson' => $lesson,
                'vocabulary' => $vocabulary,
                'totalVocab' => count($vocabulary)
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Lesson not found'
            ]);
        }
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No lesson ID provided'
    ]);
}