$(document).ready(function () {
    try {
        // Sidebar Toggle
        $('#sidebarToggle').on('click', function () {
            $('.sidebar').toggleClass('active');
            $('.main-content').toggleClass('sidebar-hidden');
        });

        // Page Navigation
        $('.sidebar-menu li').on('click', function (e) {
            try {
                if ($('#lessonPage').hasClass('active')) {
                    e.preventDefault();
                    const targetPage = $(this).data('page');
                    if (!targetPage) return;

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
                            navigateToPage($(this), targetPage);
                        }
                    });
                } else {
                    const targetPage = $(this).data('page');
                    if (!targetPage) return;
                    navigateToPage($(this), targetPage);
                }
            } catch (err) {
                console.error('Navigation error:', err);
            }
        });

        // Helper function for page navigation
        function navigateToPage($element, targetPage) {
            $('.sidebar-menu li').removeClass('active');
            $element.addClass('active');
            $('#currentPage').text($element.find('span').text() || '');
            $('.page').removeClass('active');
            $(`#${targetPage}Page`).addClass('active');
        }

        // Notification Bell Click
        $('.notification-bell').on('click', function () {
            try {
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
            } catch (err) {
                console.error('Notification error:', err);
            }
        });

        // Logout Button
        $('#logoutBtn').on('click', function (e) {
            e.preventDefault();
            try {
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
            } catch (err) {
                console.error('Logout error:', err);
            }
        });

        // Submit Assignment Button
        $('.btn-primary').on('click', function () {
            try {
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
            } catch (err) {
                console.error('Assignment submission error:', err);
            }
        });

        // Real-time Clock Update
        function updateClock() {
            try {
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
            } catch (err) {
                console.error('Clock update error:', err);
            }
        }

        const clockInterval = setInterval(updateClock, 1000);
        updateClock();


        // Initialize charts when grades page is shown
        $('.sidebar-menu li[data-page="grades"]').on('click', function () {
            setTimeout(initGradeCharts, 100);
        });

        // Handle Profile Image Upload
        $('#profileImageUpload').on('change', function () {
            try {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        $('#profileImage').attr('src', e.target.result);
                    }
                    reader.readAsDataURL(file);
                }
            } catch (err) {
                console.error('Profile image upload error:', err);
            }
        });

    } catch (err) {
        console.error('Global initialization error:', err);
    }

    // Cleanup function for page unload
    $(window).on('unload', function() {
        if (clockInterval) {
            clearInterval(clockInterval);
        }
    });
});
