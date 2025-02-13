// Global variables
// Global variables
window.questionTemplateCache = window.questionTemplateCache || '';
window.examId = window.examId || null;
window.questionCounter = window.questionCounter || 0;

// Initialize when document ready
$(document).ready(function() {
    // เก็บ template HTML ไว้ใช้งานครั้งเดียวตอน initialize
    questionTemplateCache = $('#questionTemplate').html();
    if (!questionTemplateCache) {
        console.error('ไม่พบ template สำหรับสร้างข้อสอบ');
        return;
    }
    
    initializeExamCreator();
    bindEventHandlers();
});

// ฟังก์ชัน Initialize
function initializeExamCreator() {
    loadLessons();
    loadExamList();
    validateExamForm();
    questionCounter = 0;
    $('#addQuestion, #saveExam').prop('disabled', true);
}

// Event handlers
function bindEventHandlers() {
    // Form controls
    $('#examType, #lessonSelect').off('change').on('change', function() {
        if ($(this).attr('id') === 'examType') {
            loadLessons();
        }
        validateExamForm();
    });

    // Add question button
    $('#addQuestion').off('click').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        addNewQuestion();
    });

    // Save exam button  
    $('#saveExam').off('click').on('click', function(e) {
        e.preventDefault();
        saveExam();
    });

    // Remove question handler
    $(document).off('click', '.remove-question').on('click', '.remove-question', function(e) {
        e.preventDefault();
        $(this).closest('.question-builder').remove();
        updateQuestionNumbers();
        updateSaveButtonState();
        updateQuestionCount();
    });

    // Form change handlers
    $(document).off('input change', '.question-text, .option-input, .correct-option')
        .on('input change', '.question-text, .option-input, .correct-option', function() {
            updateSaveButtonState();
        });

    // Validation handlers
    $(document).off('input', '.question-text, .option-input')
        .on('input', '.question-text, .option-input', function() {
            $(this).removeClass('is-invalid');
        });

    $(document).off('change', '.correct-option')
        .on('change', '.correct-option', function() {
            $(this).closest('.question-builder').find('.correct-answer').removeClass('is-invalid');
        });

    // Exam list filter
    $('#examListLessonSelect').off('change').on('change', function() {
        loadExamList($(this).val());
    });
}

// เพิ่ม error handling
$(document).ajaxError(function(event, jqXHR, settings, error) {
    showError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error);
});

async function loadLessons() {
    try {
        const response = await $.get('../../system/manageCourses.php', { action: 'get' });
        if (!response.success) throw new Error(response.message);

        const examType = $('#examType').val();
        if (!examType) return; // ถ้ายังไม่ได้เลือกประเภทข้อสอบให้ return ออก

        const existingExams = await $.get('../../system/manageExams.php', { 
            action: 'getExistingExams' 
        });

        const lessonSelect = $('#lessonSelect');
        const currentValue = lessonSelect.val(); // เก็บค่าปัจจุบันไว้
        
        lessonSelect.empty().append('<option value="">เลือกบทเรียน</option>');

        response.courses.forEach(course => {
            const hasExam = existingExams.existingExams.some(exam => 
                exam.lesson_id === course.id && 
                exam.exam_type === examType
            );
            
            if (!hasExam) {
                lessonSelect.append(`
                    <option value="${course.id}">${course.title}</option>
                `);
            }
        });

        // ถ้ามีค่าเดิมและยังเลือกได้อยู่ ให้เลือกค่าเดิม
        if (currentValue && lessonSelect.find(`option[value="${currentValue}"]`).length) {
            lessonSelect.val(currentValue);
        }

    } catch (error) {
        showError('ไม่สามารถโหลดรายการบทเรียนได้');
        console.error(error);
    }
}

function validateExamForm() {
    const examType = $('#examType').val();
    const lessonId = $('#lessonSelect').val();
    const $addQuestionBtn = $('#addQuestion');
    const $questionList = $('#questionList');
    const $saveExamBtn = $('#saveExam');

    // ตรวจสอบค่าที่จำเป็น
    const isValid = Boolean(examType && lessonId);

    // จัดการปุ่มและการแสดงผล
    $addQuestionBtn.prop('disabled', !isValid);

    // ตรวจสอบและจัดการ questionList
    if (!isValid) {
        $questionList.hide().html(`
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                กรุณาเลือกประเภทข้อสอบและบทเรียนก่อนสร้างข้อสอบ
            </div>
        `);
        $saveExamBtn.prop('disabled', true);
    } else {
        // ถ้าข้อมูลถูกต้อง แต่ยังไม่มีข้อสอบ
        if ($('.question-builder').length === 0) {
            $questionList.show().html(`
                <div class="alert alert-info">
                    <i class="fas fa-plus-circle me-2"></i>
                    คลิกปุ่ม "เพิ่มข้อสอบ" เพื่อเริ่มสร้างข้อสอบ
                </div>
            `);
        }
        $questionList.show();
    }

    // อัพเดทจำนวนข้อสอบ
    updateQuestionCount();

    return isValid;
}

// แก้ไขฟังก์ชัน addNewQuestion
function addNewQuestion() {
    if (!validateExamForm()) {
        showError('กรุณาเลือกประเภทข้อสอบและบทเรียนก่อน');
        return;
    }

    const currentQuestionCount = $('.question-builder').length;
    const nextQuestionNumber = currentQuestionCount + 1;
    
    const newQuestionHtml = questionTemplateCache.replace(/{number}/g, nextQuestionNumber);
    const $newQuestion = $(newQuestionHtml);
    
    $('#questionList').append($newQuestion);
    
    // อัพเดทหมายเลขข้อและ state ต่างๆ
    updateQuestionNumbers();
    updateSaveButtonState();
    updateQuestionCount(); // เพิ่มการอัพเดทจำนวนข้อ

    // Focus on new question
    $newQuestion.find('.question-text').focus();
}

// แก้ไขฟังก์ชัน validateQuestion
function validateQuestion($question) {
    const isValid = checkQuestionValidity($question);
    $question.toggleClass('is-invalid', !isValid);
    return isValid;
}

// แก้ไขฟังก์ชัน checkQuestionValidity
function checkQuestionValidity($question) {
    try {
        const questionText = $question.find('.question-text').val()?.trim() || '';
        const options = $question.find('.option-input').map(function() {
            return $(this).val()?.trim() || '';
        }).get();
        const hasCorrectAnswer = $question.find('.correct-option:checked').length > 0;

        // แสดง validation feedback
        $question.find('.question-text').toggleClass('is-invalid', !questionText);
        $question.find('.option-input').each(function(idx) {
            $(this).toggleClass('is-invalid', !options[idx]);
        });
        $question.find('.correct-answer').toggleClass('is-invalid', !hasCorrectAnswer);

        return questionText && 
               options.every(opt => opt.length > 0) && 
               hasCorrectAnswer;
    } catch (error) {
        console.error('Error in checkQuestionValidity:', error);
        return false;
    }
}

// แก้ไขฟังก์ชัน updateSaveButtonState
function updateSaveButtonState() {
    const $questions = $('.question-builder');
    const hasQuestions = $questions.length > 0;
    
    // ตรวจสอบความถูกต้องของทุกข้อโดยตรง ไม่ผ่าน validateQuestion
    const allQuestionsValid = $questions.toArray().every(question => {
        const $q = $(question);
        const questionText = $q.find('.question-text').val()?.trim() || '';
        const options = $q.find('.option-input').map(function() {
            return $(this).val()?.trim() || '';
        }).get();
        const hasCorrectAnswer = $q.find('.correct-option:checked').length > 0;

        return questionText && 
               options.every(opt => opt.length > 0) && 
               hasCorrectAnswer;
    });
    
    $('#saveExam').prop('disabled', !allQuestionsValid || !hasQuestions);
}

async function saveExam() {
    try {
        const examData = collectExamData();
        
        // ตรวจสอบจำนวนข้อขั้นต่ำ
        if (examData.questions.length === 0) {
            throw new Error('กรุณาเพิ่มข้อสอบอย่างน้อย 1 ข้อ');
        }

        // ตรวจสอบความถูกต้องของทุกข้อ
        const invalidQuestions = examData.questions.filter(q => !validateQuestionData(q));
        if (invalidQuestions.length > 0) {
            throw new Error('กรุณากรอกข้อมูลให้ครบทุกข้อ');
        }

        showLoading('กำลังบันทึกข้อสอบ...');

        const response = await $.ajax({
            url: '../../system/manageExams.php',
            method: 'POST',
            data: { 
                action: 'create', 
                examData: JSON.stringify(examData) 
            }
        });

        if (response.success) {
            await Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                text: 'บันทึกข้อสอบเรียบร้อยแล้ว'
            });
            
            resetForm();
            loadExamList();
        } else {
            throw new Error(response.message);
        }

    } catch (error) {
        showError(error.message || 'ไม่สามารถบันทึกข้อสอบได้');
    }
}

function collectExamData() {
    return {
        lessonId: $('#lessonSelect').val(),
        examType: $('#examType').val(),
        questions: $('.question-builder').map(function() {
            const $q = $(this);
            return {
                questionText: $q.find('.question-text').val().trim(),
                optionA: $q.find('[data-option="A"]').val().trim(),
                optionB: $q.find('[data-option="B"]').val().trim(),
                optionC: $q.find('[data-option="C"]').val().trim(),
                optionD: $q.find('[data-option="D"]').val().trim(),
                correctAnswer: $q.find('.correct-option:checked').val()
            };
        }).get()
    };
}

function showLoading(message) {
    Swal.fire({
        title: message,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
        confirmButtonText: 'ตกลง'
    });
}

// แก้ไขฟังก์ชัน resetForm
function resetForm() {
    // รีเซ็ตฟอร์มโดยใช้ native DOM element
    document.getElementById('examForm').reset();
    
    // เคลียร์รายการคำถามทั้งหมด
    $('#questionList').empty();
    
    // รีเซ็ตค่า select กลับเป็นค่าเริ่มต้น
    $('#examType, #lessonSelect').val('');
    
    // อัพเดทสถานะปุ่มและจำนวนข้อ
    updateQuestionCount();
    validateExamForm();
    
    // รีเซ็ตตัวนับข้อ
    window.questionCounter = 0;
    
    // ปิดการใช้งานปุ่มต่างๆ
    $('#addQuestion, #saveExam').prop('disabled', true);
}

// เพิ่มฟังก์ชันสำหรับโหลดรายการข้อสอบ
function loadExamList(lessonId = '') {
  $.get('../../system/manageExams.php', {
    action: 'list',
    lessonId: lessonId
  })
  .done(function(response) {
    if (!response.success) {
      showError(response.message);
      return;
    }

    const examListBody = $('#examListBody');
    examListBody.empty();

    response.exams.forEach(exam => {
      examListBody.append(`
        <tr>
          <td>${exam.lesson_title}</td>
          <td>${exam.exam_type === 'pretest' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'}</td>
          <td>${exam.question_count} ข้อ</td>
          <td>${new Date(exam.created_at).toLocaleDateString('th-TH')}</td>
          <td>
            <button class="btn btn-info btn-sm me-2" onclick="viewExam(${exam.id})">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteExam(${exam.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `);
    });
  })
  .fail(function(xhr, status, error) {
    showError('ไม่สามารถโหลดรายการข้อสอบได้');
    console.error(error);
  });
}

// ฟังก์ชันสำหรับดูรายละเอียดข้อสอบ
function viewExam(examId) {

  $.get('../../system/manageExams.php', {
    action: 'view',
    examId: examId
  }, function (response) {
    if (response.success) {
      // สร้าง HTML สำหรับแสดงรายละเอียดข้อสอบ
      const examDetailsHtml = `
                <div class="exam-details">
                    <div class="exam-header mb-4">
                        <h4 class="mb-2">${response.exam.lesson_title}</h4>
                        <p class="text-muted">
                            <span class="badge bg-primary">
                                ${response.exam.exam_type === 'pretest' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'}
                            </span>
                            <span class="ms-2">จำนวน ${response.questions.length} ข้อ</span>
                        </p>
                    </div>

                    <div class="exam-actions mb-4">
                        <button class="btn btn-success btn-sm" onclick="addNewQuestionToExam(${examId})">
                            <i class="fas fa-plus"></i> เพิ่มข้อสอบ
                        </button>
                    </div>

                    <div class="questions-container">
                        ${response.questions.map((question, index) => `
                            <div class="question-card mb-4" data-id="${question.id}">
                                <div class="card">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">ข้อที่ ${index + 1}</h6>
                                        <div class="question-actions">
                                            <button class="btn btn-primary btn-sm me-2" onclick="editQuestion(${question.id})">
                                                <i class="fas fa-edit"></i> แก้ไข
                                            </button>
                                            <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${question.id})">
                                                <i class="fas fa-trash"></i> ลบ
                                            </button>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="question-content">
                                            <p class="question-text fw-bold mb-3">${question.question_text}</p>
                                            <div class="options">
                                                <div class="option-item ${question.correct_answer === 'A' ? 'correct' : ''}">
                                                    <span class="option-letter">A</span>
                                                    <span class="option-text">${question.option_a}</span>
                                                </div>
                                                <div class="option-item ${question.correct_answer === 'B' ? 'correct' : ''}">
                                                    <span class="option-letter">B</span>
                                                    <span class="option-text">${question.option_b}</span>
                                                </div>
                                                <div class="option-item ${question.correct_answer === 'C' ? 'correct' : ''}">
                                                    <span class="option-letter">C</span>
                                                    <span class="option-text">${question.option_c}</span>
                                                </div>
                                                <div class="option-item ${question.correct_answer === 'D' ? 'correct' : ''}">
                                                    <span class="option-letter">D</span>
                                                    <span class="option-text">${question.option_d}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

      // เพิ่ม CSS แบบ inline สำหรับ modal
      const modalStyle = `
                <style>
                    .exam-details .option-item {
                        display: flex;
                        align-items: center;
                        padding: 10px;
                        margin: 5px 0;
                        border-radius: 4px;
                        background-color: #f8f9fa;
                        transition: background-color 0.2s;
                    }

                    .exam-details .option-item.correct {
                        background-color: #d4edda;
                        border-left: 4px solid #28a745;
                    }

                    .exam-details .option-letter {
                        width: 28px;
                        height: 28px;
                        line-height: 28px;
                        text-align: center;
                        border-radius: 50%;
                        background-color: #e9ecef;
                        margin-right: 12px;
                        font-weight: bold;
                    }

                    .exam-details .question-card {
                        transition: transform 0.2s;
                    }

                    .exam-details .question-card:hover {
                        transform: translateY(-2px);
                    }

                    .exam-details .card {
                        border: none;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 15px;
                    }

                    .exam-details .card-header {
                        background-color: #f8f9fa;
                        border-bottom: 1px solid #eee;
                    }

                    .question-actions {
                        opacity: 0.7;
                        transition: opacity 0.2s;
                    }

                    .question-card:hover .question-actions {
                        opacity: 1;
                    }

                    .swal2-modal {
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                </style>
            `;

      // แสดง SweetAlert2 modal
      Swal.fire({
        title: 'รายละเอียดข้อสอบ',
        html: modalStyle + examDetailsHtml,
        width: '800px',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
          container: 'exam-view-modal'
        }
      });
    } else {
      Swal.fire('ผิดพลาด', response.message, 'error');
    }
  });
}

// ฟังก์ชันสำหรับแก้ไขคำถาม
function editQuestion(questionId) {
  // ดึงข้อมูลคำถามจาก server
  $.get('../../system/manageExams.php', {
    action: 'getQuestion',
    questionId: questionId
  }, function (response) {
    if (response.success) {
      const question = response.question;

      const formHtml = `
        <form id="editQuestionForm">
          <div class="mb-3">
            <label class="form-label">คำถาม</label>
            <textarea class="form-control" name="questionText" required>${question.question_text}</textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">ตัวเลือก</label>
            <div class="input-group mb-2">
              <span class="input-group-text">A</span>
              <input type="text" class="form-control" name="optionA" value="${question.option_a}" required>
            </div>
            <div class="input-group mb-2">
              <span class="input-group-text">B</span>
              <input type="text" class="form-control" name="optionB" value="${question.option_b}" required>
            </div>
            <div class="input-group mb-2">
              <span class="input-group-text">C</span>
              <input type="text" class="form-control" name="optionC" value="${question.option_c}" required>
            </div>
            <div class="input-group mb-2">
              <span class="input-group-text">D</span>
              <input type="text" class="form-control" name="optionD" value="${question.option_d}" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">คำตอบที่ถูกต้อง</label>
            <div class="d-flex gap-3">
              <div class="form-check">
                <input class="form-check-input" type="radio" name="correctAnswer" value="A" ${question.correct_answer === 'A' ? 'checked' : ''} required>
                <label class="form-check-label">A</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="correctAnswer" value="B" ${question.correct_answer === 'B' ? 'checked' : ''}>
                <label class="form-check-label">B</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="correctAnswer" value="C" ${question.correct_answer === 'C' ? 'checked' : ''}>
                <label class="form-check-label">C</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="correctAnswer" value="D" ${question.correct_answer === 'D' ? 'checked' : ''}>
                <label class="form-check-label">D</label>
              </div>
            </div>
          </div>
        </form>
      `;

      Swal.fire({
        title: 'แก้ไขข้อสอบ',
        html: formHtml,
        width: '600px',
        showCancelButton: true,
        confirmButtonText: 'บันทึก',
        cancelButtonText: 'ยกเลิก',
        preConfirm: () => {
          const form = document.getElementById('editQuestionForm');
          const formData = new FormData(form);
          const questionData = {
            questionId: questionId,
            questionText: formData.get('questionText'),
            optionA: formData.get('optionA'),
            optionB: formData.get('optionB'),
            optionC: formData.get('optionC'),
            optionD: formData.get('optionD'),
            correctAnswer: formData.get('correctAnswer')
          };

          return $.ajax({
            url: '../../system/manageExams.php',
            method: 'POST',
            data: {
              action: 'updateQuestion',
              questionData: JSON.stringify(questionData)
            }
          });
        }
      }).then((result) => {
        if (result.isConfirmed) {
          if (result.value.success) {
            Swal.fire('สำเร็จ', 'แก้ไขข้อสอบเรียบร้อยแล้ว', 'success')
              .then(() => {
                viewExam(question.exam_id);
              });
          } else {
            Swal.fire('ผิดพลาด', result.value.message, 'error');
          }
        }
      });
    } else {
      Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลคำถามได้', 'error');
    }
  });
}

// ฟังก์ชันสำหรับลบข้อสอบ
function deleteExam(examId) {
  Swal.fire({
    title: 'ยืนยันการลบ',
    text: 'คุณต้องการลบข้อสอบชุดนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      $.post('../../system/manageExams.php', {
        action: 'delete',
        examId: examId
      }, function (response) {
        if (response.success) {
          Swal.fire('สำเร็จ', 'ลบข้อสอบเรียบร้อยแล้ว', 'success');
          loadExamList($('#examListLessonSelect').val());
        } else {
          Swal.fire('ผิดพลาด', response.message, 'error');
        }
      });
    }
  });
}

// เพิ่มฟังก์ชันสำหรับลบข้อคำถาม
function deleteQuestion(questionId) {
  Swal.fire({
    title: 'ยืนยันการลบ',
    text: 'คุณต้องการลบข้อสอบข้อนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      $.post('../../system/manageExams.php', {
        action: 'deleteQuestion',
        questionId: questionId
      }, function (response) {
        if (response.success) {
          Swal.fire('สำเร็จ', 'ลบข้อสอบเรียบร้อยแล้ว', 'success')
            .then(() => {
              // รีโหลดหน้าแสดงรายละเอียดข้อสอบ
              viewExam(questionId);
            });
        } else {
          Swal.fire('ผิดพลาด', response.message, 'error');
        }
      });
    }
  });
}

// เพิ่มฟังก์ชันสำหรับเพิ่มข้อสอบใหม่ในชุดข้อสอบที่มีอยู่แล้ว
function addNewQuestionToExam(examId) {
  const formHtml = `
        <form id="newQuestionForm">
            <div class="mb-3">
                <label class="form-label">คำถาม</label>
                <textarea class="form-control" name="questionText" required></textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">ตัวเลือก</label>
                <div class="option-inputs">
                    <div class="input-group mb-2">
                        <span class="input-group-text">A</span>
                        <input type="text" class="form-control" name="optionA" required>
                    </div>
                    <div class="input-group mb-2">
                        <span class="input-group-text">B</span>
                        <input type="text" class="form-control" name="optionB" required>
                    </div>
                    <div class="input-group mb-2">
                        <span class="input-group-text">C</span>
                        <input type="text" class="form-control" name="optionC" required>
                    </div>
                    <div class="input-group mb-2">
                        <span class="input-group-text">D</span>
                        <input type="text" class="form-control" name="optionD" required>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">คำตอบที่ถูกต้อง</label>
                <div class="d-flex gap-3">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="correctAnswer" value="A" required>
                        <label class="form-check-label">A</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="correctAnswer" value="B">
                        <label class="form-check-label">B</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="correctAnswer" value="C">
                        <label class="form-check-label">C</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="correctAnswer" value="D">
                        <label class="form-check-label">D</label>
                    </div>
                </div>
            </div>
        </form>
    `;

  Swal.fire({
    title: 'เพิ่มข้อสอบใหม่',
    html: formHtml,
    width: '600px',
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const form = document.getElementById('newQuestionForm');
      const formData = new FormData(form);
      const questionData = {
        examId: examId,
        questionText: formData.get('questionText'),
        optionA: formData.get('optionA'),
        optionB: formData.get('optionB'),
        optionC: formData.get('optionC'),
        optionD: formData.get('optionD'),
        correctAnswer: formData.get('correctAnswer')
      };

      return $.ajax({
        url: '../../system/manageExams.php',
        method: 'POST',
        data: {
          action: 'addQuestion',
          questionData: JSON.stringify(questionData)
        }
      });
    }
  }).then((result) => {
    if (result.isConfirmed) {
      if (result.value.success) {
        Swal.fire('สำเร็จ', 'เพิ่มข้อสอบเรียบร้อยแล้ว', 'success')
          .then(() => {
            viewExam(examId);
          });
      } else {
        Swal.fire('ผิดพลาด', result.value.message, 'error');
      }
    }
  });
}

// เพิ่มฟังก์ชันสำหรับการกรองข้อสอบตามบทเรียน
$('#examListLessonSelect').change(function() {
    loadExamList($(this).val());
});

// เพิ่มใน exam-creator.js
function showError(message) {
  Swal.fire({
    icon: 'error',
    title: 'เกิดข้อผิดพลาด',
    text: message,
    confirmButtonText: 'ตกลง'
  });
}

// เพิ่มการจัดการ error ในทุก AJAX request
$(document).ajaxError(function(event, jqXHR, settings, error) {
    showError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + error);
});

// เพิ่มใน exam-creator.js
function validateQuestionData(questionData) {
    if (!questionData.questionText.trim()) {
        showError('กรุณากรอกคำถาม');
        return false;
    }
    
    const options = [
        questionData.optionA,
        questionData.optionB,
        questionData.optionC,
        questionData.optionD
    ];
    
    if (options.some(opt => !opt.trim())) {
        showError('กรุณากรอกตัวเลือกให้ครบทุกข้อ');
        return false;
    }
    
    if (!questionData.correctAnswer) {
        showError('กรุณาเลือกคำตอบที่ถูกต้อง');
        return false;
    }
    
    return true;
}

// เพิ่ม event listener สำหรับการเปลี่ยนประเภทข้อสอบ
$('#examType').change(function() {
  loadLessons(); // โหลดรายการบทเรียนใหม่เมื่อเปลี่ยนประเภทข้อสอบ
  validateExamForm();
});

// เพิ่มฟังก์ชันอัพเดทหมายเลขข้อสอบ
function updateQuestionNumbers() {
    $('.question-builder').each(function(index) {
        const number = index + 1;
        $(this).find('.question-number').text(`ข้อที่ ${number}`);
        
        // อัพเดท name ของ radio buttons
        $(this).find('.correct-option').each(function() {
            const oldName = $(this).attr('name');
            const newName = `correct_${number}`;
            $(this).attr('name', newName);
            $(this).next('label').attr('for', $(this).attr('id').replace(/\d+/, number));
        });
    });
}

// เพิ่มฟังก์ชันสำหรับอัพเดทจำนวนข้อสอบ
function updateQuestionCount() {
    const questionCount = $('.question-builder').length;
    $('#questionCount').text(`${questionCount} ข้อ`);
}