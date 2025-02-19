$(document).ready(function () {
    // Enable strict mode for better error catching
    'use strict';

    // Initialize error logging
    const Logger = {
        error: (context, error) => {
            //console.error(`[${new Date().toISOString()}] ${context}:`, error);
            // You could also send to server or external logging service
        },
        info: (context, message) => {
            //console.info(`[${new Date().toISOString()}] ${context}:`, message);
        }
    };

    // Page Manager Configuration
    const PageManager = {
        loadedScripts: new Map(),
        currentPage: null,
        currentStylesheet: null,
        scriptMap: {
            'profile': '../../js/profile.js',
            'courses': '../../js/courese.js',
            'examCreator': '../../js/exam-creator.js',
            'attendance': '../../js/lesson.js',
            'users': '../../js/userManagementPage.js',
            'fallow': '../../js/fallowPage.js',
            'logs': '../../js/logsPage.js'
        },
        styleMap: {
            'profile': '../../css/profile.css',
            'users': '../../css/userManagement.css',
            'grades': '../../css/gradesPage.css',
            'lesson': '../../css/lessonpage.css',
            'exam': '../../css/exam.css',
            'courses': '../../css/couresePage.css',
            'dashboard': '../../css/dashbord.css',
            'fallow': '../../css/fallowPage.css',
            'logs': '../../css/logsPage.css'
        }
    };

    // Resource Loading Functions
    const ResourceLoader = {
        loadScript: async (pageName) => {
            try {
                const scriptPath = PageManager.scriptMap[pageName];
                if (!scriptPath) return Promise.resolve();

                // Remove all existing scripts from previous loads
                PageManager.loadedScripts.forEach((script, path) => {
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                        Logger.info('Script Cleanup', `Removed script: ${path}`);
                    }
                });
                PageManager.loadedScripts.clear();

                // Create and load new script with cache busting
                const script = document.createElement('script');
                script.src = `${scriptPath}?v=${Date.now()}`;
                script.type = 'text/javascript';

                const loadPromise = new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = () => reject(new Error(`Failed to load ${scriptPath}`));
                });

                document.body.appendChild(script);
                PageManager.loadedScripts.set(scriptPath, script);
                await loadPromise;

                Logger.info('Script Loader', `Successfully loaded ${scriptPath}`);
            } catch (error) {
                Logger.error('Script Loader', error);
                throw error;
            }
        },

        loadStylesheet: (pageName) => {
            try {
                // Remove existing stylesheet
                if (PageManager.currentStylesheet) {
                    PageManager.currentStylesheet.remove();
                    PageManager.currentStylesheet = null;
                }

                const stylePath = PageManager.styleMap[pageName];
                if (!stylePath) return;

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = `${stylePath}?v=${Date.now()}`;
                
                document.head.appendChild(link);
                PageManager.currentStylesheet = link;

                Logger.info('Style Loader', `Successfully loaded ${stylePath}`);
            } catch (error) {
                Logger.error('Style Loader', error);
                throw error;
            }
        }
    };

    // UI Management Functions
    const UIManager = {
        toggleInteraction: (disable = true) => {
            try {
                $('.sidebar-menu li').toggleClass('disabled', disable);
                $('.notification-bell')
                    .toggleClass('disabled', disable)
                    .css('pointer-events', disable ? 'none' : 'auto');
                $('.user-profile .dropdown-toggle').prop('disabled', disable);
                $('#sidebarToggle').prop('disabled', disable);
            } catch (error) {
                Logger.error('UI Toggle', error);
            }
        },

        showLoadingOverlay: () => {
            return new Promise(resolve => {
                const overlay = $(`
                    <div class="page-loading-overlay">
                        <div class="loading-spinner">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">กำลังโหลด...</span>
                            </div>
                            <div class="mt-2 text-primary">กำลังโหลด...</div>
                        </div>
                    </div>
                `).appendTo('body');

                overlay.fadeIn(300);
                setTimeout(() => {
                    overlay.fadeOut(300, function() {
                        $(this).remove();
                        resolve();
                    });
                }, 800);
            });
        },

        showError: (title, message) => {
            Swal.fire({
                icon: 'error',
                title: title,
                text: message,
                confirmButtonText: 'ตกลง'
            });
        }
    };

    // Navigation Handler
    const NavigationHandler = {
        async navigate($element, targetPage) {
            try {
                UIManager.toggleInteraction(true);
                localStorage.setItem('currentPage', targetPage);

                // Cleanup current page
                if (PageManager.currentPage) {
                    // ทำความสะอาด DataTables ทั้งหมดในหน้าปัจจุบัน
                    $('table.dataTable').each(function() {
                        if ($.fn.DataTable.isDataTable(this)) {
                            try {
                                $(this).DataTable().destroy();
                            } catch (e) {
                                console.warn('DataTable destroy warning:', e);
                            }
                        }
                    });

                    const currentScript = PageManager.scriptMap[PageManager.currentPage];
                    if (currentScript) {
                        const script = PageManager.loadedScripts.get(currentScript);
                        if (script && script.parentNode) {
                            script.parentNode.removeChild(script);
                        }
                        PageManager.loadedScripts.delete(currentScript);
                    }
                }

                // Update UI
                $('.sidebar-menu li').removeClass('active');
                $element.addClass('active');
                $('#currentPage').text($element.find('span').text() || '');

                // Handle page transition
                $('.page').fadeOut(300).removeClass('active');
                const $targetPage = $(`#${targetPage}Page`);
                $targetPage.hide().addClass('active');

                // Load resources
                await Promise.all([
                    ResourceLoader.loadScript(targetPage),
                    ResourceLoader.loadStylesheet(targetPage),
                    UIManager.showLoadingOverlay()
                ]);

                $targetPage.fadeIn(300);
                PageManager.currentPage = targetPage;
                $(document).trigger('pageChanged', [targetPage + 'Page']);

            } catch (error) {
                Logger.error('Navigation', error);
                UIManager.showError('นำทางไม่สำเร็จ', 'ไม่สามารถโหลดหน้าที่ต้องการได้');
            } finally {
                setTimeout(() => UIManager.toggleInteraction(false), 300);
            }
        }
    };

    // Event Handlers
    const initializeEventHandlers = () => {
        // Sidebar toggle
        $('#sidebarToggle').on('click', () => {
            $('.sidebar').toggleClass('active');
            $('.main-content').toggleClass('sidebar-hidden');
        });

        // Page navigation
        $('.sidebar-menu li').on('click', async function(e) {
            try {
                const targetPage = $(this).data('page');
                if (!targetPage) return;

                if ($('#lessonPage').hasClass('active')) {
                    e.preventDefault();
                    const result = await Swal.fire({
                        title: 'ออกจากบทเรียน?',
                        text: 'คุณกำลังอยู่ในบทเรียน ต้องการออกจากบทเรียนใช่หรือไม่?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'ใช่',
                        cancelButtonText: 'ไม่',
                        confirmButtonColor: '#dc3545'
                    });

                    if (result.isConfirmed) {
                        await NavigationHandler.navigate($(this), targetPage);
                    }
                } else {
                    await NavigationHandler.navigate($(this), targetPage);
                }
            } catch (error) {
                Logger.error('Navigation Click', error);
            }
        });

        // Initialize cleanup handlers
        $(window).on('beforeunload', cleanup);
        $(window).on('pagehide', cleanup);
    };

    // Cleanup function
    const cleanup = () => {
        try {
            if (window.clockInterval) {
                clearInterval(window.clockInterval);
            }

            PageManager.loadedScripts.forEach((script, path) => {
                if (script && script.parentNode) {
                    const clone = script.cloneNode(true);
                    script.parentNode.replaceChild(clone, script);
                    clone.remove();
                }
            });
            PageManager.loadedScripts.clear();

            if (PageManager.currentStylesheet?.parentNode) {
                PageManager.currentStylesheet.remove();
                PageManager.currentStylesheet = null;
            }

            Logger.info('Cleanup', 'Successfully cleaned up resources');
        } catch (error) {
            Logger.error('Cleanup', error);
        }
    };

    // Initialize application
    try {
        initializeEventHandlers();
        
        // Load initial page
        const initialPage = $('.sidebar-menu li.active').data('page');
        if (initialPage) {
            ResourceLoader.loadScript(initialPage);
            ResourceLoader.loadStylesheet(initialPage);
        }

        // Restore saved page
        const savedPage = localStorage.getItem('currentPage');
        if (savedPage) {
            const $menuItem = $(`.sidebar-menu li[data-page="${savedPage}"]`);
            if ($menuItem.length) {
                setTimeout(() => {
                    NavigationHandler.navigate($menuItem, savedPage);
                }, 300);
            }
        }

        Logger.info('Initialization', 'Application successfully initialized');
    } catch (error) {
        Logger.error('Initialization', error);
        UIManager.showError('เริ่มต้นระบบไม่สำเร็จ', 'เกิดข้อผิดพลาดในการโหลดแอปพลิเคชัน');
    }
});