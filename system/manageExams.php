<?php
require_once 'connect.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($_GET['action'] === 'list') {
        $lessonId = isset($_GET['lesson_id']) ? $_GET['lesson_id'] : '';
        
        $sql = "SELECT e.*, l.title as lesson_title, 
                (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count 
                FROM exams e 
                JOIN lessons l ON e.lesson_id = l.id";
                
        if ($lessonId) {
            $sql .= " WHERE e.lesson_id = ?";
        }
        
        $stmt = $conn->prepare($sql);
        if ($lessonId) {
            $stmt->bind_param('i', $lessonId);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $exams = $result->fetch_all(MYSQLI_ASSOC);
        
        echo json_encode(['success' => true, 'exams' => $exams]);
    }
    
    elseif ($_GET['action'] === 'view') {
        $examId = $_GET['exam_id'];
        
        $stmt = $conn->prepare("
            SELECT e.*, q.*, l.title as lesson_title 
            FROM exams e 
            JOIN questions q ON e.id = q.exam_id
            JOIN lessons l ON e.lesson_id = l.id
            WHERE e.id = ?
        ");
        
        $stmt->bind_param('i', $examId);
        $stmt->execute();
        $result = $stmt->get_result();
        $exam = [
            'info' => null,
            'questions' => []
        ];
        
        while ($row = $result->fetch_assoc()) {
            if (!$exam['info']) {
                $exam['info'] = [
                    'id' => $row['id'],
                    'lesson_id' => $row['lesson_id'],
                    'lesson_title' => $row['lesson_title'],
                    'exam_type' => $row['exam_type']
                ];
            }
            $exam['questions'][] = [
                'id' => $row['id'],
                'question_text' => $row['question_text'],
                'options' => [
                    'A' => $row['option_a'],
                    'B' => $row['option_b'],
                    'C' => $row['option_c'],
                    'D' => $row['option_d']
                ],
                'correct_answer' => $row['correct_answer']
            ];
        }
        
        echo json_encode(['success' => true, 'exam' => $exam]);
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['action'] === 'delete') {
        $examId = $_POST['exam_id'];
        
        $conn->begin_transaction();
        
        try {
            // Delete questions first
            $stmt = $conn->prepare("DELETE FROM questions WHERE exam_id = ?");
            $stmt->bind_param('i', $examId);
            $stmt->execute();
            
            // Then delete exam
            $stmt = $conn->prepare("DELETE FROM exams WHERE id = ?");
            $stmt->bind_param('i', $examId);
            $stmt->execute();
            
            $conn->commit();
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
?>