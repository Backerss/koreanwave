<?php


try {
    $stmt = $db->query("SELECT * FROM lessons");
    $lessons = $stmt->fetchAll();
} catch (PDOException $e) {
    die("Error fetching lessons: " . $e->getMessage());
}

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
                        <img src="<?php echo htmlspecialchars($lesson['image_url'] ?? 'https://placehold.co/400x200'); ?>"
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
                            <button class="btn btn-primary w-100" onclick="startLesson(<?php echo $lesson['id']; ?>)">
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
                        <div class="col-md-4">
                            <div class="stat-item">
                                <i class="fas fa-clock text-primary"></i>
                                <div>
                                    <h6>เวลาเรียนทั้งหมด</h6>
                                    <span>2 ชั่วโมง 15 นาที</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-item"></div>
                            <i class="fas fa-book-reader text-success"></i>
                            <div>
                                <h6>จำนวนบทเรียน</h6>
                                <span>3 บทเรียน</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-item">
                            <i class="fas fa-tasks text-info"></i>
                            <div>
                                <h6>จำนวนหัวข้อรวม</h6>
                                <span>12 หัวข้อ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>