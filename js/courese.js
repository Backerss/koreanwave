// Define global variables in window object if not exists
window.isLoading = window.isLoading || false;
window.coursesList = window.coursesList || [];
window.currentLessonId = window.currentLessonId || null;
window.currentLessonTitle = window.currentLessonTitle || null;

$(document).ready(function() {
    // ป้องกันการ bind event ซ้ำ
    $(document).off('click', '#saveCourseBtn').on('click', '#saveCourseBtn', function() {
        if (window.isLoading) return;
        window.isLoading = true;

        const formData = new FormData($('#addCourseForm')[0]);
        
        $.ajax({
            url: '../../system/manageCourses.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                window.isLoading = false;
                if (response.success) {
                    $('#addCourseModal').modal('hide');
                    $('#addCourseForm')[0].reset();
                    loadCourses();
                    Swal.fire('สำเร็จ', 'เพิ่มบทเรียนเรียบร้อยแล้ว', 'success');
                } else {
                    Swal.fire('ผิดพลาด', response.message || 'เกิดข้อผิดพลาดในการเพิ่มบทเรียน', 'error');
                }
            },
            error: function() {
                window.isLoading = false;
                Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            }
        });
    });

    // Update course
    $('#updateCourseBtn').click(function() {
        const formData = new FormData($('#editCourseForm')[0]);
        formData.append('action', 'update');
        
        $.ajax({
            url: '../../system/manageCourses.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    $('#editCourseModal').modal('hide');
                    loadCourses();
                    Swal.fire('สำเร็จ', 'อัปเดตบทเรียนเรียบร้อยแล้ว', 'success');
                }
            }
        });
    });

    // เริ่มต้นโหลดข้อมูล
    loadCourses();

    // ตั้งเวลาอัพเดทข้อมูลทุก 30 วินาที
    setInterval(loadCourses, 30000);

    // แก้ไขการ bind event ของปุ่มบันทึก
    // ลบ event handlers เดิมก่อน
    $('#saveVocabularyBtn').off('click');
    
    // bind event handler ใหม่
    $('#saveVocabularyBtn').on('click', function() {
        const formData = new FormData($('#vocabularyForm')[0]);
        formData.append('action', formData.get('id') ? 'update' : 'add');

        $.ajax({
            url: '../../system/manageVocabulary.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    $('#vocabularyFormModal').modal('hide');
                    loadVocabulary(window.currentLessonId);
                    // รีเซ็ตฟอร์ม
                    $('#vocabularyForm')[0].reset();
                    $('#currentImage').empty();
                    $('#currentAudio').empty();
                    Swal.fire('สำเร็จ', 'บันทึกข้อมูลคำศัพท์เรียบร้อยแล้ว', 'success');
                }
            },
            error: function(xhr) {
                Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
            }
        });
    });

    // ปุ่มเพิ่มคำศัพท์
    $('#addVocabBtn').off('click').on('click', function() {
        const form = $('#vocabularyForm')[0];
        form.reset();
        $('#currentImage').empty();
        $('#currentAudio').empty();
        $('[name="lesson_id"]').val(window.currentLessonId);
        $('#vocabularyFormModal').modal('show');
    });
});

// ป้องกันการโหลดข้อมูลซ้ำ
function loadCourses() {
    if (window.isLoading) return;
    
    showLoading();
    window.isLoading = true;

    $.get('../../system/manageCourses.php', { action: 'get' })
        .done(function(response) {
            if (response.success) {
                const courseListElement = $('#coursesList');
                courseListElement.empty();
                
                if (response.courses.length === 0) {
                    courseListElement.html(`
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                            <p class="text-muted">ยังไม่มีบทเรียน กรุณาเพิ่มบทเรียนใหม่</p>
                        </div>
                    `);
                } else {
                    response.courses.forEach(course => {
                        courseListElement.append(createCourseCard(course));
                    });
                }
            }
        })
        .fail(function(xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถโหลดรายการบทเรียนได้'
            });
            console.error('Load courses error:', error);
        })
        .always(function() {
            window.isLoading = false;
            hideLoading();
        });
}

// Show loading indicator
function showLoading() {
    $('#loadingIndicator').removeClass('d-none');
}

// Hide loading indicator
function hideLoading() {
    $('#loadingIndicator').addClass('d-none');
}

// Improve createCourseCard function
function createCourseCard(course) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card course-card">
                <div class="card-body">
                    <h5 class="card-title">${course.title}</h5>
                    <span class="category-badge mb-3">
                        ${getCategoryName(course.category)}
                    </span>
                    <div class="d-flex justify-content-end mt-3 action-buttons">
                        <button class="btn btn-outline-success action-btn" 
                                onclick="showVocabulary(${course.id})"
                                data-lesson-title="${course.title}">
                            <i class="fas fa-book"></i> คำศัพท์
                        </button>
                        <button class="btn btn-outline-primary action-btn" 
                                onclick="editCourse(${course.id})">
                            <i class="fas fa-edit"></i> แก้ไข
                        </button>
                        <button class="btn btn-outline-danger action-btn" 
                                onclick="deleteCourse(${course.id})">
                            <i class="fas fa-trash"></i> ลบ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCategoryName(category) {
    const categories = {
        'vegetables': 'ผัก',
        'fruits': 'ผลไม้',
        'meats': 'เนื้อสัตว์'
    };
    return categories[category] || category;
}

function editCourse(id) {
    $.get('../../system/manageCourses.php', { action: 'get', id: id }, function(response) {
        const form = $('#editCourseForm');
        form.find('[name="id"]').val(response.course.id);
        form.find('[name="title"]').val(response.course.title);
        form.find('[name="category"]').val(response.course.category);
        
        $('#editCourseModal').modal('show');
    });
}

function deleteCourse(id) {
    Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบบทเรียนนี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('system/manageCourses.php', {
                action: 'delete',
                id: id
            }, function(response) {
                if (response.success) {
                    loadCourses();
                    Swal.fire('สำเร็จ', 'ลบบทเรียนเรียบร้อยแล้ว', 'success');
                }
            });
        }
    });
}

// Add these functions after the existing code

function showVocabulary(lessonId) {
    window.currentLessonId = lessonId;
    const lessonTitle = $(`button[onclick="showVocabulary(${lessonId})"]`).data('lesson-title');
    window.currentLessonTitle = lessonTitle;
    
    // อัพเดทชื่อบทเรียนในโมดอล
    $('#vocabularyModal .modal-title').text(`จัดการคำศัพท์ - ${lessonTitle}`);
    
    loadVocabulary(lessonId);
    $('#vocabularyModal').modal('show');
}

// Modify loadVocabulary function to show images and audio
function loadVocabulary(lessonId) {
    $.get('../../system/manageVocabulary.php', { action: 'get', lesson_id: lessonId }, function(response) {
        const tbody = $('#vocabularyTable tbody');
        tbody.empty();
        
        response.vocabulary.forEach(function(vocab) {
            const imgHtml = vocab.img_url ? 
                `<img src="../../data/images/${vocab.img_url}" class="img-thumbnail" style="max-height: 50px">` : 'ไม่มีรูปภาพ';
            const audioHtml = vocab.audio_url ? 
                `<audio controls><source src="../../data/voice/${vocab.audio_url}" type="audio/mpeg"></audio>` : 'ไม่มีไฟล์เสียง';
            
            tbody.append(`
                <tr>
                    <td>${vocab.word_th}</td>
                    <td>${vocab.word_en}</td>
                    <td>${vocab.word_kr}</td>
                    <td>${vocab.deteil_word || '-'}</td>
                    <td>${vocab.example_one || '-'}</td>
                    <td>${vocab.example_two || '-'}</td>
                    <td>${imgHtml}</td>
                    <td>${audioHtml}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editVocabulary(${vocab.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteVocabulary(${vocab.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    });
}

// Modify saveVocabularyBtn click handler
$('#saveVocabularyBtn').click(function() {
    const formData = new FormData($('#vocabularyForm')[0]);
    formData.append('action', formData.get('id') ? 'update' : 'add');

    $.ajax({
        url: '../../system/manageVocabulary.php',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            if (response.success) {
                $('#vocabularyFormModal').modal('hide');
                loadVocabulary(window.currentLessonId);
                Swal.fire('สำเร็จ', 'บันทึกข้อมูลคำศัพท์เรียบร้อยแล้ว', 'success');
            }
        },
        error: function(xhr) {
            Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
        }
    });
});

// Modify editVocabulary function to show current files
function editVocabulary(id) {
    $.get('../../system/manageVocabulary.php', { action: 'get', id: id }, function(response) {
        const form = $('#vocabularyForm');
        const vocab = response.vocabulary;
        
        form.find('[name="id"]').val(vocab.id);
        form.find('[name="lesson_id"]').val(vocab.lesson_id);
        form.find('[name="word_th"]').val(vocab.word_th);
        form.find('[name="word_en"]').val(vocab.word_en);
        form.find('[name="word_kr"]').val(vocab.word_kr);
        form.find('[name="deteil_word"]').val(vocab.deteil_word);
        form.find('[name="example_one"]').val(vocab.example_one);
        form.find('[name="example_two"]').val(vocab.example_two);
        
        // Show current files
        const currentImage = $('#currentImage');
        const currentAudio = $('#currentAudio');
        
        currentImage.html(vocab.img_url ? 
            `<img src="../../data/images/${vocab.img_url}" class="img-thumbnail mt-2" style="max-height: 100px">` : '');
        currentAudio.html(vocab.audio_url ? 
            `<audio controls class="mt-2"><source src="../../data/voice/${vocab.audio_url}" type="audio/mpeg"></audio>` : '');
        
        $('#vocabularyFormModal').modal('show');
    });
}

function deleteVocabulary(id) {
    Swal.fire({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบคำศัพท์นี้ใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            $.post('../../system/manageVocabulary.php', {
                action: 'delete',
                id: id
            }, function(response) {
                if (response.success) {
                    loadVocabulary(window.currentLessonId);
                    Swal.fire('สำเร็จ', 'ลบคำศัพท์เรียบร้อยแล้ว', 'success');
                }
            });
        }
    });
}