// หรือใช้ window object เพื่อเก็บตัวแปร global
window.currentVocabIndex = window.currentVocabIndex || 0;
window.vocabularyList = window.vocabularyList || [];
window.audioPlayer = window.audioPlayer || null;
// เพิ่มตัวแปรสำหรับการติดตามเวลา
window.vocabStartTime = null;
window.vocabId = null;

function startLesson(lessonId) {
    $.ajax({
        url: '../../system/checkLearn.php',
        type: 'POST',
        data: {
            action: 'check',
            lessonId: lessonId
        },
        success: function (response) {
            try {
                const result = typeof response === 'string' ? JSON.parse(response) : response;
                if (result.success) {
                    loadLessonContent(lessonId);
                    window.currentVocabIndex = result.currentVocabIndex || 0;
                } else {
                    showError('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถโหลดบทเรียนได้');
                    $('#attendancePage').show();
                }
            } catch (e) {
                console.error('Error parsing check learn response:', e);
                showError('เกิดข้อผิดพลาด', 'ไม่สามารถตรวจสอบสถานะบทเรียน');
                $('#attendancePage').show();
            }
        },
        error: function(xhr, status, error) {
            console.error('Ajax error:', error);
            handleAjaxError();
            $('#attendancePage').show();
        }
    });
}

// แก้ไขฟังก์ชัน loadLessonContent
function loadLessonContent(lessonId) {
    // แสดง loading state
    $('#lessonLoadingState').show();
    $('#lessonContent').hide();
    
    // เก็บ lesson id ปัจจุบัน
    window.currentLessonId = lessonId;
    
    // ตรวจสอบความก้าวหน้าจาก learning_progress ก่อน
    $.ajax({
        url: '../../system/checkLearn.php',
        type: 'GET',
        data: { 
            action: 'getProgress',
            lesson_id: lessonId 
        },
        success: function(progressResponse) {
            try {
                const progress = JSON.parse(progressResponse);
                
                if (progress.success) {
                    // เก็บ index ปัจจุบันจากฐานข้อมูล
                    window.currentVocabIndex = progress.currentVocabIndex || 0;
                    
                    // โหลดข้อมูลบทเรียน
                    $.ajax({
                        url: '../../system/getLesson.php',
                        type: 'GET',
                        data: { lessonId: lessonId },
                        success: function(lessonResponse) {
                            try {
                                const data = typeof lessonResponse === 'string' ? 
                                    JSON.parse(lessonResponse) : lessonResponse;
                                
                                if (data.success) {
                                    window.vocabularyList = data.vocabulary;
                                    
                                    // อัพเดทเนื้อหาตาม currentVocabIndex ที่ได้จากฐานข้อมูล
                                    const currentVocab = data.vocabulary[window.currentVocabIndex];
                                    updateLessonPage(data.lesson, currentVocab, data.vocabulary.length);
                                    setupVocabNavigation(data.vocabulary.length);
                                    
                                    // อัพเดทสถานะการนำทาง
                                    updateNavigationState();
                                    checkExamStatus(lessonId);
                                    
                                    // ซ่อน loading แสดงเนื้อหา
                                    $('#lessonLoadingState').hide();
                                    $('#lessonContent').fadeIn();
                                } else {
                                    showError('ไม่พบข้อมูลบทเรียน', data.message);
                                }
                            } catch (e) {
                                console.error('Error parsing lesson data:', e);
                                showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบทเรียน');
                            }
                        },
                        error: handleAjaxError
                    });
                }
            } catch (e) {
                console.error('Error parsing progress data:', e);
                showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลความก้าวหน้า');
            }
        },
        error: handleAjaxError
    });
}

function showLoadingScreen() {
    Swal.fire({
        title: 'กำลังโหลดบทเรียน...',
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
        allowEscapeKey: false,
        focusConfirm: false
    });
}

function handleAjaxError() {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
}

function showError(title, text) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: text
    });
}

function setupAudioPlayer(audioUrl) {
    if (window.audioPlayer) {
        window.audioPlayer.pause();
        window.audioPlayer = null;
    }

    try {
        window.audioPlayer = new Audio(`../../data/voice/${audioUrl}`);
        setupAudioEventListeners();
    } catch (e) {
        showError('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างตัวเล่นเสียงได้');
    }
}

function setupAudioEventListeners() {
    window.audioPlayer.addEventListener('error', () => {
        showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดไฟล์เสียงได้');
    });

    window.audioPlayer.addEventListener('play', () => {
        $('.btn-play i').removeClass('fa-play').addClass('fa-pause');
    });

    window.audioPlayer.addEventListener('pause', updatePlayButtonToPlay);
    window.audioPlayer.addEventListener('ended', updatePlayButtonToPlay);
}

function updatePlayButtonToPlay() {
    $('.btn-play i').removeClass('fa-pause').addClass('fa-play');
}

function playVocabAudio() {
    if (!window.audioPlayer) return;

    try {
        if (window.audioPlayer.paused) {
            window.audioPlayer.play().catch(() => {
                showError('เกิดข้อผิดพลาด', 'ไม่สามารถเล่นเสียงได้');
            });
        } else {
            window.audioPlayer.pause();
        }
    } catch (e) {
        showError('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเล่นเสียง');
    }
}

function setupVocabNavigation(totalVocab) {
    const $prevBtn = $('.btn-prev');
    const $nextBtn = $('.btn-next'); // แก้ไขจาก .btn-next เป็น btn-next
    const $playBtn = $('.btn-play');

    updateNavigationState();

    $playBtn.off('click').on('click', playVocabAudio);
    $prevBtn.off('click').on('click', () => navigateVocab('prev', totalVocab));
    $nextBtn.off('click').on('click', () => navigateVocab('next', totalVocab));
}

function navigateVocab(direction, totalVocab) {
    const previousIndex = window.currentVocabIndex;
    
    // บันทึกเวลาที่ใช้กับคำศัพท์ปัจจุบันก่อนเปลี่ยน
    recordVocabTime();
    
    // อัพเดท current index ตามทิศทาง
    if (direction === 'prev' && window.currentVocabIndex > 0) {
        window.currentVocabIndex--;
    } else if (direction === 'next' && window.currentVocabIndex < totalVocab - 1) {
        window.currentVocabIndex++;
    }

    // บันทึกตำแหน่งปัจจุบันลงฐานข้อมูลทันที
    if (previousIndex !== window.currentVocabIndex) {
        $.ajax({
            url: '../../system/checkLearn.php',
            type: 'POST',
            data: {
                action: 'savePosition',
                lessonId: window.currentLessonId,
                currentVocabIndex: window.currentVocabIndex
            },
            success: function(response) {
                try {
                    const result = JSON.parse(response);
                    if (result.success) {
                        // อัพเดทหน้าเรียนและสถานะการนำทาง
                        const currentVocab = window.vocabularyList[window.currentVocabIndex];
                        updateLessonPage(null, currentVocab, totalVocab);
                        updateNavigationState();
                        // อัพเดทแถบความก้าวหน้า
                        const progress = ((window.currentVocabIndex + 1) / totalVocab) * 100;
                        $('.progress-bar').css('width', `${progress}%`);
                        $('.progress-text').text(`ความคืบหน้า: ${Math.round(progress)}%`);
                        
                        // เพิ่มการเช็คว่าถึงคำศัพท์สุดท้ายหรือยัง
                        checkExamStatus(window.currentLessonId);
                    }
                } catch (e) {
                    console.error('Error parsing response:', e);
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to save position:', error);
            }
        });
    }
}

function updateNavigationState() {
    const $prevBtn = $('.btn-prev');
    const $nextBtn = $('.btn-next');
    const totalVocab = window.vocabularyList.length;
    $prevBtn.prop('disabled', window.currentVocabIndex === 0);
    $nextBtn.prop('disabled', window.currentVocabIndex === totalVocab - 1);
    $('.vocab-counter').text(`${window.currentVocabIndex + 1}/${totalVocab}`);
}

function updateLessonPage(lesson, vocabulary, totalVocab) {
    // บันทึกเวลาก่อนที่จะโหลดคำศัพท์ใหม่
    recordVocabTime();
    
    if (lesson) {
        $('.lesson-header-card h3').text(`บทเรียนที่ ${lesson.id}: ${lesson.title}`);
    }
    
    $('.lesson-main-image').attr('src', vocabulary.img_url ? `../../data/images/${vocabulary.img_url}` : 'https://placehold.co/800x600');
    $('.lesson-text-content h4').text(vocabulary.word_kr);
    $('.lesson-text-content .lesson-description').text(vocabulary.deteil_word);

    $('.pronunciation-item .korean').text(vocabulary.word_kr);
    $('.pronunciation-item .romanized').text(vocabulary.word_en);
    
    // เริ่มจับเวลาสำหรับคำศัพท์ปัจจุบัน
    startVocabTimer(vocabulary.id);

    // แก้ไขส่วนการตั้งค่า audio player
    if (vocabulary.audio_url && vocabulary.audio_url.trim() !== '') {
        setupAudioPlayer(vocabulary.audio_url);
        $('.btn-play').show();
    } else {
        console.log('No audio URL available'); // เพิ่ม log เพื่อดีบัก
        if (window.audioPlayer) {
            window.audioPlayer.pause();
            window.audioPlayer = null;
        }
        $('.btn-play').hide();
    }

    let examplesHtml = '';
    if (vocabulary.example_one) {
        examplesHtml += `
            <li>
                <span class="korean">${vocabulary.example_one}</span>
            </li>
        `;
    }
    if (vocabulary.example_two) {
        examplesHtml += `
            <li>
                <span class="korean">${vocabulary.example_two}</span>
            </li>
        `;
    }
    $('.example-list').html(examplesHtml);

    const progress = ((window.currentVocabIndex + 1) / totalVocab) * 100;
    $('.progress-bar').css('width', `${progress}%`);
    $('.progress-text').text(`ความคืบหน้า: ${Math.round(progress)}%`);
}

function checkLessonAccess(lessonId) {
    $('.page').hide();
    
    // ตรวจสอบการมีอยู่ของแบบทดสอบจากตาราง exams
    $.ajax({
        url: '../../system/manageExams.php',
        type: 'GET',
        data: {
            action: 'getExamByLessonAndType',
            lessonId: lessonId,
            examType: 'pretest'
        },
        success: function(examResponse) {
            try {
                const examResult = typeof examResponse === 'string' ? 
                    JSON.parse(examResponse) : examResponse;
            
                if (!examResult.success || !examResult.exam) {
                    Swal.fire({
                        title: 'ไม่สามารถเข้าเรียนได้',
                        text: 'บทเรียนนี้ยังไม่มีแบบทดสอบครบถ้วน',
                        icon: 'warning',
                        confirmButtonText: 'ตกลง'
                    });
                    $('#attendancePage').show();
                    return;
                }

                // ตรวจสอบสถานะการทำแบบทดสอบจาก learning_progress
                $.ajax({
                    url: '../../system/checkLearn.php',
                    type: 'POST',
                    data: {
                        action: 'checkExams',
                        lessonId: lessonId
                    },
                    success: function(response) {
                        try {
                            const result = typeof response === 'string' ? 
                                JSON.parse(response) : response;
                            
                            if (!result.pretest_done) {
                                if (examResult.exam && examResult.exam.id) {
                                    window.location.href = `exam.php?exam_id=${examResult.exam.id}`;
                                } else {
                                    throw new Error('ไม่พบข้อมูล exam_id');
                                }
                            } else {
                                $('#lessonPage').show();
                                startLesson(lessonId);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            $('#attendancePage').show();
                            Swal.fire({
                                title: 'เกิดข้อผิดพลาด',
                                text: 'ไม่สามารถตรวจสอบสถานะแบบทดสอบได้',
                                icon: 'error'
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('AJAX Error:', error);
                        $('#attendancePage').show();
                        showError('ไม่สามารถตรวจสอบสถานะแบบทดสอบได้');
                    }
                });
            } catch (error) {
                console.error('Error parsing exam response:', error);
                $('#attendancePage').show();
                showError('เกิดข้อผิดพลาดในการโหลดข้อมูลแบบทดสอบ');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            $('#attendancePage').show();
            showError('ไม่สามารถโหลดข้อมูลแบบทดสอบได้');
        }
    });
}

function checkExamStatus(lessonId) {
    $.ajax({
        url: '../../system/checkLearn.php',
        type: 'POST',
        data: {
            action: 'checkExams',
            lessonId: lessonId
        },
        success: function(response) {
            try {
                const result = typeof response === 'string' ? JSON.parse(response) : response;
                
                // อัพเดทสถานะแบบทดสอบก่อนเรียน
                const pretestCard = $('.exam-status-card.pretest');
                if (result.pretest_done) {
                    pretestCard.addClass('completed')
                        .find('.status-text')
                        .html('<i class="fas fa-check-circle text-success"></i> ทำแบบทดสอบแล้ว');
                } else {
                    pretestCard.addClass('not-started')
                        .find('.status-text')
                        .html('<i class="fas fa-times-circle text-danger"></i> ยังไม่ได้ทำแบบทดสอบ');
                }

                // ส่วนของแบบทดสอบหลังเรียน
                const posttestCard = $('.exam-status-card.posttest');
                const examAction = posttestCard.find('.exam-action');
                const examButton = posttestCard.find('.take-exam-btn');

                if (result.posttest_done) {
                    posttestCard.addClass('completed')
                        .find('.status-text')
                        .html('<i class="fas fa-check-circle text-success"></i> ทำแบบทดสอบแล้ว');
                    examAction.hide();
                } else if (result.pretest_done) {
                    const totalVocab = window.vocabularyList ? window.vocabularyList.length : 0;
                    const isLastVocab = window.currentVocabIndex === totalVocab - 1;

                    posttestCard.addClass('in-progress');
                    examAction.show();
                    
                    if (isLastVocab) {
                        // ดึง exam_id ของ posttest
                        $.ajax({
                            url: '../../system/manageExams.php',
                            type: 'GET',
                            data: {
                                action: 'getExamByLessonAndType',
                                lessonId: lessonId,
                                examType: 'posttest'
                            },
                            success: function(examResponse) {
                                try {
                                    const examResult = typeof examResponse === 'string' ? 
                                        JSON.parse(examResponse) : examResponse;
                                    
                                    if (examResult.success && examResult.exam) {
                                        examButton
                                            .prop('disabled', false)
                                            .attr('data-exam-id', examResult.exam.id)
                                            .off('click')
                                            .on('click', function() {
                                                const examId = $(this).attr('data-exam-id');
                                                window.location.href = `exam.php?exam_id=${examId}`;
                                            });
                                        
                                        posttestCard.find('.status-text')
                                            .html('<i class="fas fa-check-circle text-success"></i> พร้อมทำแบบทดสอบ');
                                    }
                                } catch (e) {
                                    console.error('Error parsing exam data:', e);
                                }
                            },
                            error: function(xhr, status, error) {
                                console.error('Failed to get exam:', error);
                            }
                        });
                    } else {
                        posttestCard.find('.status-text')
                            .html('<i class="fas fa-info-circle text-warning"></i> ต้องเรียนให้ครบก่อน');
                        examButton.prop('disabled', true);
                    }
                } else {
                    posttestCard.addClass('not-started')
                        .find('.status-text')
                        .html('<i class="fas fa-lock text-muted"></i> ต้องทำแบบทดสอบก่อนเรียนก่อน');
                    examAction.hide();
                }
            } catch (error) {
                console.error('Error parsing response:', error);
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            showError('ไม่สามารถตรวจสอบสถานะแบบทดสอบได้');
        }
    });
}

// เพิ่มฟังก์ชันใหม่สำหรับตรวจสอบการโหลดเนื้อหา
function checkAndLoadLesson() {
    // ตรวจสอบว่าอยู่ที่หน้าบทเรียนหรือไม่
    if ($('#lessonPage').length > 0) {
        // ตรวจสอบว่ามี current lesson id หรือไม่
        if (window.currentLessonId) {
            loadLessonContent(window.currentLessonId);
        }
    }
}

// เพิ่มฟังก์ชันสำหรับเริ่มจับเวลา
function startVocabTimer(vocabId) {
    window.vocabStartTime = new Date();
    window.vocabId = vocabId;
    console.log(`เริ่มจับเวลาสำหรับคำศัพท์ ID: ${vocabId}`);
}

// เพิ่มฟังก์ชันสำหรับบันทึกเวลาที่ใช้
function recordVocabTime() {
    if (!window.vocabStartTime || !window.vocabId) return;
    
    const timeSpent = Math.floor((new Date() - window.vocabStartTime) / 1000); // เวลาเป็นวินาที
    
    // บันทึกเวลาเฉพาะเมื่อใช้เวลามากกว่า 1 วินาที
    if (timeSpent > 1) {
        $.ajax({
            url: '../../system/checkLearn.php',
            type: 'POST',
            data: {
                action: 'recordVocabTime',
                lessonId: window.currentLessonId,
                vocabId: window.vocabId,
                timeSpent: timeSpent
            },
            success: function(response) {
                console.log(`บันทึกเวลา ${timeSpent} วินาที สำหรับคำศัพท์ ID ${window.vocabId}`);
            },
            error: function(xhr, status, error) {
                console.error('ไม่สามารถบันทึกเวลาได้:', error);
            }
        });
    }
}

// แก้เป็น window function เพื่อให้เรียกใช้จากภายนอกได้
window.confirmLeavePage = function(callback) {
    Swal.fire({
        title: 'ออกจากบทเรียน?',
        text: 'คุณกำลังอยู่ในบทเรียน ต้องการออกจากบทเรียนใช่หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่',
        cancelButtonText: 'ไม่',
        confirmButtonColor: '#dc3545'
    }).then((result) => {
        if (result.isConfirmed) {
            // บันทึกเวลาก่อนออกจากหน้า
            recordVocabTime();
            
            // เรียกฟังก์ชัน callback หากมีการยืนยัน
            if (typeof callback === 'function') {
                callback();
            }
        }
    });
}

$(document).ready(function() {
    // เช็คว่ามีการเปลี่ยนแปลง URL หรือไม่
    $(window).on('hashchange', function() {
        checkAndLoadLesson();
    });
    
    // บันทึกเวลาเมื่อออกจากหน้าเว็บ
    $(window).on('beforeunload', function() {
        recordVocabTime();
    });
    
    // ตรวจสอบการเปลี่ยนแท็บ
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
            // บันทึกเวลาเมื่อเปลี่ยนแท็บหรือออกจากหน้า
            recordVocabTime();
        } else if (document.visibilityState === 'visible' && window.vocabId) {
            // เริ่มจับเวลาใหม่เมื่อกลับมาที่หน้า
            window.vocabStartTime = new Date();
        }
    });
    
    // โหลดบทเรียนเมื่อเปิดหน้าครั้งแรก
    if ($('#lessonPage').length > 0 && window.currentLessonId) {
        loadLessonContent(window.currentLessonId);
    }
    
    // เก็บแค่ส่วนจัดการ dropdown และอื่นๆ
    $('.nav-right .dropdown-menu li, .breadcrumb span').on('click', function(e) {
        if ($('#lessonPage').is(':visible')) {
            e.preventDefault();
            e.stopPropagation();
            
            const $this = $(this);
            const targetPage = $this.data('page') || $this.attr('href');
            
            window.confirmLeavePage(function() {
                // หากผู้ใช้ยืนยัน ให้นำทางไปยังหน้าที่ต้องการ
                if ($this.data('page')) {
                    // สำหรับ sidebar menu items
                    $('.page').hide();
                    $(`#${targetPage}Page`).show();
                    $('.sidebar-menu li').removeClass('active');
                    $this.addClass('active');
                    $('#currentPage').text($this.find('span').text());
                } else if ($this.attr('href')) {
                    // สำหรับลิงก์ปกติ
                    window.location.href = $this.attr('href');
                }
            });
        }
    });
    
    // จัดการการกดลิงก์ออกจากระบบเมื่ออยู่ในหน้าบทเรียน
    $('#logoutBtn').on('click', function(e) {
        if ($('#lessonPage').is(':visible')) {
            e.preventDefault();
            window.confirmLeavePage(function() {
                window.location.href = $('#logoutBtn').attr('href');
            });
        }
    });
});