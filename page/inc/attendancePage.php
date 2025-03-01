<?php

// ดึงข้อมูลบทเรียนทั้งหมด
try {
    $stmt = $db->query("SELECT * FROM lessons");
    $lessons = $stmt->fetchAll();
} catch (PDOException $e) {
    die("Error fetching lessons: " . $e->getMessage());
}

// นับจำนวนบทเรียนทั้งหมด
$lessonCountQuery = $db->query("SELECT COUNT(*) as total FROM lessons");
$totalLessons = $lessonCountQuery->fetch(PDO::FETCH_ASSOC)['total'];

// นับจำนวนคำศัพท์ทั้งหมด
$vocabCountQuery = $db->query("SELECT COUNT(*) as total FROM vocabulary");
$totalVocab = $vocabCountQuery->fetch(PDO::FETCH_ASSOC)['total'];

// ดึงข้อมูลความก้าวหน้าการเรียน
$userId = $_SESSION['user_data']['id'];
$progressQuery = $db->prepare("
    SELECT 
        COUNT(DISTINCT lesson_id) as completed_lessons,
        SUM(time_spent) as total_time_spent,
        AVG(CASE WHEN completed = 1 THEN 1 ELSE 0 END) * 100 as completion_rate
    FROM learning_progress 
    WHERE user_id = ?
");
$progressQuery->execute([$userId]);
$progress = $progressQuery->fetch(PDO::FETCH_ASSOC);

// จัดรูปแบบเวลาเรียน
$totalMinutes = $progress['total_time_spent'] ?? 0;
$hours = floor($totalMinutes / 60);
$minutes = $totalMinutes % 60;
$timeSpent = $hours > 0 ? "$hours ชั่วโมง $minutes นาที" : "$minutes นาที";

// คำนวณเปอร์เซ็นต์ความสำเร็จ
$completionPercentage = $totalLessons > 0 ? 
    round(($progress['completed_lessons'] / $totalLessons) * 100) : 0;

?>

<div class="page" id="attendancePage">
    <div class="container-fluid">
        <div class="page-header mb-4">
            <h3 class="page-title">บทเรียนที่เปิดสอน</h3>
            <p class="text-muted">วิชาภาษาเกาหลี 1</p>
        </div>

        <div class="row">
            <!-- บทเรียนที่ 3 -->
            <?php foreach ($lessons as $lesson): ?>
                <div class="col-md-4 mb-4">
                    <div class="card lesson-card">
                        <img src="../../data/course_img/<?php echo htmlspecialchars($lesson['cover_img'] ?? 'https://placehold.co/400x300'); ?>"
                            class="card-img-top" alt="<?php echo htmlspecialchars($lesson['title']); ?>">
                        <div class="card-body">
                            <h5 class="card-title"><?php echo htmlspecialchars($lesson['title']); ?></h5>
                            <p class="card-text"><?php echo htmlspecialchars($lesson['category']); ?></p>
                            <div class="lesson-stats mb-3">
                                <?php
                                try {
                                    $vocabStmt = $db->prepare("SELECT COUNT(*) as vocab_count FROM vocabulary WHERE lesson_id = ?");
                                    $vocabStmt->execute([$lesson['id']]);
                                    $vocabCount = $vocabStmt->fetch(PDO::FETCH_ASSOC)['vocab_count'];
                                } catch (PDOException $e) {
                                    $vocabCount = 0;
                                }
                                ?>
                                <div class="d-flex justify-content-between">
                                    <span class="text-muted">
                                        <i class="fas fa-list"></i> <?php echo $vocabCount; ?> คำศัพท์
                                    </span>
                                </div>
                            </div>
                            <button class="btn btn-primary w-100" onclick="checkLessonAccess(<?php echo $lesson['id']; ?>)">
                                <i class="fas fa-play-circle"></i> เข้าเรียน
                            </button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>


            <!-- สถิติการเรียน -->
            <div class="card mt-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">สถิติการเรียน</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="stat-item">
                                <i class="fas fa-clock text-primary"></i>
                                <div>
                                    <h6>เวลาเรียนทั้งหมด</h6>
                                    <span><?php echo $timeSpent; ?></span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <i class="fas fa-book-reader text-success"></i>
                                <div>
                                    <h6>บทเรียนที่เรียนจบ</h6>
                                    <span><?php echo $progress['completed_lessons']; ?> จาก <?php echo $totalLessons; ?> บทเรียน</span>
                                    <div class="progress mt-2" style="height: 5px;">
                                        <div class="progress-bar bg-success" role="progressbar" 
                                             style="width: <?php echo $completionPercentage; ?>%" 
                                             aria-valuenow="<?php echo $completionPercentage; ?>" 
                                             aria-valuemin="0" 
                                             aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <i class="fas fa-tasks text-info"></i>
                                <div>
                                    <h6>คำศัพท์ทั้งหมด</h6>
                                    <span><?php echo $totalVocab; ?> คำ</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="stat-item">
                                <i class="fas fa-chart-line text-warning"></i>
                                <div>
                                    <h6>ความคืบหน้า</h6>
                                    <span><?php echo $completionPercentage; ?>%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>

<style>
.stat-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    transition: transform 0.2s;
}

.stat-item:hover {
    transform: translateY(-2px);
}

.stat-item i {
    font-size: 24px;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 50%;
}

.stat-item h6 {
    margin-bottom: 5px;
    color: #6c757d;
    font-size: 0.9rem;
}

.stat-item span {
    font-weight: 600;
    color: #2c3e50;
}

.progress {
    background-color: #e9ecef;
    border-radius: 10px;
}
</style>