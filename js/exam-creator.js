$(document).ready(function() {
  // โหลดรายการบทเรียนและข้อสอบเมื่อเปิดหน้า
  loadLessons();
  loadExamList();

  // Event handlers
  $('#examType, #lessonSelect').on('change', validateExamForm);
  $('#addQuestion').on('click', addNewQuestion);
  $('#saveExam').on('click', saveExam);
  $('#examListLessonSelect').on('change', function() {
    loadExamList($(this).val());
  });

  // จัดการการลบข้อสอบ
  $(document).on('click', '.remove-question', function() {
    $(this).closest('.question-builder').remove();
    updateQuestionNumbers();
  });
});

// แก้ไขฟังก์ชัน loadLessons
function loadLessons() {
  $.get('../../system/manageCourses.php', { action: 'get' }, function (response) {
    if (response.success) {
      const lessonSelect = $('#lessonSelect');
      lessonSelect.empty().append('<option value="">เลือกบทเรียน</option>');

      // ดึงรายการข้อสอบที่มีอยู่แล้ว
      $.get('../../system/manageExams.php', { action: 'getExistingExams' }, function(examResponse) {
        if (examResponse.success) {
          const existingExams = examResponse.existingExams;

          response.courses.forEach(course => {
            // ตรวจสอบว่าบทเรียนนี้มีข้อสอบประเภทที่เลือกแล้วหรือไม่
            const examType = $('#examType').val();
            const hasExam = existingExams.some(exam => 
              exam.lesson_id === course.id && 
              exam.exam_type === examType
            );

            // ถ้ายังไม่มีข้อสอบประเภทนี้ ให้แสดงในตัวเลือก
            if (!hasExam) {
              lessonSelect.append(`<option value="${course.id}">${course.title}</option>`);
            }
          });
        }
      });
    }
  });
}

// ตรวจสอบความถูกต้องของฟอร์ม
function validateExamForm() {
  const examType = $('#examType').val();
  const lessonId = $('#lessonSelect').val();
  const isValid = examType && lessonId;

  const $addQuestion = $('#addQuestion');
  const $saveExam = $('#saveExam');
  const $questionList = $('#questionList');

  $addQuestion.prop('disabled', !isValid);
  $saveExam.prop('disabled', !isValid);
  $questionList.toggle(isValid);

  return isValid;
}

// เพิ่มข้อสอบใหม่
function addNewQuestion() {
  const questionCount = $('.question-builder').length + 1;
  const template = $('#questionTemplate').html()
    .replace(/{number}/g, questionCount);

  $('#questionList').append(template);
  updateQuestionNumbers();
}

// อัพเดตเลขข้อของข้อสอบ
function updateQuestionNumbers() {
  $('.question-builder').each((index, element) => {
    $(element).find('.question-number').text(`ข้อที่ ${index + 1}`);
    $(element).find('.correct-option').attr('name', `correct_${index + 1}`);
  });
}

// บันทึกข้อสอบ
function saveExam() {
  const examData = {
    lessonId: $('#lessonSelect').val(),
    examType: $('#examType').val(),
    questions: []
  };

  // ตรวจสอบความถูกต้องของข้อมูล
  let isValid = true;
  $('.question-builder').each(function () {
    const questionText = $(this).find('.question-text').val().trim();
    const options = {};
    let hasCorrectAnswer = false;

    $(this).find('.option-input').each(function () {
      const option = $(this).data('option');
      const value = $(this).val().trim();
      options[option] = value;

      if (!value) isValid = false;
    });

    const correctAnswer = $(this).find('.correct-option:checked').val();
    if (correctAnswer) hasCorrectAnswer = true;

    if (!questionText || !hasCorrectAnswer) {
      isValid = false;
    }

    examData.questions.push({
      questionText: questionText,
      optionA: options.A,
      optionB: options.B,
      optionC: options.C,
      optionD: options.D,
      correctAnswer: correctAnswer
    });
  });

  if (!isValid || examData.questions.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'ข้อมูลไม่ครบถ้วน',
      text: 'กรุณากรอกข้อมูลให้ครบทุกช่องและเลือกคำตอบที่ถูกต้อง'
    });
    return;
  }

  // ส่งข้อมูลไปบันทึก
  $.ajax({
    url: '../../system/manageExams.php',
    method: 'POST',
    data: { action: 'create', examData: JSON.stringify(examData) },
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'บันทึกข้อสอบเรียบร้อยแล้ว'
        }).then(() => {
          // รีเซ็ตฟอร์ม
          $('#examForm').trigger('reset');
          $('#questionList').empty();
          validateExamForm();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: response.message || 'ไม่สามารถบันทึกข้อสอบได้'
        });
      }
    }
  });
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

  console.log('Viewing exam', examId);

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

      console.log(question);

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