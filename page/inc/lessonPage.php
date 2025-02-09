<div class="page" id="lessonPage">
    <div class="lesson-container">
        <div class="row">
            <!-- Lesson Header -->
            <div class="col-12 mb-4">
                <div class="lesson-header-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <h3 class="mb-0"><!-- Lesson title will be inserted here --></h3>
                        <div class="progress-wrapper">
                            <span class="progress-text">ความคืบหน้า: 0%</span>
                            <div class="progress">
                                <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Lesson Content -->
            <div class="col-12">
                <div class="lesson-content-card">
                    <div class="row g-0">
                        <!-- Left Side - Image Content -->
                        <div class="col-md-5">
                            <div class="lesson-image-section">
                                <img src="" alt="รูปภาพบทเรียน" class="lesson-main-image">
                                <!-- Image navigation controls -->
                            </div>
                        </div>

                        <!-- Right Side - Text Content -->
                        <div class="col-md-7">
                            <div class="lesson-text-section">
                                <div class="lesson-text-content">
                                    <h4><!-- Korean word will be inserted here --></h4>
                                    <p class="lesson-description">
                                        <!-- Word description will be inserted here -->
                                    </p>

                                    <div class="pronunciation-guide mt-4">
                                        <h5>การออกเสียง</h5>
                                        <div class="pronunciation-item">
                                            <span class="korean"></span>
                                            <span class="romanized"></span>
                                            <button class="btn btn-sm btn-play" title="เล่นเสียง">
                                                <i class="fas fa-play"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div class="example-section mt-4">
                                        <h5>ตัวอย่างประโยค</h5>
                                        <ul class="example-list">
                                            <!-- Examples will be inserted here -->
                                        </ul>
                                    </div>

                                    <!-- Add this inside the lesson-image-section div -->
                                    <div class="lesson-navigation mt-3">
                                        <button class="btn btn-primary btn-prev" disabled>
                                            <i class="fas fa-chevron-left"></i> ย้อนกลับ
                                        </button>
                                        <span class="vocab-counter mx-3">1/1</span>
                                        <button class="btn btn-primary btn-next" disabled>
                                            ถัดไป <i class="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- เพิ่มเงื่อนไขตรวจสอบบทบาท -->
            <?php if (isset($_SESSION['user_data'])): ?>
            <script>
            const userRole = "<?php echo $_SESSION['user_data']['role']; ?>";
            </script>
            <?php endif; ?>

            <!-- แก้ไขส่วนแสดงบทเรียน -->
            <?php 
            $lessons = []; // Initialize empty array
            
            foreach ($lessons as $lesson): ?>
            <!-- เพิ่มส่วนแสดงสถานะแบบทดสอบในการ์ดบทเรียน -->
            <div class="col-md-4 mb-4">
                <div class="card lesson-card" data-lesson-id="<?php echo $lesson['id']; ?>">
                    <img src="<?php echo htmlspecialchars($lesson['image_url'] ?? 'https://placehold.co/400x200'); ?>"
                        class="card-img-top" alt="<?php echo htmlspecialchars($lesson['title']); ?>">
                    <div class="card-body">
                        <h5 class="card-title"><?php echo htmlspecialchars($lesson['title']); ?></h5>
                        <p class="card-text"><?php echo htmlspecialchars($lesson['category']); ?></p>
                        <div class="lesson-stats mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="text-muted vocab-count">
                                    <i class="fas fa-list"></i> <?php echo $vocabCount; ?> คำศัพท์
                                </span>
                                <span class="exam-status">
                                    <!-- สถานะแบบทดสอบจะถูกเติมด้วย JavaScript -->
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
        </div>
    </div>
</div>