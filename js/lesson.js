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
    // เช็คสถานะการเรียน
    currentLessonId = lessonId;
    $.ajax({
        url: '../../system/checkLearn.php',
        type: 'POST',
        data: { 
            action: 'check',
            lessonId: lessonId 
        },
        success: function(response) {
            const result = JSON.parse(response);
            if (result.success) {
                if (!result.hasPretest) {
                    // ถ้ายังไม่ได้ทำแบบทดสอบก่อนเรียน
                    Swal.fire({
                        title: 'แบบทดสอบก่อนเรียน',
                        text: 'คุณต้องทำแบบทดสอบก่อนเรียนก่อน',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonText: 'ทำแบบทดสอบ',
                        cancelButtonText: 'ยกเลิก'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            //window.location.href = `pretest.php?lesson_id=${lessonId}`;
                        }
                    });
                } else {
                    // ถ้าทำแบบทดสอบแล้ว โหลดบทเรียนที่ค้างไว้
                    loadLessonContent(lessonId);
                    window.currentVocabIndex = result.currentVocabIndex;
                }
            }
        }
    });
}

function loadLessonContent(lessonId) {
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
    const $nextBtn = $('.btn-next');
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
        success: function(response) {
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
    if (currentIndex === totalVocab - 1) {
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
    }
}