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
    
    Swal.fire({
        title: 'กำลังโหลดบทเรียน...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
    });

    $.ajax({
        url: '../../system/getLesson.php',
        type: 'GET',
        data: { lessonId: lessonId },
        success: function(response) {
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
                    Swal.fire({
                        icon: 'error',
                        title: 'ไม่พบข้อมูลบทเรียน',
                        text: data.message
                    });
                }
            } catch (e) {
                console.error(e);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถโหลดข้อมูลบทเรียนได้'
                });
            }
        },
        error: function() {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'
            });
        }
    });
}

function setupAudioPlayer(audioUrl) {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }
    audioPlayer = new Audio(`../../data/voice/${audioUrl}`);
}

function playVocabAudio() {
    if (audioPlayer) {
        audioPlayer.play();
    }
}

function setupVocabNavigation(totalVocab) {
    const $prevBtn = $('.btn-prev');
    const $nextBtn = $('..btn-next');
    
    updateNavigationState();

    $prevBtn.off('click').on('click', function() {
        if (currentVocabIndex > 0) {
            currentVocabIndex--;
            updateLessonPage(null, vocabularyList[currentVocabIndex], totalVocab);
            updateNavigationState();
        }
    });

    $nextBtn.off('click').on('click', function() {
        if (currentVocabIndex < totalVocab - 1) {
            currentVocabIndex++;
            updateLessonPage(null, vocabularyList[currentVocabIndex], totalVocab);
            updateNavigationState();
        }
    });
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

    // Set up audio player
    if (vocabulary.audio_url) {
        setupAudioPlayer(vocabulary.audio_url);
        $('.btn-play').show();
    } else {
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
