<?php
$userId = $_SESSION['user_data']['id'];

// ดึงข้อมูลสถิติทั่วไป
$statsQuery = $db->prepare("
    SELECT 
        COALESCE(AVG(er.score), 0) as avg_grade,
        COUNT(DISTINCT lp.lesson_id) as total_lessons_accessed,
        SUM(lp.time_spent) as total_time_spent,
        (SELECT COUNT(*) FROM lessons) as total_available_lessons,
        COUNT(DISTINCT CASE WHEN lp.completed = 1 THEN lp.lesson_id END) as completed_lessons
    FROM learning_progress lp
    LEFT JOIN exams e ON lp.lesson_id = e.lesson_id
    LEFT JOIN exam_results er ON e.id = er.exam_id AND er.user_id = ?
    WHERE lp.user_id = ?
");
$statsQuery->execute([$userId, $userId]);
$stats = $statsQuery->fetch();

// ดึงข้อมูลความก้าวหน้าแต่ละบทเรียน - แก้ไข GROUP BY
$progressQuery = $db->prepare("
    SELECT 
        l.id,
        l.title,
        l.category,
        MAX(lp.current_vocab_index) as current_vocab_index,
        MAX(lp.completed) as completed,
        MAX(lp.pretest_done) as pretest_done,
        MAX(lp.posttest_done) as posttest_done,
        (SELECT COUNT(*) FROM vocabulary WHERE lesson_id = l.id) as total_vocab,
        MAX(er.score) as best_score,
        SUM(lp.time_spent) as time_spent
    FROM lessons l
    LEFT JOIN learning_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
    LEFT JOIN exams e ON l.id = e.lesson_id AND e.exam_type = 'posttest'
    LEFT JOIN exam_results er ON e.id = er.exam_id AND er.user_id = ?
    GROUP BY l.id, l.title, l.category
    ORDER BY l.category, l.id
");
$progressQuery->execute([$userId, $userId]);
$lessons = $progressQuery->fetchAll();

// จัดกลุ่มบทเรียนตามหมวดหมู่
$categorizedLessons = [];
foreach ($lessons as $lesson) {
    $categorizedLessons[$lesson['category']][] = $lesson;
}

// คำนวณเวลาเรียนรวม
$totalMinutes = $stats['total_time_spent'] ?? 0;
$hours = floor($totalMinutes / 60);
$minutes = $totalMinutes % 60;
$timeSpent = $hours > 0 ? "{$hours} ชั่วโมง {$minutes} นาที" : "{$minutes} นาที";
?>

<div class="page" id="dashboardPage">
    <div class="row">
        <!-- Quick Stats -->
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon bg-primary">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="stat-details">
                    <h3><?php echo number_format($stats['avg_grade'], 2); ?></h3>
                    <span>คะแนนเฉลี่ย</span>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon bg-success">
                    <i class="fas fa-book-reader"></i>
                </div>
                <div class="stat-details">
                    <h3><?php echo $stats['completed_lessons']; ?>/<?php echo $stats['total_available_lessons']; ?></h3>
                    <span>บทเรียนที่เรียนจบ</span>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon bg-info">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-details">
                    <h3><?php echo $timeSpent; ?></h3>
                    <span>เวลาเรียนทั้งหมด</span>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="stat-card">
                <div class="stat-icon bg-warning">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-details">
                    <h3><?php echo number_format(($stats['completed_lessons'] / $stats['total_available_lessons']) * 100, 0); ?>%</h3>
                    <span>ความก้าวหน้ารวม</span>
                </div>
            </div>
        </div>

        <!-- Course Progress Section -->
        <div class="col-12 mt-4">
            <?php foreach ($categorizedLessons as $category => $categoryLessons): ?>
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5>
                        <i class="fas fa-book-reader me-2"></i>
                        <?php echo ucfirst($category); ?> - บทเรียนทั้งหมด
                    </h5>
                </div>
                <div class="card-body">
                    <div class="course-progress">
                        <?php foreach ($categoryLessons as $lesson): 
                            $progress = $lesson['current_vocab_index'] / max($lesson['total_vocab'], 1) * 100;
                            $statusClass = $lesson['completed'] ? 'bg-success' : ($progress >= 50 ? 'bg-primary' : 'bg-warning');
                        ?>
                        <div class="progress-item">
                            <div class="progress-header">
                                <div class="subject-info">
                                    <div>
                                        <h6 class="mb-0"><?php echo htmlspecialchars($lesson['title']); ?></h6>
                                        <small class="text-muted">
                                            คำศัพท์: <?php echo $lesson['total_vocab']; ?> คำ | 
                                            เวลาเรียน: <?php echo floor($lesson['time_spent']/60); ?> นาที
                                        </small>
                                    </div>
                                </div>
                                <div class="progress-stats">
                                    <span class="progress-percentage"><?php echo number_format($progress, 0); ?>%</span>
                                    <span class="progress-fraction"><?php echo $lesson['current_vocab_index']; ?>/<?php echo $lesson['total_vocab']; ?> คำ</span>
                                </div>
                            </div>
                            <div class="progress progress-lg">
                                <div class="progress-bar <?php echo $statusClass; ?>"
                                     role="progressbar" 
                                     style="width: <?php echo $progress; ?>%" 
                                     aria-valuenow="<?php echo $progress; ?>" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                </div>
                            </div>
                            <div class="progress-footer">
                                <div>
                                    <span class="badge <?php echo $lesson['pretest_done'] ? 'bg-success' : 'bg-secondary'; ?>">
                                        แบบทดสอบก่อนเรียน
                                    </span>
                                    <span class="badge <?php echo $lesson['posttest_done'] ? 'bg-success' : 'bg-secondary'; ?>">
                                        แบบทดสอบหลังเรียน
                                    </span>
                                </div>
                                <?php if ($lesson['best_score'] > 0): ?>
                                    <span class="text-success">คะแนนสูงสุด: <?php echo $lesson['best_score']; ?>%</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>