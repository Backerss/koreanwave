<?php
require_once '../../system/db.php';

// Check if exam_id is provided
if (!isset($_GET['exam_id'])) {
    die('กรุณาระบุแบบทดสอบ');
}

$examId = $_GET['exam_id'];

// Fetch exam details and questions
try {
    $stmt = $db->prepare("
        SELECT e.*, l.title as lesson_title 
        FROM exams e
        JOIN lessons l ON e.lesson_id = l.id
        WHERE e.id = ?
    ");
    $stmt->execute([$examId]);
    $exam = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$exam) {
        die('ไม่พบแบบทดสอบ');
    }

    // Fetch questions
    $stmt = $db->prepare("
        SELECT * FROM questions 
        WHERE exam_id = ?
        ORDER BY id ASC
    ");
    $stmt->execute([$examId]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    die('เกิดข้อผิดพลาด: ' . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แบบทดสอบ - Korean Wave</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- SweetAlert2 -->
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="../../css/exam.css" rel="stylesheet">
</head>
<body>
    <div class="page" id="examPage">
        <div class="exam-container">
            <!-- Header Section -->
            <div class="exam-header">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h3 class="exam-title">
                            <i class="fas fa-file-alt me-2"></i>
                            <span id="examType">แบบทดสอบก่อนเรียน</span>
                        </h3>
                        <p class="text-muted" id="lessonTitle">บทที่ 1: การทักทายในภาษาเกาหลี</p>
                    </div>
                    <div class="col-md-4">
                        <div class="exam-info">
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span id="timeRemaining">20:00</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-list-ol"></i>
                                <span id="questionCount">10 ข้อ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Form -->
            <form id="examForm">
                <div class="questions-container">
                    <!-- Questions will be loaded dynamically -->
                </div>

                <!-- Navigation -->
                <div class="exam-navigation">
                    <div class="questions-progress">
                        <span id="answeredCount">ตอบแล้ว 0/10 ข้อ</span>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-primary submit-exam">
                        <i class="fas fa-check-circle me-2"></i>ส่งคำตอบ
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Custom JS -->
    <script src="../../js/exam.js"></script>
</body>
</html>