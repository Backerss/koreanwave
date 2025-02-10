$(document).ready(function() {
    let timeLeft = 20 * 60; // 20 minutes in seconds
    let timer;

    // Load exam data
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('exam_id');

    function loadExam() {
        $.get('../../system/manageExams.php', {
            action: 'loadExamQuestions',
            examId: examId
        }, function(response) {
            if (response.success) {
                // Update exam info
                $('#examType').text(response.exam.exam_type === 'pretest' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน');
                $('#lessonTitle').text(response.exam.lesson_title);
                $('#questionCount').text(`${response.questions.length} ข้อ`);

                // Render questions
                const questionsHtml = response.questions.map((question, index) => `
                    <div class="question-item mb-4">
                        <div class="question-header">
                            <span class="question-number">ข้อ ${index + 1}</span>
                            <span class="points">1 คะแนน</span>
                        </div>
                        <div class="question-content">
                            <p class="question-text">${question.question_text}</p>
                            <div class="options-group">
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_a" value="A">
                                    <label for="q${question.id}_a">
                                        <span class="option-letter">A</span>
                                        <span class="option-text">${question.option_a}</span>
                                    </label>
                                </div>
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_b" value="B">
                                    <label for="q${question.id}_b">
                                        <span class="option-letter">B</span>
                                        <span class="option-text">${question.option_b}</span>
                                    </label>
                                </div>
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_c" value="C">
                                    <label for="q${question.id}_c">
                                        <span class="option-letter">C</span>
                                        <span class="option-text">${question.option_c}</span>
                                    </label>
                                </div>
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_d" value="D">
                                    <label for="q${question.id}_d">
                                        <span class="option-letter">D</span>
                                        <span class="option-text">${question.option_d}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');

                $('.questions-container').html(questionsHtml);
                startTimer();
                updateProgress();
            } else {
                Swal.fire('ผิดพลาด', response.message, 'error');
            }
        });
    }

    function startTimer() {
        timer = setInterval(function() {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                autoSubmitExam();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        $('#timeRemaining').text(
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
    }

    function updateProgress() {
        const totalQuestions = $('.question-item').length;
        const answeredQuestions = $('input[type="radio"]:checked').length;
        const percentage = (answeredQuestions / totalQuestions) * 100;

        $('#answeredCount').text(`ตอบแล้ว ${answeredQuestions}/${totalQuestions} ข้อ`);
        $('.progress-bar').css('width', `${percentage}%`);
    }

    function autoSubmitExam() {
        Swal.fire({
            title: 'หมดเวลาทำแบบทดสอบ',
            text: 'ระบบจะทำการส่งคำตอบโดยอัตโนมัติ',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            $('#examForm').submit();
        });
    }

    function submitExam() {
        Swal.fire({
            title: 'ยืนยันการส่งคำตอบ',
            text: 'คุณแน่ใจหรือไม่ที่จะส่งคำตอบ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ส่งคำตอบ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                $('#examForm').submit();
            }
        });
    }

    // Event Listeners
    $('input[type="radio"]').change(updateProgress);
    $('.submit-exam').click(submitExam);

    // Initialize
    loadExam();

    // Prevent accidental leaving
    window.onbeforeunload = function() {
        return "คุณแน่ใจหรือไม่ที่จะออกจากหน้านี้? คำตอบของคุณอาจจะหายไป";
    };

    // Cleanup
    $(window).on('unload', function() {
        if (timer) {
            clearInterval(timer);
        }
    });
});