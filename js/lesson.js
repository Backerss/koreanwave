
function startLesson(lessonId) {
    // Show confirmation dialog first
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
            // User confirmed, proceed to load lesson
            loadLessonContent(lessonId);
        }
    });
}

// Add these variables at the top of your script
let currentVocabIndex = 0;
let vocabularyList = [];

// Modify the loadLessonContent function
function loadLessonContent(lessonId) {
    currentVocabIndex = 0; // Reset index when loading new lesson
    
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
                const data = JSON.parse(response);
                if (data.success) {
                    vocabularyList = data.vocabulary; // Store all vocabulary items
                    updateLessonPage(data.lesson, data.vocabulary[0], data.totalVocab);

                    // Set up navigation buttons
                    setupVocabNavigation(data.totalVocab);

                    $('.page').removeClass('active');
                    $('#lessonPage').addClass('active');
                    Swal.close();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ไม่พบข้อมูลบทเรียน',
                        text: 'กรุณาลองใหม่อีกครั้ง'
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

// Add these new functions
function setupVocabNavigation(totalVocab) {
    const $prevBtn = $('.btn-prev');
    const $nextBtn = $('.btn-next');
    
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
    const $counter = $('.vocab-counter');
    
    // Update counter
    $counter.text(`${currentVocabIndex + 1}/${vocabularyList.length}`);
    
    // Update button states
    $prevBtn.prop('disabled', currentVocabIndex === 0);
    $nextBtn.prop('disabled', currentVocabIndex === vocabularyList.length - 1);
}

// Modify the updateLessonPage function
function updateLessonPage(lesson, vocabulary, totalVocab) {
    // Update lesson header if lesson data is provided
    if (lesson) {
        $('.lesson-header-card h3').text(`บทที่ ${lesson.id}: ${lesson.title}`);
    }

    // Update content
    $('.lesson-main-image').attr('src', vocabulary.img_url || 'https://placehold.co/800x600');
    $('.lesson-text-content h4').text(vocabulary.word_kr);
    $('.lesson-text-content .lesson-description').text(vocabulary.deteil_word);

    // Update pronunciation section
    $('.pronunciation-item .korean').text(vocabulary.word_kr);
    $('.pronunciation-item .romanized').text(vocabulary.word_en);

    // Update examples
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

    // Update progress
    const progress = ((currentVocabIndex + 1) / totalVocab) * 100;
    $('.progress-bar').css('width', `${progress}%`);
    $('.progress-text').text(`ความคืบหน้า: ${Math.round(progress)}%`);
}
