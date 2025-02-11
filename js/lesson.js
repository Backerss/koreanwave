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
    currentLessonId = lessonId;
    checkExamStatus(lessonId);  // เพิ่มบรรทัดนี้
    $.ajax({
        url: '../../system/checkLearn.php',
        type: 'POST',
        data: {
            action: 'check',
            lessonId: lessonId
        },
        success: function (response) {
            const result = JSON.parse(response);
            if (result.success) {
                if (!result.hasPretest) {
                    // ดึง exam_id ของแบบทดสอบก่อนเรียน
                    $.ajax({
                        url: '../../system/manageExams.php',
                        type: 'GET',
                        data: {
                            action: 'getExamByLessonAndType',
                            lessonId: lessonId,
                            examType: 'pretest'
                        },
                        success: function(examResponse) {
                            if (examResponse.success && examResponse.exam) {
                                Swal.fire({
                                    title: 'แบบทดสอบก่อนเรียน',
                                    text: 'คุณต้องทำแบบทดสอบก่อนเรียนก่อน',
                                    icon: 'info',
                                    showCancelButton: true,
                                    confirmButtonText: 'ทำแบบทดสอบ',
                                    cancelButtonText: 'ยกเลิก'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        window.location.href = `../view/exam.php?exam_id=${examResponse.exam.id}`;
                                    }
                                });
                            } else {
                                Swal.fire('ผิดพลาด', 'ไม่พบแบบทดสอบก่อนเรียน', 'error');
                            }
                        }
                    });
                } else {
                    // ถ้าทำแบบทดสอบแล้ว โหลดบทเรียน
                    loadLessonContent(lessonId);
                    window.currentVocabIndex = result.currentVocabIndex;
                }
            }
        }
    });
}

function loadLessonContent(lessonId) {
    $.get('../../system/checkLearn.php', {
        lesson_id: lessonId
    }, function (response) {
        if (response.success) {
            const status = $(`[data-lesson-id="${lessonId}"] .exam-status`);
            if (response.hasPretest && response.hasPosttest) {
                status.html('<span class="badge bg-success">พร้อมเรียน</span>');
            } else {
                status.html('<span class="badge bg-warning">รอแบบทดสอบ</span>');
            }
        }
    });

    window.currentVocabIndex = 0;

    $.ajax({
        url: '../../system/getLesson.php',
        type: 'GET',
        data: { lessonId: lessonId },
        success: handleLessonData,
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
    if (direction === 'prev' && window.currentVocabIndex > 0) {
        window.currentVocabIndex--;
    } else if (direction === 'next' && window.currentVocabIndex < totalVocab - 1) {
        window.currentVocabIndex++;
    }

    // บันทึกความก้าวหน้า
    $.ajax({
        url: '../../system/checkLearn.php',
        type: 'POST',
        data: {
            action: 'update',
            lessonId: window.currentLessonId,
            currentVocabIndex: window.currentVocabIndex
        },
        success: function (response) {
            const result = JSON.parse(response);
            if (!result.success) {
                console.error(result.message);
            } else {
                updateLessonPage(null, window.vocabularyList[window.currentVocabIndex], totalVocab);
                updateNavigationState();
                // เพิ่มการเรียกใช้ฟังก์ชันตรวจสอบการเรียนจบ
                checkLessonCompletion(window.currentVocabIndex, totalVocab);
            }
        }
    });
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
    // เพิ่มการตรวจสอบว่าอยู่ที่คำศัพท์สุดท้ายและกดปุ่มถัดไป
    if (currentIndex === totalVocab - 1) {
        const $nextBtn = $('.btn-next');

        $nextBtn.prop('disabled', false);
        
        console.log(currentIndex, totalVocab);
        // ผูกเหตุการณ์คลิกปุ่มถัดไป
        $nextBtn.one('click', () => {
            Swal.fire({
                title: 'เรียนจบบทเรียนแล้ว!',
                text: 'คุณต้องการทำแบบทดสอบหลังเรียนหรือไม่?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'ทำแบบทดสอบ',
                cancelButtonText: 'เรียนซ้ำ'
            }).then((result) => {
                if (result.isConfirmed) {
                    // ไปหน้าแบบทดสอบหลังเรียน
                    window.location.href = `posttest.php?lesson_id=${window.currentLessonId}`;
                } else {
                    // Reset index เพื่อเริ่มเรียนใหม่
                    window.currentVocabIndex = 0;
                    updateLessonPage(null, window.vocabularyList[0], window.vocabularyList.length);
                    updateNavigationState();
                }
            });
        });
    }
}

function checkLessonAccess(lessonId) {
    $.get('../../system/checkLearn.php', {
        lesson_id: lessonId
    }, function (response) {

        let res = JSON.parse(response);

    
        if (res.success) {
            const userRole = res.userRole;

            // อนุญาตให้ครูและแอดมินเข้าถึงได้เสมอ
            if (userRole === 'teacher' || userRole === 'admin') {
                startLesson(lessonId);
                return;
            }

            // ตรวจสอบแบบทดสอบสำหรับนักเรียน
            if (!res.hasPretest || !res.hasPosttest) {
                Swal.fire({
                    title: 'ไม่สามารถเข้าเรียนได้',
                    text: 'บทเรียนนี้ยังไม่มีแบบทดสอบครบถ้วน กรุณาติดต่อผู้สอน',
                    icon: 'warning',
                    confirmButtonText: 'ตกลง'
                });
            } else {
                startLesson(lessonId);
            }
        } else {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: res.message,
                icon: 'error',
                confirmButtonText: 'ตกลง'
            });
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