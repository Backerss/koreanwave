let isLoading = false;
let coursesList = [];

$(document).ready(function() {
    // ป้องกันการ bind event ซ้ำ
    $(document).off('click', '#saveCourseBtn').on('click', '#saveCourseBtn', function() {
        if (isLoading) return;
        isLoading = true;

        const formData = new FormData($('#addCourseForm')[0]);
        
        $.ajax({
            url: '../../system/manageCourses.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                isLoading = false;
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
                isLoading = false;
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
});

// ป้องกันการโหลดข้อมูลซ้ำ
function loadCourses() {
    if (isLoading) return;
    isLoading = true;

    $.get('../../system/manageCourses.php', { action: 'get' }, function(response) {
        isLoading = false;
        if (response.success) {
            // เช็คว่าข้อมูลเปลี่ยนแปลงหรือไม่
            if (JSON.stringify(coursesList) !== JSON.stringify(response.courses)) {
                coursesList = response.courses;
                const courseListElement = $('#coursesList');
                courseListElement.empty();
                
                $.each(response.courses, function(index, course) {
                    courseListElement.append(createCourseCard(course));
                });
            }
        }
    }).fail(function() {
        isLoading = false;
        Swal.fire('ผิดพลาด', 'ไม่สามารถโหลดรายการบทเรียนได้', 'error');
    });
}

function createCourseCard(course) {
    return $(`
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${course.title}</h5>
                    <p class="card-text">
                        <span class="badge bg-info">${getCategoryName(course.category)}</span>
                    </p>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-sm btn-outline-success me-2" 
                                onclick="showVocabulary(${course.id})" 
                                data-lesson-title="${course.title}">
                            <i class="fas fa-book"></i> คำศัพท์
                        </button>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editCourse(${course.id})">
                            <i class="fas fa-edit"></i> แก้ไข
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse(${course.id})">
                            <i class="fas fa-trash"></i> ลบ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `);
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

if (typeof currentLessonId === 'undefined') {
    let currentLessonId = null;
}
if (typeof currentLessonTitle === 'undefined') {
    let currentLessonTitle = null;
}

function showVocabulary(lessonId) {
    currentLessonId = lessonId;
    const lessonTitle = $(`button[onclick="showVocabulary(${lessonId})"]`).data('lesson-title');
    currentLessonTitle = lessonTitle;
    
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

$('#addVocabBtn').click(function() {
    const form = $('#vocabularyForm')[0];
    form.reset();
    $('[name="lesson_id"]').val(currentLessonId);
    $('#vocabularyFormModal').modal('show');
});

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
                loadVocabulary(currentLessonId);
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
                    loadVocabulary(currentLessonId);
                    Swal.fire('สำเร็จ', 'ลบคำศัพท์เรียบร้อยแล้ว', 'success');
                }
            });
        }
    });
}