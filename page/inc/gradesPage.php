<?php
// ดึงข้อมูลผู้เรียน
$userId = $_SESSION['user_data']['id'];

// ดึงข้อมูลบทเรียนทั้งหมด
$lessonsQuery = $db->prepare("
    SELECT COUNT(*) as total_lessons 
    FROM lessons
");
$lessonsQuery->execute();
$totalLessons = $lessonsQuery->fetch()['total_lessons'];

// ดึงข้อมูลความก้าวหน้าการเรียน
$progressQuery = $db->prepare("
    SELECT 
        l.id as lesson_id,
        l.title as lesson_title,
        lp.completed,
        lp.pretest_done,
        lp.posttest_done,
        COALESCE(MAX(er.score), 0) as best_score
    FROM lessons l
    LEFT JOIN learning_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
    LEFT JOIN exams e ON l.id = e.lesson_id AND e.exam_type = 'posttest'
    LEFT JOIN exam_results er ON e.id = er.exam_id AND er.user_id = ?
    GROUP BY l.id, l.title, lp.completed, lp.pretest_done, lp.posttest_done
    ORDER BY l.id ASC
");
$progressQuery->execute([$userId, $userId]);
$lessonProgress = $progressQuery->fetchAll();

// คำนวณจำนวนบทเรียนที่เรียนจบแล้ว
$completedLessons = array_filter($lessonProgress, function($lesson) {
    return $lesson['completed'] == 1;
});
$completedCount = count($completedLessons);

// คำนวณคะแนนเฉลี่ยรวม
$averageScore = array_reduce($lessonProgress, function($carry, $lesson) {
    return $carry + $lesson['best_score'];
}, 0) / count($lessonProgress);
?>

<div class="page grades-page" id="gradesPage">
    <div class="container-fluid">
        <div class="page-header mb-4">
            <h3 class="page-title">ผลการเรียน</h3>
            <p class="text-muted">ภาคเรียนที่ <?php echo date('n'); ?>/<?php echo date('Y') + 543; ?></p>
        </div>

        <!-- ตารางแสดงผลการเรียน -->
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">ผลการเรียนรายวิชา</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>รหัสวิชา</th>
                                <th>ชื่อวิชา</th>
                                <th>บทเรียนทั้งหมด</th>
                                <th>บทเรียนที่เรียนแล้ว</th>
                                <th>คะแนนเฉลี่ย</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ก30201</td>
                                <td>ภาษาเกาหลี 1</td>
                                <td><?php echo $totalLessons; ?> บท</td>
                                <td><?php echo $completedCount; ?> บท</td>
                                <td><?php echo number_format($averageScore, 2); ?>/100</td>
                                <td>
                                    <span class="badge <?php echo $completedCount == $totalLessons ? 'bg-success' : 'bg-warning'; ?>">
                                        <?php echo $completedCount == $totalLessons ? 'เรียนจบแล้ว' : 'กำลังเรียน'; ?>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- รายละเอียดบทเรียน -->
        <div class="card mt-4">
            <div class="card-header">
                <h5 class="card-title mb-0">รายละเอียดบทเรียน - ภาษาเกาหลี 1</h5>
            </div>
            <div class="card-body">
                <div class="lesson-list">
                    <?php foreach ($lessonProgress as $lesson): ?>
                        <div class="lesson-item <?php echo $lesson['completed'] ? 'completed' : ''; ?>">
                            <div class="lesson-info">
                                <h6><?php echo htmlspecialchars($lesson['lesson_title']); ?></h6>
                                <p class="text-muted mb-0">
                                    สถานะแบบทดสอบ: 
                                    <?php if ($lesson['pretest_done']): ?>
                                        <span class="text-success">ทำแบบทดสอบก่อนเรียนแล้ว</span>
                                    <?php else: ?>
                                        <span class="text-warning">ยังไม่ได้ทำแบบทดสอบก่อนเรียน</span>
                                    <?php endif; ?>
                                    | 
                                    <?php if ($lesson['posttest_done']): ?>
                                        <span class="text-success">ทำแบบทดสอบหลังเรียนแล้ว</span>
                                    <?php else: ?>
                                        <span class="text-warning">ยังไม่ได้ทำแบบทดสอบหลังเรียน</span>
                                    <?php endif; ?>
                                </p>
                            </div>
                            <div class="lesson-status">
                                <span class="badge <?php echo $lesson['completed'] ? 'bg-success' : 'bg-warning'; ?>">
                                    <?php echo $lesson['completed'] ? 'เรียนจบแล้ว' : 'ยังไม่ได้เรียน'; ?>
                                </span>
                                <?php if ($lesson['best_score'] > 0): ?>
                                    <span class="score">คะแนนสูงสุด: <?php echo number_format($lesson['best_score'], 2); ?>/100</span>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>