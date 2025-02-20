<?php
$userId = $_SESSION['user_data']['id'];

// ดึงข้อมูลสถิติทั่วไป
$statsQuery = $db->prepare("
    SELECT 
        COALESCE(AVG(er.score), 0) as avg_grade,
        COUNT(DISTINCT lp.lesson_id) as total_lessons_accessed,
        COALESCE(SUM(lp.time_spent), 0) as total_time_spent,
        COALESCE((SELECT COUNT(*) FROM lessons), 0) as total_available_lessons,
        COUNT(DISTINCT CASE WHEN lp.completed = 1 THEN lp.lesson_id END) as completed_lessons
    FROM learning_progress lp
    LEFT JOIN exams e ON lp.lesson_id = e.lesson_id
    LEFT JOIN exam_results er ON e.id = er.exam_id AND er.user_id = ?
    WHERE lp.user_id = ?
");
$statsQuery->execute([$userId, $userId]);
$stats = $statsQuery->fetch();

// เพิ่มการตรวจสอบและกำหนดค่าเริ่มต้น
$stats['total_available_lessons'] = max($stats['total_available_lessons'], 1); // ป้องกันการหารด้วยศูนย์
$stats['completed_lessons'] = $stats['completed_lessons'] ?? 0;
$stats['avg_grade'] = $stats['avg_grade'] ?? 0;
$stats['total_time_spent'] = $stats['total_time_spent'] ?? 0;

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

<div class="page active" id="dashboardPage">
    <div class="row">
        <!-- Welcome Row -->
        <div class="col-12 mb-4">
            <div class="welcome-card">
                <div class="d-flex align-items-center">
                    <div class="welcome-avatar">
                        <img src="https://placehold.co/400" 
                             alt="Profile" class="rounded-circle">
                    </div>
                    <div class="welcome-text ms-3">
                        <h4 class="text-white mb-1">ยินดีต้อนรับ, <?php echo htmlspecialchars($_SESSION['user_data']['name']); ?>!</h4>
                        <p class="text-white-50 mb-0">มาเรียนรู้ภาษาเกาหลีกันต่อ</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stats Row -->
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
                    <h3><?php 
                    // แก้ไขการคำนวณเปอร์เซ็นต์ความก้าวหน้า
                    $progressPercentage = ($stats['total_available_lessons'] > 0) 
                        ? ($stats['completed_lessons'] / $stats['total_available_lessons']) * 100 
                        : 0;
                    echo number_format($progressPercentage, 0); 
                    ?>%</h3>
                    <span>ความก้าวหน้ารวม</span>
                </div>
            </div>
        </div>

        <!-- Category Lessons -->
        <?php foreach ($categorizedLessons as $category => $categoryLessons): ?>
        <div class="col-12 mt-4">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="fas <?php 
                            echo match($category) {
                                'vegetables' => 'fa-carrot',
                                'fruits' => 'fa-apple-alt',
                                'meats' => 'fa-drumstick-bite',
                                default => 'fa-book'
                            };
                        ?> me-2"></i>
                        <?php echo ucfirst($category); ?>
                    </h5>
                </div>
                <div class="card-body">
                    <?php foreach ($categoryLessons as $lesson): 
                        // คำนวณความก้าวหน้าใหม่
                        $progress = 0;
                        $statusClass = 'primary';
                        $statusMessage = '';

                        if ($lesson['pretest_done']) {
                            $progress = 33; // ทำแบบทดสอบก่อนเรียนแล้ว = 33%
                        }

                        if ($lesson['posttest_done']) {
                            if ($lesson['best_score'] >= 50) {
                                $progress = 100; // ทำแบบทดสอบหลังเรียนและผ่าน
                                $statusClass = 'success';
                            } else {
                                $progress = 95; // ทำแบบทดสอบแล้วแต่ไม่ผ่าน
                                $statusClass = 'warning';
                                $statusMessage = '<span class="text-warning"><i class="fas fa-exclamation-triangle"></i> ยังไม่ผ่านเกณฑ์</span>';
                            }
                        } elseif ($lesson['current_vocab_index'] > 0) {
                            // คำนวณความก้าวหน้าจากการเรียนเนื้อหา (33-95%)
                            $vocabProgress = ($lesson['current_vocab_index'] / max($lesson['total_vocab'], 1)) * 62;
                            $progress = 33 + $vocabProgress;
                        }
                    ?>
                    <div class="lesson-progress-card mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="mb-0"><?php echo htmlspecialchars($lesson['title']); ?></h6>
                            <span class="badge bg-<?php echo $statusClass; ?>">
                                <?php echo number_format($progress, 0); ?>%
                            </span>
                        </div>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar bg-<?php echo $statusClass; ?>"
                                 role="progressbar" 
                                 style="width: <?php echo $progress; ?>%"
                                 aria-valuenow="<?php echo $progress; ?>" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <div class="lesson-stats">
                                <small class="text-muted">
                                    <i class="fas fa-book me-1"></i><?php echo $lesson['total_vocab']; ?> คำ
                                    <i class="fas fa-clock ms-2 me-1"></i><?php echo floor($lesson['time_spent']/60); ?> นาที
                                    <?php if ($statusMessage): ?>
                                        <span class="ms-2"><?php echo $statusMessage; ?></span>
                                    <?php endif; ?>
                                </small>
                            </div>
                            <div class="lesson-badges">
                                <span class="badge bg-<?php echo $lesson['pretest_done'] ? 'success' : 'secondary'; ?> me-1">
                                    <i class="fas fa-check-circle me-1"></i>Pre-test
                                </span>
                                <span class="badge bg-<?php echo $lesson['posttest_done'] ? ($lesson['best_score'] >= 50 ? 'success' : 'warning') : 'secondary'; ?>">
                                    <i class="fas <?php echo $lesson['posttest_done'] ? ($lesson['best_score'] >= 50 ? 'fa-check-circle' : 'fa-exclamation-circle') : 'fa-check-circle'; ?> me-1"></i>Post-test
                                </span>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>