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
            'users': '../../js/userManagementPage.js',
            'fallow': '../../js/fallowPage.js',
            'logs': '../../js/logsPage.js',
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

            // Remove existing script if it exists
            const existingScript = scriptManager.loadedScripts.get(scriptPath);
            if (existingScript) {
                existingScript.remove();
                scriptManager.loadedScripts.delete(scriptPath);
            }

            // Create and load new script
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                // Add timestamp to force browser to load new version
                script.src = `${scriptPath}?v=${Date.now()}`;
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
                'exam': '../../css/exam.css',
                'courses': '../../css/couresePage.css',
                'dashboard': '../../css/dashbord.css',
                'fallow': '../../css/fallowPage.css',
                'logs': '../../css/logsPage.css',
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

        // เพิ่มฟังก์ชันสำหรับ toggle การใช้งาน UI
        function toggleUIInteraction(disable = true) {
            // Disable/Enable sidebar menu items
            $('.sidebar-menu li').toggleClass('disabled', disable);
            
            // Disable/Enable notification bell
            $('.notification-bell').toggleClass('disabled', disable).css('pointer-events', disable ? 'none' : 'auto');
            
            // Disable/Enable user profile dropdown
            $('.user-profile .dropdown-toggle').prop('disabled', disable);
            
            // Disable/Enable sidebar toggle
            $('#sidebarToggle').prop('disabled', disable);
        }

        // ปรับปรุงฟังก์ชัน navigateToPage
        function navigateToPage($element, targetPage) {
            try {
                // ปิดการใช้งาน UI ทั้งหมดก่อนเริ่มโหลด
                toggleUIInteraction(true);
                
                localStorage.setItem('currentPage', targetPage);

                if (scriptManager.currentPage) {
                    if (scriptManager.currentPage === 'users' && $.fn.DataTable.isDataTable('#usersTable')) {
                        $('#usersTable').DataTable().destroy();
                    }
                    unloadPageScript(scriptManager.currentPage);
                }

                // อัพเดท UI ก่อน
                $('.sidebar-menu li').removeClass('active');
                $element.addClass('active');
                $('#currentPage').text($element.find('span').text() || '');

                // ซ่อนหน้าเก่า
                $('.page').fadeOut(300).removeClass('active');

                // โหลดทรัพยากรและแสดงหน้าใหม่
                const $targetPage = $(`#${targetPage}Page`);
                $targetPage.hide().addClass('active');

                // รอให้ทรัพยากรโหลดเสร็จ
                Promise.all([
                    loadPageScript(targetPage),
                    loadPageStylesheet(targetPage),
                    new Promise(resolve => setTimeout(resolve, 300)) // รอให้การเปลี่ยนหน้าเสร็จสมบูรณ์
                ]).then(() => {
                    // แสดงหน้าใหม่ด้วย fade effect
                    $targetPage.fadeIn(300);
                    scriptManager.currentPage = targetPage;
                    $(document).trigger('pageChanged', [targetPage + 'Page']);
                }).catch(error => {
                    console.error('Error loading page resources:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: 'ไม่สามารถโหลดทรัพยากรของหน้าได้'
                    });
                }).finally(() => {
                    // เปิดการใช้งาน UI อีกครั้งหลังจากโหลดเสร็จ
                    setTimeout(() => {
                        toggleUIInteraction(false);
                    }, 300);
                });

            } catch (err) {
                console.error('Navigation error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถนำทางไปยังหน้าที่ต้องการได้'
                });
                // กรณีเกิด error ให้เปิดการใช้งาน UI
                toggleUIInteraction(false);
            }
        }

        // ปรับปรุงฟังก์ชัน showPageLoadingAnimation
        function showPageLoadingAnimation() {
            const loadingOverlay = `
                <div class="page-loading-overlay" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;">
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                            <span class="visually-hidden">กำลังโหลด...</span>
                        </div>
                        <div class="mt-2 text-primary">กำลังโหลด...</div>
                    </div>
                </div>
            `;
            
            // เพิ่ม loading overlay
            const $overlay = $(loadingOverlay).appendTo('body').hide();
            $overlay.fadeIn(300);
            
            // คืนค่า Promise
            return new Promise(resolve => {
                setTimeout(() => {
                    $overlay.fadeOut(300, function() {
                        $(this).remove();
                        resolve();
                    });
                }, 800); // ลดเวลา loading ลงเล็กน้อย
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

        // โหลดหน้าที่บันทึกไว้หลังรีเฟรช
        const savedPage = localStorage.getItem('currentPage');
        if (savedPage) {
            const $menuItem = $(`.sidebar-menu li[data-page="${savedPage}"]`);
            if ($menuItem.length) {
                // รอให้ initial loading แสดงผลก่อน
                setTimeout(() => {
                    navigateToPage($menuItem, savedPage);
                }, 300);
            }
        }

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
                        // ล้างค่า localStorage ก่อนออกจากระบบ
                        localStorage.removeItem('currentPage');
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
    $(window).on('beforeunload', function() {
        try {
            // Stop clock interval if exists
            if (typeof clockInterval !== 'undefined' && clockInterval) {
                clearInterval(clockInterval);
            }

            // Clean up scripts safely
            if (scriptManager && scriptManager.loadedScripts) {
                scriptManager.loadedScripts.forEach((script, path) => {
                    if (script && script.parentNode) {
                        // Remove event listeners
                        const clone = script.cloneNode(true);
                        script.parentNode.replaceChild(clone, script);
                        clone.remove();
                        console.log('Removed script:', path);
                    }
                });
                scriptManager.loadedScripts.clear();
            }

            // Clean up stylesheet safely
            if (currentStylesheet && currentStylesheet.parentNode) {
                currentStylesheet.remove();
                currentStylesheet = null;
                console.log('Removed stylesheet');
            }

            // Allow time for cleanup
            return new Promise(resolve => {
                setTimeout(resolve, 100);
            });

        } catch (err) {
            console.error('Cleanup error:', err);
        }
    });

    // Backup cleanup on page hide
    $(window).on('pagehide', function() {
        if (typeof clockInterval !== 'undefined') {
            clearInterval(clockInterval);
        }
    });
})