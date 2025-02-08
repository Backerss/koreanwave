function showToast(icon, text) {
  Swal.fire({
      icon: icon,
      text: text,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
  });
}

function showLoading(text) {
  Swal.fire({
      title: text,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
          Swal.showLoading();
      }
  });
}

function hideLoading() {
  Swal.close();
}

$(document).ready(function() {
  let questionCount = 0;

  // โหลดรายการบทเรียน
  loadLessons();

  // เพิ่มข้อสอบใหม่
  $('#addQuestion').on('click', function() {
    addNewQuestion();
  });

  // ลบข้อสอบ
  $('#questionList').on('click', '.remove-question', function() {
    $(this).closest('.question-builder').remove();
    updateQuestionNumbers();
  });

  // บันทึกข้อสอบ
  $('#saveExam').on('click', function() {
    saveExam();
  });

  // Add these event listeners to $(document).ready
  $('#examListLessonSelect').change(function() {
    loadExamList($(this).val());
  });

  $('#examListBody').on('click', '.view-exam', function() {
    const examId = $(this).data('exam-id');
    viewExam(examId);
  });

  $('#examListBody').on('click', '.delete-exam', function() {
    const examId = $(this).data('exam-id');
    deleteExam(examId);
  });

  function loadLessons() {
    $.ajax({
      url: '../../system/manageCourses.php',
      method: 'GET',
      data: { action: 'get' },
      success: function(response) {
        if (response.success) {
          const $select = $('#lessonSelect');
          // Clear existing options
          $select.empty();
          
          // Add default option
          $select.append(
            $('<option>')
              .val('')
              .text('-- เลือกบทเรียน --')
          );

          // Add lesson options
          response.courses.forEach(lesson => {
            $select.append(
              $('<option>')
                .val(lesson.id)
                .text(`บทที่ ${lesson.id}: ${lesson.title}`)
            );
          });
        } else {
          showToast('error', 'เกิดข้อผิดพลาดในการโหลดรายการบทเรียน');
        }
      },
      error: function(xhr, status, error) {
        showToast('error', 'ไม่สามารถโหลดรายการบทเรียนได้');
        console.error('Error loading lessons:', error);
      }
    });
  }

  function addNewQuestion() {
    questionCount++;
    const template = $('#questionTemplate').html();
    const newQuestion = template.replace(/{number}/g, questionCount);
    $('#questionList').append(newQuestion);
    updateQuestionNumbers();
  }

  function updateQuestionNumbers() {
    $('.question-number').each(function(index) {
      $(this).text(`ข้อที่ ${index + 1}`);
    });
    questionCount = $('.question-builder').length;
  }

  function saveExam() {
    const examType = $('#examType').val();
    const lessonId = $('#lessonSelect').val();

    if (!examType || !lessonId) {
      showToast('error', 'กรุณาเลือกประเภทข้อสอบและบทเรียน');
      return;
    }

    const questions = [];
    let isValid = true;

    $('.question-builder').each(function() {
      const $question = $(this);
      const questionText = $question.find('.question-text').val();
      const correctAnswer = $question.find('.correct-option:checked').val();
      const options = {};

      $question.find('.option-input').each(function() {
        const option = $(this).data('option');
        options[option] = $(this).val();
      });

      if (!questionText || !correctAnswer || Object.values(options).some(v => !v)) {
        isValid = false;
        return false;
      }

      questions.push({
        question_text: questionText,
        options: options,
        correct_answer: correctAnswer
      });
    });

    if (!isValid) {
      showToast('error', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    const examData = {
      exam_type: examType,
      lesson_id: lessonId,
      questions: questions
    };

    $.ajax({
      url: '/api/exam-questions',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(examData),
      success: function() {
        showToast('success', 'บันทึกข้อสอบเรียบร้อยแล้ว');
        resetForm();
      },
      error: function() {
        showToast('error', 'ไม่สามารถบันทึกข้อสอบได้');
      }
    });
  }

  function resetForm() {
    $('#examType').val('');
    $('#lessonSelect').val('');
    $('#questionList').empty();
    questionCount = 0;
  }

  // เพิ่มข้อสอบแรกอัตโนมัติ
  addNewQuestion();

  // Call loadExamList when page loads
  loadExamList();
});

// Add these functions after the existing code

function loadExamList(lessonId = '') {
  showLoading('กำลังโหลดรายการข้อสอบ...');
  
  $.ajax({
    url: '../../system/manageExams.php',
    method: 'GET',
    data: { 
      action: 'list',
      lesson_id: lessonId 
    },
    success: function(response) {
      hideLoading();
      if (response.success) {
        renderExamList(response.exams);
      } else {
        showToast('error', 'เกิดข้อผิดพลาดในการโหลดรายการข้อสอบ');
      }
    },
    error: function() {
      hideLoading();
      showToast('error', 'ไม่สามารถโหลดรายการข้อสอบได้');
    }
  });
}

function renderExamList(exams) {
  const $tbody = $('#examListBody');
  $tbody.empty();

  exams.forEach(exam => {
    const row = `
      <tr>
        <td>บทที่ ${exam.lesson_id}: ${exam.lesson_title}</td>
        <td>${exam.exam_type === 'pretest' ? 'แบบทดสอบก่อนเรียน' : 'แบบทดสอบหลังเรียน'}</td>
        <td>${exam.question_count} ข้อ</td>
        <td>${new Date(exam.created_at).toLocaleDateString('th-TH')}</td>
        <td>
          <button class="btn btn-sm btn-info view-exam" data-exam-id="${exam.id}">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-exam" data-exam-id="${exam.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    $tbody.append(row);
  });
}

function viewExam(examId) {
  showLoading('กำลังโหลดข้อสอบ...');
  
  $.ajax({
    url: '../../system/manageExams.php',
    method: 'GET',
    data: { 
      action: 'view',
      exam_id: examId 
    },
    success: function(response) {
      hideLoading();
      if (response.success) {
        // แสดงข้อสอบในรูปแบบ Modal
        showExamModal(response.exam);
      } else {
        showToast('error', 'เกิดข้อผิดพลาดในการโหลดข้อสอบ');
      }
    },
    error: function() {
      hideLoading();
      showToast('error', 'ไม่สามารถโหลดข้อสอบได้');
    }
  });
}

function deleteExam(examId) {
  Swal.fire({
    title: 'ยืนยันการลบข้อสอบ',
    text: 'คุณต้องการลบข้อสอบนี้ใช่หรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: '../../system/manageExams.php',
        method: 'POST',
        data: { 
          action: 'delete',
          exam_id: examId 
        },
        success: function(response) {
          if (response.success) {
            showToast('success', 'ลบข้อสอบเรียบร้อยแล้ว');
            loadExamList($('#examListLessonSelect').val());
          } else {
            showToast('error', 'เกิดข้อผิดพลาดในการลบข้อสอบ');
          }
        },
        error: function() {
          showToast('error', 'ไม่สามารถลบข้อสอบได้');
        }
      });
    }
  });
}