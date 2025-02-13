$(document).ready(function () {

    console.log('Home page loaded test on web');
    let currentScript = null;
    let currentStylesheet = null;
    const loadedScripts = new Set();

    // เพิ่มตัวแปร global สำหรับจัดการสคริปต์
    const scriptManager = {
        loadedScripts: new Map(), // เก็บ reference ของสคริปต์ที่โหลด
        currentPage: null,
        scriptMap: {
            'profile': '../../js/profile.js',
            'courses': '../../js/courese.js',
            'examCreator': '../../js/exam-creator.js',
            'attendance': '../../js/lesson.js',
            'users': '../../js/userManagementPage.js'
        }
    };

    // Sidebar Toggle
    $('#sidebarToggle').on('click', function () {
        console.log('Sidebar toggle clicked');
        $('.sidebar').toggleClass('active');
        $('.main-content').toggleClass('sidebar-hidden');
    });

    try {
        // ฟังก์ชันสำหรับการโหลดสคริปต์
        function loadPageScript(pageName) {
            const scriptPath = scriptManager.scriptMap[pageName];
            if (!scriptPath) return Promise.resolve();

            // ถ้าสคริปต์ถูกโหลดแล้ว ให้ return Promise ที่ resolve แล้ว
            if (scriptManager.loadedScripts.has(scriptPath)) {
                return Promise.resolve();
            }

            // สร้าง Promise สำหรับการโหลดสคริปต์
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `${scriptPath}?v=${new Date().getTime()}`; // เพิ่ม timestamp เพื่อป้องกัน cache
                script.type = 'text/javascript';

                script.onload = () => {

                    scriptManager.loadedScripts.set(scriptPath, script);
                    resolve();
                };

                script.onerror = () => {
                    console.error(`Failed to load script ${scriptPath}`);
                    reject(new Error(`Failed to load ${scriptPath}`));
                };

                document.body.appendChild(script);
            });
        }

        // ฟังก์ชันสำหรับลบสคริปต์
        function unloadPageScript(pageName) {
            const scriptPath = scriptManager.scriptMap[pageName];
            if (!scriptPath) return;

            const script = scriptManager.loadedScripts.get(scriptPath);
            if (script) {
                // ลบ Event Listeners
                const clone = script.cloneNode(true);
                script.parentNode.replaceChild(clone, script);
                clone.remove();
                
                // ลบออกจาก Map
                scriptManager.loadedScripts.delete(scriptPath);
            }
        }

        // Function to load page-specific CSS
        function loadPageStylesheet(pageName) {
            // Remove previous stylesheet if exists
            if (currentStylesheet) {
                currentStylesheet.remove();
                currentStylesheet = null;
            }

            // Map pages to their CSS files
            const styleMap = {
                'profile': '../../css/profile.css',
                'users': '../../css/userManagement.css',
                'grades': '../../css/gradesPage.css',
                'lesson': '../../css/lessonpage.css',
                'exam': '../../css/exam.css'
            };

            // Load stylesheet if page has an associated CSS file
            if (styleMap[pageName]) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = styleMap[pageName];
                currentStylesheet = link;
                document.head.appendChild(link);
            }
        }

        // ปรับปรุงฟังก์ชัน navigateToPage
        function navigateToPage($element, targetPage) {
            try {
                // Cleanup ก่อนเปลี่ยนหน้า
                if (scriptManager.currentPage) {
                    // ทำความสะอาด DataTables ถ้ามี
                    if (scriptManager.currentPage === 'users' && $.fn.DataTable.isDataTable('#usersTable')) {
                        $('#usersTable').DataTable().destroy();
                    }
                    
                    // ยกเลิกการโหลดสคริปต์ของหน้าเดิม
                    unloadPageScript(scriptManager.currentPage);
                }

                $('.sidebar-menu li').removeClass('active');
                $element.addClass('active');
                $('#currentPage').text($element.find('span').text() || '');
                $('.page').removeClass('active');

                const $targetPage = $(`#${targetPage}Page`);
                $targetPage.addClass('active');

                // แสดง loading
                showPageLoadingAnimation($targetPage);

                // อัพเดทหน้าปัจจุบัน
                scriptManager.currentPage = targetPage;

                // โหลดทรัพยากรของหน้า
                Promise.all([
                    loadPageScript(targetPage),
                    loadPageStylesheet(targetPage)
                ]).then(() => {
                    $('.page-loading-overlay').fadeOut(300, function() {
                        $(this).remove();
                    });
                    $(document).trigger('pageChanged', [targetPage + 'Page']);
                }).catch(error => {
                    console.error('Error loading page resources:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: 'ไม่สามารถโหลดทรัพยากรของหน้าได้'
                    });
                });

            } catch (err) {
                console.error('Navigation error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถนำทางไปยังหน้าที่ต้องการได้'
                });
            }
        }

        // Add loading animation function
        function showPageLoadingAnimation($targetPage) {
            const loadingOverlay = `
                <div class="page-loading-overlay">
                    <div class="loading-spinner"></div>
                </div>
            `;
            
            $targetPage.append(loadingOverlay);
            
            // Remove loading overlay after resources are loaded
            Promise.all([
                // Wait for stylesheet to load
                currentStylesheet ? new Promise(resolve => {
                    currentStylesheet.onload = resolve;
                }) : Promise.resolve(),
                // Wait for script to load
                currentScript ? new Promise(resolve => {
                    currentScript.onload = resolve;
                }) : Promise.resolve(),
                // Minimum display time for loading animation
                new Promise(resolve => setTimeout(resolve, 500))
            ]).then(() => {
                $('.page-loading-overlay').fadeOut(300, function() {
                    $(this).remove();
                });
            });
        }

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

        // Load script for initial page if needed
        const initialPage = $('.sidebar-menu li.active').data('page');
        if (initialPage) {
            loadPageScript(initialPage);
            loadPageStylesheet(initialPage);
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
    $(window).on('unload', function () {
        if (clockInterval) {
            clearInterval(clockInterval);
        }
        if (currentScript) {
            currentScript.remove();
        }
        if (currentStylesheet) {
            currentStylesheet.remove();
        }
    });
});

// Example for exam-creator.js
(function () {
    // Initialize only if we're on the exam creator page
    if (!$('#examCreatorPage').hasClass('active')) return;

    let questionCount = 0;

    // Your existing exam creator code...
})();
