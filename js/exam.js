$(document).ready(function() {
    const EXAM_TIME = 20 * 60; // 20 minutes in seconds
    let timeLeft = EXAM_TIME;
    let timer;
    let examSubmitted = false;
    let answeredQuestions = new Set();
    const examId = new URLSearchParams(window.location.search).get('exam_id');

    function loadExam() {
        $.get('../../system/manageExams.php', {
            action: 'loadExamQuestions',
            examId: examId
        }, function(response) {
            if (!response.success) {
                Swal.fire('ผิดพลาด', response.message, 'error');
                return;
            }

            $('#examType').text(response.exam.exam_type === 'pretest' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน');
            $('#lessonTitle').text(response.exam.lesson_title);
            $('#questionCount').text(`${response.questions.length} ข้อ`);

            renderQuestions(response.questions);
            startTimer();
            updateProgress();
        });
    }

    function renderQuestions(questions) {
        const questionsHtml = questions.map((question, index) => `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-header">
                    <span class="question-number">ข้อ ${index + 1}</span>
                    <span class="points">1 คะแนน</span>
                </div>
                <div class="question-content">
                    <p class="question-text">${question.question_text}</p>
                    <div class="options-group">
                        ${['A', 'B', 'C', 'D'].map(option => `
                            <div class="option-item">
                                <input type="radio" name="q${question.id}" 
                                    id="q${question.id}_${option.toLowerCase()}" 
                                    value="${option}" 
                                    class="exam-option" 
                                    data-question-id="${question.id}">
                                <label for="q${question.id}_${option.toLowerCase()}">
                                    <span class="option-letter">${option}</span>
                                    <span class="option-text">${question['option_' + option.toLowerCase()]}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        $('.questions-container').html(questionsHtml);
        
        $('.exam-option').change(function() {
            answeredQuestions.add($(this).data('question-id'));
            updateProgress();
        });
    }

    function submitExam() {
        // แสดง SweetAlert2 เพื่อยืนยันการส่งคำตอบ
        Swal.fire({
            title: 'ยืนยันการส่งคำตอบ',
            text: 'คุณแน่ใจหรือไม่ที่จะส่งคำตอบ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ส่งคำตอบ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                const answers = $('.question-item').map(function() {
                    return {
                        question_id: $(this).find('input[type="radio"]').attr('name').replace('q', ''),
                        answer: $(this).find('input[type="radio"]:checked').val()
                    };
                }).get();

                examSubmitted = true;

                $.ajax({
                    url: '../../system/manageExams.php',
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'submitExam',
                        exam_id: examId,
                        answers: JSON.stringify(answers),
                        time_spent: EXAM_TIME - timeLeft
                    },
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
                        Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์', 'error');
                    }
                });
            }
        });
    }

    function confirm() {
        return Swal.fire({
            title: 'ยืนยันการส่งคำตอบ',
            text: 'คุณแน่ใจหรือไม่ที่จะส่งคำตอบ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ส่งคำตอบ',
            cancelButtonText: 'ยกเลิก'
        });
    }

    function updateProgress() {
        const total = $('.question-item').length;
        const answered = answeredQuestions.size;
        const percentage = (answered / total) * 100;

        $('#answeredCount').text(`ตอบแล้ว ${answered}/${total} ข้อ`);
        $('.progress-bar').css('width', `${percentage}%`);
        $('.submit-exam').prop('disabled', answered !== total);
    }

    function startTimer() {
        updateTimerDisplay();
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitExam();
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

    // Event Listeners & Initialization
    $('.submit-exam').click(submitExam);
    loadExam();

    // Prevent accidental navigation
    window.onbeforeunload = e => {
        if (!examSubmitted) {
            e.returnValue = 'การออกจากหน้านี้จะทำให้การทำแบบทดสอบไม่สมบูรณ์';
            return e.returnValue;
        }
    };

    // Disable browser back button
    history.pushState(null, null, location.href);
    window.onpopstate = () => history.go(1);
});