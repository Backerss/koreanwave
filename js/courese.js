// Define global variables in window object if not exists
window.isLoading = window.isLoading || false;
window.coursesList = window.coursesList || [];
window.currentLessonId = window.currentLessonId || null;
window.currentLessonTitle = window.currentLessonTitle || null;

// Constants and Globals
const CONFIG = {
    RELOAD_INTERVAL: 30000,
    API_PATHS: {
        COURSES: '../../system/manageCourses.php',
        VOCABULARY: '../../system/manageVocabulary.php'
    },
    CATEGORIES: {
        vegetables: 'ผัก',
        fruits: 'ผลไม้',
        meats: 'เนื้อสัตว์'
    }
};

// Error Handler
const ErrorHandler = {
    log: (context, error) => {
        console.error(`[${new Date().toISOString()}] ${context}:`, error);
    },
    show: (title, message = 'เกิดข้อผิดพลาดในการดำเนินการ') => {
        Swal.fire({
            icon: 'error',
            title: title,
            text: message
        });
    }
};

// API Service
const ApiService = {
    handleResponse: async (response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Operation failed');
        }
        return data;
    },

    post: async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: data
            });
            return await ApiService.handleResponse(response);
        } catch (error) {
            ErrorHandler.log('API Post Error', error);
            throw error;
        }
    },

    get: async (url, params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${url}?${queryString}`);
            return await ApiService.handleResponse(response);
        } catch (error) {
            ErrorHandler.log('API Get Error', error);
            throw error;
        }
    }
};

// UI Manager
const UIManager = {
    toggleLoading: (show) => {
        $('#loadingIndicator').toggleClass('d-none', !show);
        window.isLoading = show;
    },

    showSuccess: (message) => {
        Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: message
        });
    },

    resetForm: (formId) => {
        const form = $(formId)[0];
        form.reset();
        $('#currentImage, #currentAudio').empty();
    }
};

// Course Manager
const CourseManager = {
    async loadCourses() {
        if (window.isLoading) return;
        
        try {
            UIManager.toggleLoading(true);
            const response = await ApiService.get(CONFIG.API_PATHS.COURSES, { action: 'get' });
            
            const courseListElement = $('#coursesList');
            courseListElement.empty();

            if (!response.courses.length) {
                courseListElement.html(`
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                        <p class="text-muted">ยังไม่มีบทเรียน กรุณาเพิ่มบทเรียนใหม่</p>
                    </div>
                `);
                return;
            }

            response.courses.forEach(course => {
                courseListElement.append(this.createCourseCard(course));
            });

        } catch (error) {
            ErrorHandler.show('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการบทเรียนได้');
            ErrorHandler.log('Load Courses Error', error);
        } finally {
            UIManager.toggleLoading(false);
        }
    },

    createCourseCard(course) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card course-card">
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <span class="category-badge mb-3">
                            ${CONFIG.CATEGORIES[course.category] || course.category}
                        </span>
                        <div class="d-flex justify-content-end mt-3 action-buttons">
                            <button class="btn btn-outline-success action-btn me-2" 
                                    onclick="VocabularyManager.show(${course.id}, '${course.title}')">
                                <i class="fas fa-book"></i> คำศัพท์
                            </button>
                            <button class="btn btn-outline-primary action-btn me-2" 
                                    onclick="CourseManager.edit(${course.id})">
                                <i class="fas fa-edit"></i> แก้ไข
                            </button>
                            <button class="btn btn-outline-danger action-btn" 
                                    onclick="CourseManager.delete(${course.id})">
                                <i class="fas fa-trash"></i> ลบ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Initialize Application
$(document).ready(() => {
    // Initialize event handlers
    initializeEventHandlers();
    
    // Load initial data
    CourseManager.loadCourses();
    
});

// Event handler initialization
function initializeEventHandlers() {
    // Course form handlers
    $('#saveCourseBtn').on('click', async (e) => {
        e.preventDefault();
        if (window.isLoading) return;

        try {
            UIManager.toggleLoading(true);
            const formData = new FormData($('#addCourseForm')[0]);
            await ApiService.post(CONFIG.API_PATHS.COURSES, formData);
            
            $('#addCourseModal').modal('hide');
            UIManager.resetForm('#addCourseForm');
            await CourseManager.loadCourses();
            UIManager.showSuccess('เพิ่มบทเรียนเรียบร้อยแล้ว');
        } catch (error) {
            ErrorHandler.show('เพิ่มบทเรียนไม่สำเร็จ', error.message);
        } finally {
            UIManager.toggleLoading(false);
        }
    });

    // Add other event handlers...
}

// เริ่มต้นโหลดข้อมูล
loadCourses();

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