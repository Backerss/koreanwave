$(document).ready(function() {
    let loadingState = false;

    // Initialize page - load user data including avatar
    initializeProfile();

    // Avatar Upload Handler
    $('#avatarUpload').change(function(e) {

        if (loadingState) {
            showToast('error', 'ยังไม่เปิดให้อัพโหลดรูปในขณะนี้ กรุณาติดต่อผู้พัฒนาระบบ');
            return;
        }

        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            const file = e.target.files[0];
            
            // Validate file type
            if (!file.type.match('image.*')) {
                showToast('error', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showToast('error', 'ขนาดไฟล์ต้องไม่เกิน 5MB');
                return;
            }

            reader.onload = function(e) {
                $('#profileAvatar').attr('src', e.target.result);
            }
            
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('avatar', file);

            uploadAvatar(formData);
        }
    });

    // Personal Info Form Handler
    $('#personalInfoForm').submit(function(e) {
        e.preventDefault();
        if (loadingState) return;

        const formData = {
            firstName: $('input[name="firstName"]').val().trim(),
            lastName: $('input[name="lastName"]').val().trim(),
            email: $('input[name="email"]').val().trim(),
            phone: $('input[name="phone"]').val().trim()
        };

        // Validation
        if (!validatePersonalInfo(formData)) return;

        updatePersonalInfo(formData);
    });

    // Password Change Form Handler
    $('#passwordForm').submit(function(e) {
        e.preventDefault();
        if (loadingState) return;

        const passwordData = {
            currentPassword: $('input[name="current_password"]').val(),
            newPassword: $('input[name="new_password"]').val(),
            confirmPassword: $('input[name="confirm_password"]').val()
        };

        if (!validatePasswordChange(passwordData)) {
            return;
        }

        const formData = new FormData();
        formData.append('action', 'updatePassword');
        formData.append('current_password', passwordData.currentPassword);
        formData.append('new_password', passwordData.newPassword);
        formData.append('confirm_password', passwordData.confirmPassword);

        loadingState = true;
        showLoading('กำลังเปลี่ยนรหัสผ่าน...');

        $.ajax({
            url: '../../system/updateProfile.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                try {
                    // ตรวจสอบว่า response เป็น string หรือไม่
                    const result = typeof response === 'string' ? JSON.parse(response) : response;
                    
                    if (result.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'สำเร็จ',
                            text: 'เปลี่ยนรหัสผ่านเรียบร้อย'
                        });
                        $('#passwordForm')[0].reset();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'ผิดพลาด',
                            text: result.message || 'เกิดข้อผิดพลาด'
                        });
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                    Swal.fire({
                        icon: 'error',
                        title: 'ผิดพลาด',
                        text: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล'
                    });
                }
            },
            error: function(xhr) {
                let message = 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
                try {
                    const response = xhr.responseJSON || JSON.parse(xhr.responseText);
                    message = response.message || message;
                } catch(e) {
                    console.error('Error parsing response:', e);
                }
                Swal.fire({
                    icon: 'error',
                    title: 'ผิดพลาด',
                    text: message
                });
            },
            complete: function() {
                loadingState = false;
                hideLoading();
            }
        });
    });

    // Notification Settings Form Handler
    $('#notificationForm').submit(function(e) {
        e.preventDefault();
        if (loadingState) return;

        const settings = {
            emailNotifications: $('#emailNotif').is(':checked'),
            smsNotifications: $('#smsNotif').is(':checked')
        };

        updateNotificationSettings(settings);
    });

    // Validation Functions
    function validatePersonalInfo(data) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showToast('error', 'รูปแบบอีเมลไม่ถูกต้อง');
            return false;
        }

        // Phone validation (Thai format)
        const phoneRegex = /^0[0-9]{8,9}$/;
        if (!phoneRegex.test(data.phone.replace(/[-\s]/g, ''))) {
            showToast('error', 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
            return false;
        }

        return true;
    }

    function validatePasswordChange(data) {
        if (!data.newPassword || data.newPassword.length < 8) {
            Swal.fire('ผิดพลาด', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'error');
            return false;
        }

        if (!data.confirmPassword || data.newPassword !== data.confirmPassword) {
            Swal.fire('ผิดพลาด', 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
            return false;
        }

        if (!data.currentPassword) {
            Swal.fire('ผิดพลาด', 'กรุณากรอกรหัสผ่านปัจจุบัน', 'error');
            return false;
        }

        return true;
    }

    // API Calls
    async function uploadAvatar(formData) {
        try {
            loadingState = true;
            showLoading('กำลังอัพโหลดรูปภาพ...');

            // Add the action parameter for the API
            formData.append('action', 'updateAvatar');
            
            // Make the actual AJAX call to the server
            $.ajax({
                url: '../../system/updateProfile.php',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        // Update the avatar image in the UI
                        if (response.avatar_url) {
                            $('#profileAvatar').attr('src', '../../' + response.avatar_url);
                        }
                        showToast('success', 'อัพโหลดรูปโปรไฟล์สำเร็จ');
                    } else {
                        showToast('error', response.message || 'เกิดข้อผิดพลาดในการอัพโหลด');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error uploading avatar:', error);
                    let errorMessage = 'เกิดข้อผิดพลาดในการอัพโหลด';
                    
                    try {
                        const response = xhr.responseJSON || JSON.parse(xhr.responseText);
                        errorMessage = response.message || errorMessage;
                    } catch(e) {
                        console.error('Error parsing response:', e);
                    }
                    
                    showToast('error', errorMessage);
                },
                complete: function() {
                    loadingState = false;
                    hideLoading();
                }
            });
        } catch (error) {
            console.error('Avatar upload error:', error);
            showToast('error', 'เกิดข้อผิดพลาดในการอัพโหลด');
            loadingState = false;
            hideLoading();
        }
    }

    async function updatePersonalInfo(data) {
        try {
            loadingState = true;
            showLoading('กำลังบันทึกข้อมูล...');

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showToast('success', 'บันทึกข้อมูลส่วนตัวสำเร็จ');
        } catch (error) {
            showToast('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            loadingState = false;
            hideLoading();
        }
    }

    async function updatePassword(data) {
        try {
            loadingState = true;
            showLoading('กำลังเปลี่ยนรหัสผ่าน...');

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showToast('success', 'เปลี่ยนรหัสผ่านสำเร็จ');
            $('#passwordForm')[0].reset();
        } catch (error) {
            showToast('error', 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        } finally {
            loadingState = false;
            hideLoading();
        }
    }

    async function updateNotificationSettings(settings) {
        try {
            loadingState = true;
            showLoading('กำลังบันทึกการตั้งค่า...');

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showToast('success', 'บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ');
        } catch (error) {
            showToast('error', 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
        } finally {
            loadingState = false;
            hideLoading();
        }
    }

    // UI Helper Functions
    function showToast(icon, text) {
        Swal.fire({
            icon: icon,
            text: text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    function showLoading(text) {
        Swal.fire({
            title: text,
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });
    }

    function hideLoading() {
        Swal.close();
    }

    // Real-time Form Validation
    $('input[name="email"]').on('input', function() {
        const email = $(this).val().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    $('input[name="phone"]').on('input', function() {
        const phone = $(this).val().replace(/[-\s]/g, '');
        const phoneRegex = /^0[0-9]{8,9}$/;
        
        if (phone && !phoneRegex.test(phone)) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    // Password Strength Meter
    $('input[name="newPassword"]').on('input', function() {
        const password = $(this).val();
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthUI(strength);
    });

    function calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/)) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        
        return strength;
    }

    function updatePasswordStrengthUI(strength) {
        const meter = $('.password-strength-meter');
        let strengthText = '';
        let strengthClass = '';

        if (strength <= 25) {
            strengthText = 'อ่อน';
            strengthClass = 'bg-danger';
        } else if (strength <= 50) {
            strengthText = 'ปานกลาง';
            strengthClass = 'bg-warning';
        } else if (strength <= 75) {
            strengthText = 'ดี';
            strengthClass = 'bg-info';
        } else {
            strengthText = 'แข็งแรงมาก';
            strengthClass = 'bg-success';
        }

        meter.find('.progress-bar')
            .removeClass('bg-danger bg-warning bg-info bg-success')
            .addClass(strengthClass)
            .css('width', strength + '%')
            .attr('aria-valuenow', strength);
        
        meter.find('.strength-text').text(strengthText);
    }

    // Initialize Tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Handle Tab Navigation with URL Hash
    function handleTabNavigation() {
        const hash = window.location.hash;
        if (hash) {
            const tab = $(`#profileTabs a[href="${hash}"]`);
            if (tab.length) {
                tab.tab('show');
            }
        }
    }

    // Update URL Hash on Tab Change
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
        window.location.hash = e.target.hash;
    });

    // Initial Tab Navigation
    handleTabNavigation();

    // Initialize profile page
    function initializeProfile() {
        // Check if we already have the avatar URL from PHP
        const profileAvatar = $('#profileAvatar');
        if (profileAvatar.attr('src') && profileAvatar.attr('src') !== 'https://placehold.co/150') {
            // Avatar already set via PHP, no need to fetch
            return;
        }

        // Use the updateProfile.php endpoint with a GET method instead
        $.ajax({
            url: '../../system/updateProfile.php',
            type: 'GET',
            data: { action: 'getProfileData' },
            dataType: 'json',
            success: function(response) {
                if (response.success && response.data) {
                    // First check avatar_url, then profile_img (based on your DB structure)
                    const avatarPath = response.data.avatar_url || response.data.profile_img;
                    if (avatarPath) {
                        // Check if path already starts with uploads/ or includes ../
                        if (avatarPath.startsWith('uploads/') || avatarPath.includes('../')) {
                            $('#profileAvatar').attr('src', '../../' + avatarPath);
                        } else {
                            $('#profileAvatar').attr('src', avatarPath);
                        }
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Profile data load error:', status, error);
                // Check if we can parse the error response
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    console.error('Error details:', errorData);
                } catch (e) {
                    // If not JSON, log the raw response
                    console.error('Raw response:', xhr.responseText.substring(0, 100) + '...');
                }
            }
        });
    }
});