$(document).ready(function () {
    // Sidebar Toggle
    $('#sidebarToggle').click(function () {
        $('.sidebar').toggleClass('active');
        $('.main-content').toggleClass('sidebar-hidden');
    });


    // Page Navigation
    $('.sidebar-menu li').click(function (e) {
        if ($('#lessonPage').hasClass('active')) {
            e.preventDefault();
            const targetPage = $(this).data('page');
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
                    // Update active states
                    $('.sidebar-menu li').removeClass('active');
                    $(this).addClass('active');

                    // Update current page text
                    $('#currentPage').text($(this).find('span').text());

                    // Show target page
                    $('.page').removeClass('active');
                    $(`#${targetPage}Page`).addClass('active');
                    return;
                }
            });
        } else {
            // Original navigation code for other pages
            const targetPage = $(this).data('page');
            $('.sidebar-menu li').removeClass('active');
            $(this).addClass('active');
            $('#currentPage').text($(this).find('span').text());
            $('.page').removeClass('active');
            $(`#${targetPage}Page`).addClass('active');
        }
    });

    // Add page refresh confirmation
    window.addEventListener('beforeunload', function (e) {
        if ($('#lessonPage').hasClass('active')) {
            e.preventDefault();
            e.returnValue = '';
        }
    });


    // Initialize DataTables
    $('.table').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/th.json'
        }
    });

    // Notification Bell Click
    $('.notification-bell').click(function () {
        Swal.fire({
            title: 'การแจ้งเตือน',
            html: `
                <div class="notification-list">
                    <div class="notification-item">
                        <div class="details">
                            <p>ส่งการบ้านวิชาคณิตศาสตร์</p>
                            <small>กำหนดส่ง: วันนี้</small>
                        </div>
                    </div>
                    <div class="notification-item">
                        <div class="details">
                            <p>ประกาศหยุดเรียนวันศุกร์ที่ 8 ก.พ.</p>
                            <small>2 ชั่วโมงที่แล้ว</small>
                        </div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            customClass: {
                popup: 'notification-popup'
            }
        });
    });

    // Logout Button
    $('#logoutBtn').click(function (e) {
        e.preventDefault();

        Swal.fire({
            title: 'ยืนยันการออกจากระบบ',
            text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ใช่',
            cancelButtonText: 'ไม่',
            confirmButtonColor: '#dc3545'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '../../system/logout.php';
            }
        });
    });

    // Submit Assignment Button
    $('.btn-primary').click(function () {
        if ($(this).text() === 'ส่งงาน') {
            Swal.fire({
                title: 'อัพโหลดไฟล์งาน',
                html: `
                    <input type="file" class="form-control" id="assignment-file">
                    <textarea class="form-control mt-3" placeholder="หมายเหตุ (ถ้ามี)"></textarea>
                `,
                showCancelButton: true,
                confirmButtonText: 'ส่งงาน',
                cancelButtonText: 'ยกเลิก',
                preConfirm: () => {
                    const file = $('#assignment-file').val();
                    if (!file) {
                        Swal.showValidationMessage('กรุณาเลือกไฟล์ที่ต้องการส่ง');
                        return false;
                    }
                    return true;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ส่งงานสำเร็จ',
                        text: 'ระบบได้บันทึกการส่งงานของคุณแล้ว'
                    });
                }
            });
        }
    });

    // Real-time Clock Update
    function updateClock() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const dateTimeString = now.toLocaleDateString('th-TH', options);
        $('.datetime').text(dateTimeString);
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Initialize Charts (if needed)

    // Initialize Grade Charts
    function initGradeCharts() {
        // Grades Trend Chart
        const trendCtx = document.getElementById('gradesTrendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['1/2566', '2/2566', '1/2567', '2/2567'],
                datasets: [{
                    label: 'เกรดเฉลี่ย',
                    data: [3.45, 3.60, 3.75, 3.90],
                    borderColor: '#003399',
                    tension: 0.3,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'แนวโน้มผลการเรียน'
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 4
                    }
                }
            }
        });

        // Grade Distribution Chart
        const distributionCtx = document.getElementById('gradeDistributionChart').getContext('2d');
        new Chart(distributionCtx, {
            type: 'bar',
            data: {
                labels: ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'],
                datasets: [{
                    label: 'จำนวนวิชา',
                    data: [2, 3, 1, 1, 0, 0, 0, 0],
                    backgroundColor: [
                        '#28a745',
                        '#20c997',
                        '#17a2b8',
                        '#ffc107',
                        '#fd7e14',
                        '#dc3545',
                        '#6c757d',
                        '#343a40'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Call initGradeCharts when the grades page is shown
    $('.sidebar-menu li[data-page="grades"]').click(function () {
        setTimeout(initGradeCharts, 100);
    });

    // Handle Profile Image Upload
    $('#profileImageUpload').change(function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                $('#profileImage').attr('src', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });
});



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

// Separate function for loading lesson content
function loadLessonContent(lessonId) {
    // Show loading state
    Swal.fire({
        title: 'กำลังโหลดบทเรียน...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false
    });

    // Load lesson data via AJAX
    $.ajax({
        url: '../../system/getLesson.php',
        type: 'GET',
        data: { lessonId: lessonId },
        success: function(response) {
            try {
                const data = JSON.parse(response);
                if (data.success) {
                    // Update lesson page content
                    updateLessonPage(data.lesson, data.vocabulary);

                    // Switch to lesson page
                    $('.page').removeClass('active');
                    $('#lessonPage').addClass('active');

                    // Close loading dialog
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

function updateLessonPage(lesson, vocabulary) {
    // Update lesson header
    $('.lesson-header-card h3').text(`บทที่ ${lesson.id}: ${lesson.title}`);

    // Update main image
    $('.lesson-main-image').attr('src', vocabulary.img_url || 'https://placehold.co/800x600');

    // Update content
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
}
