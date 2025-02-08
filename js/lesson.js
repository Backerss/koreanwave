let currentVocabIndex = 0;
let vocabularyList = [];
let audioPlayer;

function startLesson(lessonId) {
    Swal.fire({
        title: 'ยืนยันการเข้าบทเรียน',
        text: 'คุณต้องการเข้าสู่บทเรียนนี้ใช่หรือไม่?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ใช่, เข้าบทเรียน',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#003399',
        cancelButtonColor: '#dc3545'
    }).then((result) => {
        if (result.isConfirmed) {
            loadLessonContent(lessonId);
        }
    });
}

function loadLessonContent(lessonId) {
    currentVocabIndex = 0;
    showLoadingScreen();

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
            vocabularyList = data.vocabulary;
            updateLessonPage(data.lesson, data.vocabulary[0], data.vocabulary.length);
            setupVocabNavigation(data.vocabulary.length);
            $('.page').removeClass('active');
            $('#lessonPage').addClass('active');
            Swal.close();
        } else {
            showError('ไม่พบข้อมูลบทเรียน', data.message);
        }
    } catch (e) {
        showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลบทเรียนได้');
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
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }

    try {
        audioPlayer = new Audio(`../../data/voice/${audioUrl}`);
        setupAudioEventListeners();
    } catch (e) {
        showError('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างตัวเล่นเสียงได้');
    }
}

function setupAudioEventListeners() {
    audioPlayer.addEventListener('error', () => {
        showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดไฟล์เสียงได้');
    });

    audioPlayer.addEventListener('play', () => {
        $('.btn-play i').removeClass('fa-play').addClass('fa-pause');
    });

    audioPlayer.addEventListener('pause', updatePlayButtonToPlay);
    audioPlayer.addEventListener('ended', updatePlayButtonToPlay);
}

function updatePlayButtonToPlay() {
    $('.btn-play i').removeClass('fa-pause').addClass('fa-play');
}

function playVocabAudio() {
    if (!audioPlayer) return;

    try {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(() => {
                showError('เกิดข้อผิดพลาด', 'ไม่สามารถเล่นเสียงได้');
            });
        } else {
            audioPlayer.pause();
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
    if (direction === 'prev' && currentVocabIndex > 0) {
        currentVocabIndex--;
    } else if (direction === 'next' && currentVocabIndex < totalVocab - 1) {
        currentVocabIndex++;
    }
    updateLessonPage(null, vocabularyList[currentVocabIndex], totalVocab);
    updateNavigationState();
}

function updateNavigationState() {
    const $prevBtn = $('.btn-prev');
    const $nextBtn = $('.btn-next');
    const totalVocab = vocabularyList.length;

    $prevBtn.prop('disabled', currentVocabIndex === 0);
    $nextBtn.prop('disabled', currentVocabIndex === totalVocab - 1);
    $('.vocab-counter').text(`${currentVocabIndex + 1}/${totalVocab}`);
}

function updateLessonPage(lesson, vocabulary, totalVocab) {
    if (lesson) {
        $('.lesson-header-card h3').text(`บทที่ ${lesson.id}: ${lesson.title}`);
    }

    $('.lesson-main-image').attr('src', vocabulary.img_url || 'https://placehold.co/800x600');
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
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
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

    const progress = ((currentVocabIndex + 1) / totalVocab) * 100;
    $('.progress-bar').css('width', `${progress}%`);
    $('.progress-text').text(`ความคืบหน้า: ${Math.round(progress)}%`);
}
