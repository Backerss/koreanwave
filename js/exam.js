$(document).ready(function() {
    let timeLeft = 20 * 60; // 20 minutes in seconds
    let timer;
    let examSubmitted = false;
    let answeredQuestions = new Set(); // Track answered questions

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
                    <div class="question-item" data-question-id="${question.id}">
                        <div class="question-header">
                            <span class="question-number">ข้อ ${index + 1}</span>
                            <span class="points">1 คะแนน</span>
                        </div>
                        <div class="question-content">
                            <p class="question-text">${question.question_text}</p>
                            <div class="options-group">
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_a" value="A" class="exam-option" data-question-id="${question.id}">
                                    <label for="q${question.id}_a">
                                        <span class="option-letter">A</span>
                                        <span class="option-text">${question.option_a}</span>
                                    </label>
                                </div>
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_b" value="B" class="exam-option" data-question-id="${question.id}">
                                    <label for="q${question.id}_b">
                                        <span class="option-letter">B</span>
                                        <span class="option-text">${question.option_b}</span>
                                    </label>
                                </div>
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_c" value="C" class="exam-option" data-question-id="${question.id}">
                                    <label for="q${question.id}_c">
                                        <span class="option-letter">C</span>
                                        <span class="option-text">${question.option_c}</span>
                                    </label>
                                </div>
                                <div class="option-item">
                                    <input type="radio" name="q${question.id}" id="q${question.id}_d" value="D" class="exam-option" data-question-id="${question.id}">
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
                
                // Add event listener for radio buttons
                $('.exam-option').change(function() {
                    const questionId = $(this).data('question-id');
                    answeredQuestions.add(questionId);
                    updateProgress();
                });

                startTimer();
                updateProgress();
                checkSubmitButton();
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
        const answeredCount = answeredQuestions.size;
        const percentage = (answeredCount / totalQuestions) * 100;

        $('#answeredCount').text(`ตอบแล้ว ${answeredCount}/${totalQuestions} ข้อ`);
        $('.progress-bar').css('width', `${percentage}%`);
        
        checkSubmitButton();
    }

    function checkSubmitButton() {
        const totalQuestions = $('.question-item').length;
        const allAnswered = answeredQuestions.size === totalQuestions;
        $('.submit-exam').prop('disabled', !allAnswered);
    }

    function collectAnswers() {
        const answers = [];
        $('.question-item').each(function() {
            const questionId = $(this).find('input[type="radio"]').attr('name').replace('q', '');
            const selectedAnswer = $(this).find('input[type="radio"]:checked').val();
            answers.push({
                question_id: questionId,
                answer: selectedAnswer
            });
        });
        return answers;
    }

    function autoSubmitExam() {
        Swal.fire({
            title: 'หมดเวลาทำแบบทดสอบ',
            text: 'ระบบจะทำการส่งคำตอบโดยอัตโนมัติ',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            const answers = collectAnswers();
            examSubmitted = true;

            $.ajax({
                url: '../../system/manageExams.php',
                method: 'POST',
                data: {
                    action: 'submitExam',
                    exam_id: examId,
                    answers: JSON.stringify(answers),
                    time_spent: 20 * 60
                },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        window.location.href = response.redirect_url;
                    } else {
                        Swal.fire('ผิดพลาด', response.message || 'ไม่สามารถส่งคำตอบได้', 'error');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Auto submit error:', error);
                    console.error('Response:', xhr.responseText);
                    Swal.fire('ผิดพลาด', 'ไม่สามารถส่งคำตอบอัตโนมัติ กรุณาลองใหม่', 'error');
                }
            });
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
                const answers = collectAnswers();
                examSubmitted = true;

                $.ajax({
                    url: '../../system/manageExams.php',
                    method: 'POST',
                    data: {
                        action: 'submitExam',
                        exam_id: examId,
                        answers: JSON.stringify(answers),
                        time_spent: 20 * 60 - timeLeft
                    },
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            window.location.href = response.redirect_url;
                        } else {
                            Swal.fire('ผิดพลาด', response.message || 'ไม่สามารถส่งคำตอบได้', 'error');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Submit error:', error);
                        console.error('Response:', xhr.responseText);
                        Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่', 'error');
                    }
                });
            }
        });
    }

    // Event Listeners
    $('.submit-exam').click(submitExam);

    // Initialize
    loadExam();
    //checkSubmitButton();

    // Prevent page reload and navigation
    window.onbeforeunload = function(e) {
        if (!examSubmitted) {
            e.preventDefault();
            e.returnValue = 'การออกจากหน้านี้จะทำให้การทำแบบทดสอบไม่สมบูรณ์ คุณแน่ใจหรือไม่?';
            return e.returnValue;
        }
    };

    // Disable browser back button
    history.pushState(null, null, location.href);
    window.onpopstate = function(event) {
        history.go(1);
    };
});