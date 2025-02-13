<?php
session_start();
require_once 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'create':
                createExam();
                break;
            case 'delete':
                deleteExam($_POST['examId']);
                break;
            case 'deleteQuestion':
                deleteQuestion($_POST['questionId']);
                break;
            case 'addQuestion':
                addQuestion($_POST['questionData']);
                break;
            case 'updateQuestion':
                updateQuestion($_POST['questionData']);
                break;
            case 'submitExam':
                if (!isset($_POST['exam_id']) || !isset($_POST['answers']) || !isset($_POST['time_spent'])) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'ข้อมูลไม่ครบถ้วน'
                    ]);
                    exit;
                }
                submitExam($_POST['exam_id'], $_POST['answers'], $_POST['time_spent']);
                break;
            case 'updatePretestStatus':
                if (!isset($_POST['lesson_id'])) {
                    echo json_encode(['success' => false, 'message' => 'Missing lesson_id']);
                    exit;
                }

                try {
                    $userId = $_SESSION['user_data']['id'];
                    $lessonId = $_POST['lesson_id'];

                    // อัพเดทสถานะ pretest_done เป็น 1
                    $stmt = $db->prepare("
                        UPDATE learning_progress 
                        SET pretest_done = 1 
                        WHERE user_id = ? AND lesson_id = ?
                    ");
                    
                    // ถ้ายังไม่มีข้อมูลให้สร้างใหม่
                    if ($stmt->execute([$userId, $lessonId]) && $stmt->rowCount() === 0) {
                        $stmt = $db->prepare("
                            INSERT INTO learning_progress 
                            (user_id, lesson_id, pretest_done) 
                            VALUES (?, ?, 1)
                        ");
                        $stmt->execute([$userId, $lessonId]);
                    }

                    echo json_encode(['success' => true]);
                } catch (Exception $e) {
                    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                }
                break;
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'list':
                getExamList($_GET['lessonId'] ?? null);
                break;
            case 'view':
                viewExam($_GET['examId']);
                break;
            case 'getQuestion':
                getQuestion($_GET['questionId']);
                break;
            case 'getExistingExams':
                getExistingExams();
                break;
            case 'loadExamQuestions':
                loadExamQuestions($_GET['examId']);
                break;
            case 'getExamByLessonAndType':
                getExamByLessonAndType($_GET['lessonId'], $_GET['examType']);
                break;
        }
    }
}

function createExam() {
    global $db;
    
    try {
        $examData = json_decode($_POST['examData'], true);
        
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!validateExamData($examData)) {
            throw new Exception('ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง');
        }

        // ตรวจสอบว่ามีข้อสอบประเภทนี้อยู่แล้วหรือไม่
        if (examExists($examData['lessonId'], $examData['examType'])) {
            throw new Exception('บทเรียนนี้มีข้อสอบประเภทนี้อยู่แล้ว');
        }

        $db->beginTransaction();

        // สร้างข้อสอบใหม่
        $examId = insertExam($examData['lessonId'], $examData['examType']);

        // เพิ่มคำถามทั้งหมด
        insertQuestions($examId, $examData['questions']);

        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'บันทึกข้อสอบเรียบร้อยแล้ว',
            'examId' => $examId
        ]);

    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
        ]);
    }
}

// ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลข้อสอบ
function validateExamData($examData) {
    if (!isset($examData['lessonId']) || !isset($examData['examType']) || empty($examData['questions'])) {
        return false;
    }

    if (!in_array($examData['examType'], ['pretest', 'posttest'])) {
        return false;
    }

    foreach ($examData['questions'] as $question) {
        if (!validateQuestionData($question)) {
            return false;
        }
    }

    return true;
}

// ฟังก์ชันตรวจสอบความถูกต้องของข้อมูลคำถาม
function validateQuestionData($question) {
    $requiredFields = ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
    
    foreach ($requiredFields as $field) {
        if (!isset($question[$field]) || trim($question[$field]) === '') {
            return false;
        }
    }

    if (!in_array($question['correctAnswer'], ['A', 'B', 'C', 'D'])) {
        return false;
    }

    return true;
}

// ฟังก์ชันตรวจสอบว่ามีข้อสอบอยู่แล้วหรือไม่
function examExists($lessonId, $examType) {
    global $db;
    
    $stmt = $db->prepare("
        SELECT COUNT(*) 
        FROM exams 
        WHERE lesson_id = ? AND exam_type = ?
    ");
    $stmt->execute([$lessonId, $examType]);
    
    return $stmt->fetchColumn() > 0;
}

// ฟังก์ชันเพิ่มข้อสอบ
function insertExam($lessonId, $examType) {
    global $db;
    
    $stmt = $db->prepare("
        INSERT INTO exams (lesson_id, exam_type, created_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
    ");
    $stmt->execute([$lessonId, $examType]);
    
    return $db->lastInsertId();
}

// ฟังก์ชันเพิ่มคำถาม
function insertQuestions($examId, $questions) {
    global $db;
    
    $stmt = $db->prepare("
        INSERT INTO questions (
            exam_id, 
            question_text,
            option_a, 
            option_b, 
            option_c, 
            option_d,
            correct_answer
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($questions as $question) {
        $stmt->execute([
            $examId,
            trim($question['questionText']),
            trim($question['optionA']),
            trim($question['optionB']),
            trim($question['optionC']),
            trim($question['optionD']),
            $question['correctAnswer']
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับดึงรายการข้อสอบ
function getExamList($lessonId = null) {
    global $db;
    
    try {
        $sql = "
            SELECT e.*, l.title as lesson_title,
                   COUNT(q.id) as question_count
            FROM exams e
            JOIN lessons l ON e.lesson_id = l.id
            LEFT JOIN questions q ON e.id = q.exam_id
        ";
        
        $params = [];
        if ($lessonId) {
            $sql .= " WHERE e.lesson_id = ?";
            $params[] = $lessonId;
        }
        
        $sql .= " GROUP BY e.id ORDER BY e.created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode([
            'success' => true,
            'exams' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับดูรายละเอียดข้อสอบ
function viewExam($examId) {
    global $db;
    
    try {
        // ดึงข้อมูลข้อสอบ
        $stmt = $db->prepare("
            SELECT e.*, l.title as lesson_title
            FROM exams e
            JOIN lessons l ON e.lesson_id = l.id
            WHERE e.id = ?
        ");
        $stmt->execute([$examId]);
        $exam = $stmt->fetch(PDO::FETCH_ASSOC);
        
        /*if (!$exam) {
            throw new Exception('ไม่พบข้อสอบ');
        }*/
        
        // ดึงคำถามทั้งหมด
        $stmt = $db->prepare("
            SELECT * FROM questions 
            WHERE exam_id = ?
            ORDER BY id ASC
        ");
        $stmt->execute([$examId]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'exam' => $exam,
            'questions' => $questions
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับลบข้อสอบ
function deleteExam($examId) {
    global $db;
    
    try {
        $db->beginTransaction();
        
        // ลบคำถามทั้งหมดของข้อสอบ
        $stmt = $db->prepare("DELETE FROM questions WHERE exam_id = ?");
        $stmt->execute([$examId]);
        
        // ลบข้อสอบ
        $stmt = $db->prepare("DELETE FROM exams WHERE id = ?");
        $stmt->execute([$examId]);
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'ลบข้อสอบเรียบร้อยแล้ว'
        ]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับลบคำถาม
function deleteQuestion($questionId) {
    global $db;
    
    try {
        $stmt = $db->prepare("DELETE FROM questions WHERE id = ?");
        $stmt->execute([$questionId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'ลบข้อสอบเรียบร้อยแล้ว'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// แก้ไขฟังก์ชัน addQuestion ให้มีการตรวจสอบที่ดีขึ้น
function addQuestion($questionDataJson) {
    global $db;
    
    try {
        $questionData = json_decode($questionDataJson, true);
        
        if (!validateQuestionData($questionData)) {
            throw new Exception('ข้อมูลคำถามไม่ครบถ้วนหรือไม่ถูกต้อง');
        }

        // ตรวจสอบว่าข้อสอบยังมีอยู่หรือไม่
        $stmt = $db->prepare("SELECT COUNT(*) FROM exams WHERE id = ?");
        $stmt->execute([$questionData['examId']]);
        if ($stmt->fetchColumn() == 0) {
            throw new Exception('ไม่พบข้อสอบที่ต้องการเพิ่มคำถาม');
        }

        $stmt = $db->prepare("
            INSERT INTO questions (
                exam_id,
                question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $questionData['examId'],
            trim($questionData['questionText']),
            trim($questionData['optionA']),
            trim($questionData['optionB']),
            trim($questionData['optionC']),
            trim($questionData['optionD']),
            $questionData['correctAnswer']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'เพิ่มคำถามเรียบร้อยแล้ว',
            'questionId' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับดึงข้อมูลคำถามเดี่ยว
function getQuestion($questionId) {
    global $db;
    
    try {
        $stmt = $db->prepare("
            SELECT q.*, e.id as exam_id 
            FROM questions q
            JOIN exams e ON q.exam_id = e.id
            WHERE q.id = ?
        ");
        $stmt->execute([$questionId]);
        $question = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$question) {
            throw new Exception('ไม่พบข้อมูลคำถาม');
        }
        
        echo json_encode([
            'success' => true,
            'question' => $question
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับอัปเดตคำถาม
function updateQuestion($questionDataJson) {
    global $db;
    
    try {
        $questionData = json_decode($questionDataJson, true);
        
        $stmt = $db->prepare("
            UPDATE questions 
            SET question_text = ?,
                option_a = ?,
                option_b = ?,
                option_c = ?,
                option_d = ?,
                correct_answer = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $questionData['questionText'],
            $questionData['optionA'],
            $questionData['optionB'],
            $questionData['optionC'],
            $questionData['optionD'],
            $questionData['correctAnswer'],
            $questionData['questionId']
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'อัปเดตข้อสอบเรียบร้อยแล้ว'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันใหม่สำหรับดึงรายการข้อสอบที่มีอยู่แล้ว
function getExistingExams() {
    global $db;
    
    try {
        $stmt = $db->prepare("
            SELECT lesson_id, exam_type
            FROM exams
            WHERE 1
        ");
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'existingExams' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับโหลดคำถามของข้อสอบ
function loadExamQuestions($examId) {
    global $db;
    
    try {
        // Fetch exam details
        $stmt = $db->prepare("
            SELECT e.*, l.title as lesson_title 
            FROM exams e
            JOIN lessons l ON e.lesson_id = l.id
            WHERE e.id = ?
        ");
        $stmt->execute([$examId]);
        $exam = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$exam) {
            throw new Exception('ไม่พบแบบทดสอบ');
        }
        
        // Fetch questions
        $stmt = $db->prepare("
            SELECT * FROM questions 
            WHERE exam_id = ?
            ORDER BY id ASC
        ");
        $stmt->execute([$examId]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'exam' => $exam,
            'questions' => $questions
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Add this new function at the bottom of the file
function submitExam($examId, $answers, $timeSpent) {
    global $db;
    $userId = $_SESSION['user_data']['id'];
    
    try {
        // Get exam details
        $stmt = $db->prepare("
            SELECT e.*, l.id as lesson_id 
            FROM exams e 
            JOIN lessons l ON e.lesson_id = l.id 
            WHERE e.id = ?
        ");
        $stmt->execute([$examId]);
        $exam = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$exam) {
            throw new Exception('ไม่พบข้อสอบ');
        }

        $db->beginTransaction();

        try {
            // Calculate score
            $answers = json_decode($answers, true);
            $totalQuestions = count($answers);
            $correctAnswers = 0;
            
            // ตรวจสอบคำตอบและนับจำนวนข้อที่ถูก
            $stmt = $db->prepare("SELECT id, correct_answer FROM questions WHERE exam_id = ?");
            $stmt->execute([$examId]);
            $correctAnswersMap = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            foreach ($answers as $answer) {
                if (isset($correctAnswersMap[$answer['question_id']]) && 
                    $answer['answer'] === $correctAnswersMap[$answer['question_id']]) {
                    $correctAnswers++;
                }
            }

            // คำนวณคะแนนเป็นเปอร์เซ็นต์
            $score = ($correctAnswers / $totalQuestions) * 100;
            
            // แก้ไขคำสั่ง INSERT โดยไม่ต้องระบุ created_at
            $stmt = $db->prepare("
                INSERT INTO exam_results (
                    exam_id,
                    user_id,
                    score,
                    time_spent,
                    correct_answers,
                    total_questions,
                    answers_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $examId,
                $userId,
                $score,
                $timeSpent,
                $correctAnswers,
                $totalQuestions,
                json_encode($answers)
            ]);

            $resultId = $db->lastInsertId();

            // Update learning progress based on exam type
            if ($exam['exam_type'] === 'pretest') {
                // ตรวจสอบว่ามีข้อมูลใน learning_progress หรือไม่
                $checkStmt = $db->prepare("
                    SELECT id 
                    FROM learning_progress 
                    WHERE user_id = ? AND lesson_id = ?
                ");
                $checkStmt->execute([$userId, $exam['lesson_id']]);
                $existingProgress = $checkStmt->fetch();

                if ($existingProgress) {
                    // ถ้ามีข้อมูลอยู่แล้ว ให้อัพเดท pretest_done
                    $stmt = $db->prepare("
                        UPDATE learning_progress 
                        SET pretest_done = 1 
                        WHERE user_id = ? AND lesson_id = ?
                    ");
                    $stmt->execute([$userId, $exam['lesson_id']]);
                } else {
                    // ถ้ายังไม่มีข้อมูล ให้เพิ่มใหม่
                    $stmt = $db->prepare("
                        INSERT INTO learning_progress 
                            (user_id, lesson_id, pretest_done, current_vocab_index) 
                        VALUES (?, ?, 1, 0)
                    ");
                    $stmt->execute([$userId, $exam['lesson_id']]);
                }

            } elseif ($exam['exam_type'] === 'posttest') {
                $passed = $score >= 50;
                $stmt = $db->prepare("
                    UPDATE learning_progress SET 
                        posttest_done = 1,
                        completed = :completed,
                        best_score = CASE 
                            WHEN best_score < :score OR best_score IS NULL 
                            THEN :score 
                            ELSE best_score 
                        END
                    WHERE user_id = :user_id 
                    AND lesson_id = :lesson_id
                ");
                $stmt->execute([
                    'completed' => $passed ? 1 : 0,
                    'score' => $score,
                    'user_id' => $userId,
                    'lesson_id' => $exam['lesson_id']
                ]);
            }

            $db->commit();

            echo json_encode([
                'success' => true,
                'score' => $score,
                'correctAnswers' => $correctAnswers,
                'totalQuestions' => $totalQuestions,
                'redirect_url' => "../view/result.php?result_id=" . $resultId
            ]);

        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// เพิ่มฟังก์ชันสำหรับดึงข้อสอบตามบทเรียนและประเภท
function getExamByLessonAndType($lessonId, $examType) {
    global $db;
    
    try {
        $stmt = $db->prepare("
            SELECT id, exam_type
            FROM exams 
            WHERE lesson_id = ? AND exam_type = ?
        ");
        $stmt->execute([$lessonId, $examType]);
        $exam = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'exam' => $exam
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Add this function to handle exam submission results
function handlePostTestSubmission($examId, $userId, $lessonId, $score, $totalQuestions) {
    global $db;
    
    try {
        $db->beginTransaction();
        
        // คำนวณเปอร์เซ็นต์คะแนน
        $percentScore = ($score / $totalQuestions) * 100;
        $passed = $percentScore >= 50; // ผ่านที่ 50%
        
        // อัพเดทสถานะการเรียน
        $sql = "UPDATE learning_progress SET 
                posttest_done = 1,
                completed = :completed,
                current_vocab_index = :vocab_index
                WHERE user_id = :user_id 
                AND lesson_id = :lesson_id";
                
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'completed' => $passed ? 1 : 0,
            'vocab_index' => $passed ? null : 0, // ถ้าไม่ผ่านให้ reset index เป็น 0
            'user_id' => $userId,
            'lesson_id' => $lessonId
        ]);
        
        $db->commit();
        
        return [
            'success' => true,
            'passed' => $passed,
            'score' => $score,
            'totalQuestions' => $totalQuestions,
            'percentage' => $percentScore
        ];
        
    } catch (Exception $e) {
        $db->rollBack();
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

// เพิ่มฟังก์ชัน calculateScore
function calculateScore($examId, $userAnswers) {
    global $db;
    
    try {
        // ดึงคำตอบที่ถูกต้องจากฐานข้อมูล
        $stmt = $db->prepare("
            SELECT id, correct_answer 
            FROM questions 
            WHERE exam_id = ?
        ");
        $stmt->execute([$examId]);
        $correctAnswers = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        if (empty($correctAnswers)) {
            throw new Exception('ไม่พบข้อมูลคำถาม');
        }

        // คำนวณคะแนน
        $score = 0;
        $totalQuestions = count($correctAnswers);

        foreach ($userAnswers as $answer) {
            $questionId = $answer['question_id'];
            if (isset($correctAnswers[$questionId]) && 
                $answer['answer'] === $correctAnswers[$questionId]) {
                $score++;
            }
        }

        // คำนวณเป็นเปอร์เซ็นต์
        return ($score / $totalQuestions) * 100;

    } catch (Exception $e) {
        throw new Exception('ไม่สามารถคำนวณคะแนนได้: ' . $e->getMessage());
    }
}