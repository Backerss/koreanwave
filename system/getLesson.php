<?php
require_once 'db.php';

if(isset($_GET['lessonId'])) {
    $lessonId = $_GET['lessonId'];
    
    try {
        // Get lesson data
        $lessonStmt = $db->prepare("SELECT * FROM lessons WHERE id = ?");
        $lessonStmt->execute([$lessonId]);
        $lesson = $lessonStmt->fetch();

        if($lesson) {
            // Get all vocabulary for this lesson
            $vocabStmt = $db->prepare("SELECT * FROM vocabulary WHERE lesson_id = ?");
            $vocabStmt->execute([$lessonId]);
            $vocabulary = $vocabStmt->fetchAll();

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