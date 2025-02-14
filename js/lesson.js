// ตรวจสอบว่าตัวแปรถูกประกาศแล้วหรือยัง
if (typeof currentVocabIndex === 'undefined') {
    let currentLessonId = 0;
    let currentVocabIndex = 0;
    let vocabularyList = [];
    let audioPlayer;
}

// หรือใช้ window object เพื่อเก็บตัวแปร global
window.currentVocabIndex = window.currentVocabIndex || 0;
window.vocabularyList = window.vocabularyList || [];
window.audioPlayer = window.audioPlayer || null;

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
                    // เก็บ index ปัจจุบัน
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
                                    
                                    // อัพเดทเนื้อหาตาม currentVocabIndex
                                    updateLessonPage(
                                        data.lesson, 
                                        data.vocabulary[window.currentVocabIndex], 
                                        data.vocabulary.length
                                    );
                                    setupVocabNavigation(data.vocabulary.length);
                                    
                                    // ถ้าอยู่ที่คำศัพท์สุดท้าย ให้เปิดปุ่มถัดไป
                                    if (window.currentVocabIndex === data.vocabulary.length - 1) {
                                        $('.btn-next').prop('disabled', false);
                                    }
                                    
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

function handleLessonData(response) {
    try {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        if (data.success) {
            window.vocabularyList = data.vocabulary;
            updateLessonPage(data.lesson, data.vocabulary[0], data.vocabulary.length);
            setupVocabNavigation(data.vocabulary.length);
            $('.page').removeClass('active');
            $('#lessonPage').addClass('active');
            Swal.close();
        } else {
            showError('ไม่พบข้อมูลบทเรียน', data.message);
        }
    } catch (e) {
        console.error(e);
    }
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
    
    // อัพเดท current index ตามทิศทาง
    if (direction === 'prev' && window.currentVocabIndex > 0) {
        window.currentVocabIndex--;
    } else if (direction === 'next' && window.currentVocabIndex < totalVocab - 1) {
        window.currentVocabIndex++;
    }

    // ถ้า index เปลี่ยน ให้บันทึกความก้าวหน้า
    if (previousIndex !== window.currentVocabIndex) {

        // บันทึกความก้าวหน้า
        $.ajax({
            url: '../../system/checkLearn.php',
            type: 'POST',
            data: {
                action: 'update',
                lessonId: window.currentLessonId,
                currentVocabIndex: window.currentVocabIndex,
                totalVocab: totalVocab
            },
            success: function (response) {
                try {
                    const result = JSON.parse(response);
                    if (!result.success) {
                        console.error('Failed to update progress:', result.message);
                        showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกความก้าวหน้าได้');
                    } else {

                        // อัพเดทหน้าเรียนและสถานะการนำทาง
                        const currentVocab = window.vocabularyList[window.currentVocabIndex];
                        
                        updateLessonPage(null, currentVocab, totalVocab);
                        updateNavigationState();
                        
                        // เช็คว่าถึงคำศัพท์สุดท้ายหรือไม่
                        if (window.currentVocabIndex === totalVocab - 1) {
                            checkLessonCompletion(window.currentVocabIndex, totalVocab);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing response:', e);
                    showError('เกิดข้อผิดพลาด', 'ไม่สามารถประมวลผลการตอบกลับ');
                }
            },
            error: function(xhr, status, error) {
                console.error('Ajax error:', {xhr, status, error});
                showError('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
            }
        });
    } else {
        console.log('Index did not change, no update needed');
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
    if (lesson) {
        $('.lesson-header-card h3').text(`บทที่ ${lesson.id}: ${lesson.title}`);
    }



    $('.lesson-main-image').attr('src', vocabulary.img_url ? `../../data/images/${vocabulary.img_url}` : 'https://placehold.co/800x600');
    $('.lesson-text-content h4').text(vocabulary.word_kr);
    $('.lesson-text-content .lesson-description').text(vocabulary.deteil_word);

    $('.pronunciation-item .korean').text(vocabulary.word_kr);
    $('.pronunciation-item .romanized').text(vocabulary.word_en);

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

// เพิ่มฟังก์ชันตรวจสอบว่าเรียนครบทุกคำศัพท์หรือยัง
function checkLessonCompletion(currentIndex, totalVocab) {
    if (currentIndex === totalVocab - 1) {
        // อัพเดทสถานะว่าเรียนจบแล้วในฐานข้อมูล
        $.ajax({
            url: '../../system/checkLearn.php',
            type: 'POST',
            data: {
                action: 'markAsCompleted',
                lessonId: window.currentLessonId
            },
            success: function(response) {
                try {
                    const result = JSON.parse(response);
                    if (!result.success) {
                        console.error('Failed to update completion status:', result.message);
                    }
                } catch (e) {
                    console.error('Error parsing completion response:', e);
                }
            },
            error: function(xhr, status, error) {
                console.error('Ajax error:', error);
            }
        });

        // ปิดการใช้งานปุ่มถัดไป
        $('.btn-next').prop('disabled', true);
    }
}

function checkLessonAccess(lessonId) {
    // ซ่อนทุกหน้าก่อน
    $('.page').hide();
    
    $.get('../../system/checkLearn.php', {
        lesson_id: lessonId
    }, function (response) {
        let result = JSON.parse(response);
        
        if (result.success) {
            if (!result.hasPretest || !result.hasPosttest) {
                Swal.fire({
                    title: 'ไม่สามารถเข้าเรียนได้',
                    text: 'บทเรียนนี้ยังไม่มีแบบทดสอบครบถ้วน กรุณาติดต่อผู้สอน',
                    icon: 'warning',
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    // กลับไปหน้า attendance เมื่อมีข้อผิดพลาด
                    $('#attendancePage').show();
                });
            } else {
                // แสดงหน้า lessonPage และเริ่มบทเรียน
                $('#lessonPage').show();
                startLesson(lessonId);
                
                // อัปเดต breadcrumb และ sidebar
                $('#currentPage').text('บทเรียน');
                $('.sidebar-menu li').removeClass('active');
                $('.sidebar-menu li[data-page="lesson"]').addClass('active');
            }
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
                        .html('<i class="fas fa-exclamation-circle text-warning"></i> ยังไม่ได้ทำแบบทดสอบ');
                }

                // อัพเดทสถานะแบบทดสอบหลังเรียน
                const posttestCard = $('.exam-status-card.posttest'); 
                if (result.posttest_done) {
                    posttestCard.addClass('completed')
                        .find('.status-text')
                        .html('<i class="fas fa-check-circle text-success"></i> ทำแบบทดสอบแล้ว');
                } else if (result.pretest_done) {
                    posttestCard.addClass('in-progress')
                        .find('.status-text')
                        .html('<i class="fas fa-clock text-primary"></i> พร้อมทำแบบทดสอบ');
                } else {
                    posttestCard.addClass('not-started')
                        .find('.status-text')
                        .html('<i class="fas fa-lock text-muted"></i> ต้องทำแบบทดสอบก่อนเรียนก่อน');
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

$(document).ready(function() {
    // เช็คว่ามีการเปลี่ยนแปลง URL หรือไม่
    $(window).on('hashchange', function() {
        checkAndLoadLesson();
    });

    
    // โหลดบทเรียนเมื่อเปิดหน้าครั้งแรก
    if ($('#lessonPage').length > 0 && window.currentLessonId) {
        loadLessonContent(window.currentLessonId);
    }
});