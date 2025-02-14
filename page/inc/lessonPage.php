<div class="page" id="lessonPage">
    <div class="lesson-container">
        <!-- Lesson Loading State -->
        <div id="lessonLoadingState" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">กำลังโหลด...</span>
            </div>
        </div>
        
        <!-- Lesson Content -->
        <div id="lessonContent" style="display: none;">
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
                                    <h4 class="word-kr"><!-- Korean word will be inserted here --></h4>
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
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Navigation Controls -->
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
    <!-- เพิ่มส่วนแสดงสถานะการทำแบบทดสอบ -->
    <div class="exam-status-section mt-4">
        <div class="row">
            <div class="col-md-6 mb-3">
                <div class="exam-status-card pretest">
                    <div class="exam-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="exam-info">
                        <h5>แบบทดสอบก่อนเรียน</h5>
                        <div class="exam-progress">
                            <div class="status-indicator">
                                <i class="fas fa-circle-notch fa-spin d-none"></i>
                                <span class="status-text">กำลังตรวจสอบ...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="exam-status-card posttest">
                    <div class="exam-icon">
                        <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div class="exam-info">
                        <h5>แบบทดสอบหลังเรียน</h5>
                        <div class="exam-progress">
                            <div class="status-indicator">
                                <i class="fas fa-circle-notch fa-spin d-none"></i>
                                <span class="status-text">กำลังตรวจสอบ...</span>
                            </div>
                        </div>
                        <!-- เพิ่มส่วนปุ่มทำข้อสอบ -->
                        <div class="exam-action mt-2" style="display: none;">
                            <button class="btn btn-sm btn-primary take-exam-btn">
                                <i class="fas fa-pencil-alt"></i> ทำแบบทดสอบ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>