<?php
session_start();
require_once '../../system/db.php';

// ตรวจสอบการล็อกอิน
if (!isset($_SESSION['user_data']['id'])) {
    header('Location: ../auth/login.html');
    exit();
}

// ตรวจสอบ result_id
if (!isset($_GET['result_id'])) {
    header('Location: home.php');
    exit();
}

try {
    // Query ข้อมูลจากตาราง exam_results และเชื่อมกับตารางที่เกี่ยวข้อง
    $stmt = $db->prepare("
        SELECT er.*, e.exam_type, l.title as lesson_title
        FROM exam_results er
        JOIN exams e ON er.exam_id = e.id 
        JOIN lessons l ON e.lesson_id = l.id
        WHERE er.id = ? AND er.user_id = ?
    ");
    $stmt->execute([$_GET['result_id'], $_SESSION['user_data']['id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        header('Location: home.php');
        exit();
    }

} catch (Exception $e) {
    die('เกิดข้อผิดพลาด: ' . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ผลการสอบ - Korean Wave</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
            font-family: 'Sarabun', sans-serif;
        }

        .result-card {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
        }

        .score-circle {
            width: 200px;
            height: 200px;
            margin: 0 auto 2rem;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .score-circle::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
                #4CAF50 <?php echo ($result['score']); ?>%, 
                #f0f0f0 0
            );
        }

        .score-inner {
            width: 160px;
            height: 160px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            position: relative;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }

        .score-number {
            font-size: 3.5rem;
            font-weight: bold;
            color: #2196F3;
            line-height: 1;
            margin-bottom: 5px;
        }

        .score-text {
            color: #666;
            font-size: 1.1rem;
        }

        .result-details {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .result-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.8rem 0;
            border-bottom: 1px solid #dee2e6;
        }

        .result-item:last-child {
            border-bottom: none;
        }

        .result-label {
            color: #666;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .result-value {
            font-weight: 500;
            color: #2196F3;
        }

        .btn-home {
            background: #2196F3;
            color: white;
            padding: 1rem 2.5rem;
            border-radius: 10px;
            border: none;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .btn-home:hover {
            background: #1976D2;
            transform: translateY(-2px);
            color: white;
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .result-card {
            animation: fadeInUp 0.8s ease-out;
        }
    </style>
</head>
<body>
    <div class="result-card">
        <div class="score-circle">
            <div class="score-inner">
                <div class="score-number"><?php echo number_format($result['score'], 0); ?></div>
                <div class="score-text">คะแนน</div>
            </div>
        </div>

        <div class="result-details">
            <h4 class="mb-4">
                <?php 
                echo $result['exam_type'] === 'pretest' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน';
                ?>
            </h4>
            <div class="result-item">
                <div class="result-label">
                    <i class="fas fa-book"></i>
                    บทเรียน
                </div>
                <div class="result-value"><?php echo htmlspecialchars($result['lesson_title']); ?></div>
            </div>
            <div class="result-item">
                <div class="result-label">
                    <i class="fas fa-check-circle"></i>
                    ตอบถูก
                </div>
                <div class="result-value"><?php echo $result['correct_answers']; ?> จาก <?php echo $result['total_questions']; ?> ข้อ</div>
            </div>
        </div>

        <a href="home.php" class="btn-home">
            <i class="fas fa-home"></i>
            กลับสู่หน้าหลัก
        </a>
    </div>
</body>
</html>