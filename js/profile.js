$(document).ready(function() {
    // Avatar Upload Handler
    $('#avatarUpload').change(function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                $('#profileAvatar').attr('src', e.target.result);
            }
            
            reader.readAsDataURL(e.target.files[0]);

            // Here you would typically upload the file to your server
            const formData = new FormData();
            formData.append('avatar', e.target.files[0]);

            // Example API call
            // $.ajax({
            //     url: '/api/profile/avatar',
            //     type: 'POST',
            //     data: formData,
            //     processData: false,
            //     contentType: false,
            //     success: function(response) {
            //         showToast('success', 'อัพโหลดรูปโปรไฟล์สำเร็จ');
            //     },
            //     error: function() {
            //         showToast('error', 'เกิดข้อผิดพลาดในการอัพโหลด');
            //     }
            // });
        }
    });

    // Personal Info Form Handler
    $('#personalInfoForm').submit(function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: $('input[name="firstName"]').val(),
            lastName: $('input[name="lastName"]').val(),
            email: $('input[name="email"]').val(),
            phone: $('input[name="phone"]').val(),
            address: $('textarea[name="address"]').val()
        };
    });
});


$(document).ready(function() {
    let loadingState = false;

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

        const formData = {
            currentPassword: $('input[name="currentPassword"]').val(),
            newPassword: $('input[name="newPassword"]').val(),
            confirmPassword: $('input[name="confirmPassword"]').val()
        };

        // Validation
        if (!validatePasswordChange(formData)) return;

        updatePassword(formData);
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
        if (data.newPassword.length < 8) {
            showToast('error', 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
            return false;
        }

        if (data.newPassword !== data.confirmPassword) {
            showToast('error', 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
            return false;
        }

        return true;
    }

    // API Calls
    async function uploadAvatar(formData) {
        try {
            loadingState = true;
            showLoading('กำลังอัพโหลดรูปภาพ...');

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showToast('success', 'อัพโหลดรูปโปรไฟล์สำเร็จ');
        } catch (error) {
            showToast('error', 'เกิดข้อผิดพลาดในการอัพโหลด');
        } finally {
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
});