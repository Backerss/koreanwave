<div class="page" id="pretestPage">
    <link rel="stylesheet" href="../../css/pretest.css">
    <div class="pretest-container">
        <!-- Header Section -->
        <div class="test-header">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h3><i class="fas fa-file-alt me-2"></i>แบบทดสอบก่อนเรียน</h3>
                    <p class="text-muted">บทที่ 1: การทักทายในภาษาเกาหลี</p>
                </div>
                <div class="col-md-4">
                    <div class="test-info">
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>เวลา: 20 นาที</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-list-ol"></i>
                            <span>จำนวน: 10 ข้อ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quiz Form -->
        <form id="pretestForm">
            <!-- Question Items -->
            <div class="question-list">
                <!-- Question 1 -->
                <div class="question-item">
                    <div class="question-header">
                        <span class="question-number">ข้อ 1</span>
                        <span class="points">1 คะแนน</span>
                    </div>
                    <div class="question-content">
                        <p class="question-text">คำว่า "안녕하세요" (annyeonghaseyo) ใช้ในกรณีใด?</p>
                        <div class="options-group">
                            <div class="option-item">
                                <input type="radio" name="q1" id="q1_1" value="1">
                                <label for="q1_1">
                                    <span class="option-letter">A</span>
                                    <span class="option-text">ทักทายแบบสุภาพ</span>
                                </label>
                            </div>
                            <div class="option-item">
                                <input type="radio" name="q1" id="q1_2" value="2">
                                <label for="q1_2">
                                    <span class="option-letter">B</span>
                                    <span class="option-text">ทักทายเพื่อนสนิท</span>
                                </label>
                            </div>
                            <div class="option-item">
                                <input type="radio" name="q1" id="q1_3" value="3">
                                <label for="q1_3">
                                    <span class="option-letter">C</span>
                                    <span class="option-text">ลาก่อนตอนเย็น</span>
                                </label>
                            </div>
                            <div class="option-item">
                                <input type="radio" name="q1" id="q1_4" value="4">
                                <label for="q1_4">
                                    <span class="option-letter">D</span>
                                    <span class="option-text">ขอบคุณ</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Question 2 -->
                <div class="question-item">
                    <div class="question-header">
                        <span class="question-number">ข้อ 2</span>
                        <span class="points">1 คะแนน</span>
                    </div>
                    <div class="question-content">
                        <p class="question-text">การออกเสียง "ㅇ" ในภาษาเกาหลีออกเสียงอย่างไร?</p>
                        <div class="options-group">
                            <div class="option-item">
                                <input type="radio" name="q2" id="q2_1" value="1">
                                <label for="q2_1">
                                    <span class="option-letter">A</span>
                                    <span class="option-text">ออกเสียงเหมือน "ง" ในภาษาไทย</span>
                                </label>
                            </div>
                            <div class="option-item">
                                <input type="radio" name="q2" id="q2_2" value="2">
                                <label for="q2_2">
                                    <span class="option-letter">B</span>
                                    <span class="option-text">ไม่ออกเสียง เมื่ออยู่ต้นพยางค์</span>
                                </label>
                            </div>
                            <div class="option-item">
                                <input type="radio" name="q2" id="q2_3" value="3">
                                <label for="q2_3">
                                    <span class="option-letter">C</span>
                                    <span class="option-text">ออกเสียงเหมือน "อ" ในภาษาไทย</span>
                                </label>
                            </div>
                            <div class="option-item">
                                <input type="radio" name="q2" id="q2_4" value="4">
                                <label for="q2_4">
                                    <span class="option-letter">D</span>
                                    <span class="option-text">ออกเสียงเหมือน "น" ในภาษาไทย</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add more questions here -->

                <!-- Test Navigation -->
                <div class="test-navigation">
                    <div class="questions-progress">
                        <span>ตอบแล้ว 0/10 ข้อ</span>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary submit-test">
                        <i class="fas fa-check-circle me-2"></i>ส่งคำตอบ
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>