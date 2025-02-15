<?php
// ดึงข้อมูลผู้ใช้และสถิติการเรียน
$userId = $_SESSION['user_data']['id'];
$userQuery = $db->prepare("
    SELECT 
        u.*,
        COALESCE(AVG(er.score), 0) as avg_grade,
        COUNT(DISTINCT lp.lesson_id) as lessons_accessed,
        SUM(DISTINCT lp.time_spent) as total_time_spent,
        (SELECT COUNT(*) FROM lessons) as total_lessons,
        (
            SELECT GROUP_CONCAT(DISTINCT l.title)
            FROM learning_progress lp2 
            JOIN lessons l ON lp2.lesson_id = l.id
            WHERE lp2.user_id = u.id AND lp2.completed = 0
            LIMIT 3
        ) as ongoing_lessons
    FROM users u
    LEFT JOIN learning_progress lp ON u.id = lp.user_id
    LEFT JOIN exam_results er ON u.id = er.user_id
    WHERE u.id = ?
    GROUP BY u.id
");
$userQuery->execute([$userId]);
$userData = $userQuery->fetch(PDO::FETCH_ASSOC);

if (!$userData) {
    // Handle error if user data not found
    die("ไม่พบข้อมูลผู้ใช้");
}

// คำนวณเวลาเรียนในรูปแบบที่อ่านง่าย
$totalMinutes = (int)$userData['total_time_spent'];
$hours = floor($totalMinutes / 60);
$minutes = $totalMinutes % 60;
$timeSpent = $hours > 0 ? "{$hours} ชั่วโมง {$minutes} นาที" : "{$minutes} นาที";

// คำนวณความก้าวหน้า
$progressPercentage = ($userData['lessons_accessed'] / max($userData['total_lessons'], 1)) * 100;
?>

<div class="page" id="profilePage">
    <link rel="stylesheet" href="../../css/profile.css">
    <div class="container-fluid">
        <div class="row">
            <!-- Profile Left Side -->
            <div class="col-md-4">
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar-wrapper">
                            <img src="<?php echo $userData['avatar_url'] ?? 'https://placehold.co/150'; ?>" 
                                 alt="Profile" 
                                 id="profileAvatar">
                            <div class="avatar-edit">
                                <label for="avatarUpload">
                                    <i class="fas fa-camera"></i>
                                </label>
                                <input type="file" id="avatarUpload" accept="image/*" hidden>
                            </div>
                        </div>
                        <h4 class="profile-name"><?php echo htmlspecialchars($userData['first_name'] . ' ' . $userData['last_name']); ?></h4>
                        <p class="profile-role">
                            <?php 
                            echo $userData['role'] == 'student' 
                                ? "นักเรียน ม.{$userData['grade_level']}/{$userData['classroom']}" 
                                : ($userData['role'] == 'teacher' ? 'ครู' : 'ผู้ดูแลระบบ'); 
                            ?>
                        </p>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <i class="fas fa-book-reader"></i>
                            <div class="stat-details">
                                <h5>เกรดเฉลี่ย</h5>
                                <span><?php echo number_format($userData['avg_grade'], 2); ?></span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <div class="stat-details">
                                <h5>เวลาเรียน</h5>
                                <span><?php echo $timeSpent; ?></span>
                            </div>
                        </div>
                    </div>
                    <div class="profile-info">
                        <div class="info-item">
                            <i class="fas fa-id-card"></i>
                            <span>รหัสนักเรียน: <?php echo htmlspecialchars($userData['student_id'] ?? '-'); ?></span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <span><?php echo htmlspecialchars($userData['email'] ?? '-'); ?></span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-venus-mars"></i>
                            <span>เพศ: <?php 
                                $genders = ['male' => 'ชาย', 'female' => 'หญิง', 'other' => 'อื่นๆ'];
                                echo $genders[$userData['gender'] ?? ''] ?? 'ไม่ระบุ'; 
                            ?></span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-users"></i>
                            <span>ชุมนุม: <?php echo htmlspecialchars($userData['club'] ?? 'ไม่ระบุ'); ?></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Right Side -->
            <div class="col-md-8">
                <div class="profile-content">
                    <ul class="nav nav-tabs" id="profileTabs" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" data-bs-toggle="tab" href="#personalInfo">
                                <i class="fas fa-user-edit"></i> ข้อมูลส่วนตัว
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#security">
                                <i class="fas fa-shield-alt"></i> ความปลอดภัย
                            </a>
                        </li>
                    </ul>

                    <div class="tab-content" id="profileTabContent">
                        <!-- Personal Info Tab -->
                        <div class="tab-pane fade show active" id="personalInfo">
                            <div class="profile-form">
                                <h5>แก้ไขข้อมูลส่วนตัว</h5>
                                <form id="personalInfoForm">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>ชื่อ</label>
                                                <input type="text" class="form-control" name="first_name" 
                                                       value="<?php echo htmlspecialchars($userData['first_name']); ?>" disabled>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>นามสกุล</label>
                                                <input type="text" class="form-control" name="last_name" 
                                                       value="<?php echo htmlspecialchars($userData['last_name']); ?>" disabled>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>อีเมล</label>
                                                <input type="email" class="form-control" name="email" 
                                                       value="<?php echo htmlspecialchars($userData['email']); ?>" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>เพศ</label>
                                                <select class="form-select" name="gender" required>
                                                    <option value="male" <?php echo $userData['gender'] === 'male' ? 'selected' : ''; ?>>ชาย</option>
                                                    <option value="female" <?php echo $userData['gender'] === 'female' ? 'selected' : ''; ?>>หญิง</option>
                                                    <option value="other" <?php echo $userData['gender'] === 'other' ? 'selected' : ''; ?>>อื่นๆ</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>ชุมนุม</label>
                                                <select class="form-select" name="club" required>
                                                    <option value="">เลือกชุมนุม</option>
                                                    <?php
                                                    $clubQuery = $db->query("SELECT * FROM clubs ORDER BY name");
                                                    while ($club = $clubQuery->fetch()) {
                                                        $selected = $userData['club'] === $club['name'] ? 'selected' : '';
                                                        echo "<option value='{$club['name']}' {$selected}>{$club['name']}</option>";
                                                    }
                                                    ?>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-12">
                                            <button type="submit" class="btn btn-primary">
                                                <i class="fas fa-save"></i> บันทึกข้อมูล
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Security Tab -->
                        <div class="tab-pane fade" id="security">
                            <div class="profile-form">
                                <h5>เปลี่ยนรหัสผ่าน</h5>
                                <form id="passwordForm">
                                    <div class="form-group">
                                        <label>รหัสผ่านปัจจุบัน</label>
                                        <input type="password" class="form-control" name="current_password" required>
                                    </div>
                                    <div class="form-group">
                                        <label>รหัสผ่านใหม่</label>
                                        <input type="password" class="form-control" name="new_password" required>
                                    </div>
                                    <div class="form-group">
                                        <label>ยืนยันรหัสผ่านใหม่</label>
                                        <input type="password" class="form-control" name="confirm_password" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-key"></i> เปลี่ยนรหัสผ่าน
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Utility Functions
    const showLoading = (message = 'กำลังดำเนินการ...') => {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    };

    const handleResponse = async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'เกิดข้อผิดพลาด');
        return result;
    };

    // File Upload Validation
    const validateFile = (file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error('รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF)');
        }
        if (file.size > maxSize) {
            throw new Error('ขนาดไฟล์ต้องไม่เกิน 5MB');
        }
    };

    // Avatar Upload Handler
    const avatarUpload = document.getElementById('avatarUpload');
    const profileAvatar = document.getElementById('profileAvatar');

    avatarUpload?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            validateFile(file);
            showLoading('กำลังอัพโหลดรูปภาพ...');

            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('action', 'updateAvatar');

            const response = await fetch('../../system/updateProfile.php', {
                method: 'POST',
                body: formData
            });
            const result = await handleResponse(response);

            profileAvatar.src = result.avatar_url;
            Swal.fire('สำเร็จ', 'อัพโหลดรูปโปรไฟล์เรียบร้อย', 'success');
        } catch (error) {
            Swal.fire('ผิดพลาด', error.message, 'error');
            avatarUpload.value = ''; // Clear the file input
        }
    });

    // Personal Info Form Handler
    const personalInfoForm = document.getElementById('personalInfoForm');
    personalInfoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            showLoading('กำลังบันทึกข้อมูล...');
            const formData = new FormData(e.target);
            formData.append('action', 'updatePersonalInfo');

            const response = await fetch('../../system/updateProfile.php', {
                method: 'POST',
                body: formData
            });
            await handleResponse(response);

            Swal.fire('สำเร็จ', 'บันทึกข้อมูลส่วนตัวเรียบร้อย', 'success');
            // Refresh user info display
            document.querySelector('.profile-name').textContent = 
                `${formData.get('first_name')} ${formData.get('last_name')}`;
        } catch (error) {
            Swal.fire('ผิดพลาด', error.message, 'error');
        }
    });

    // Password Form Handler
    const passwordForm = document.getElementById('passwordForm');
    passwordForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        if (formData.get('new_password') !== formData.get('confirm_password')) {
            Swal.fire('ผิดพลาด', 'รหัสผ่านใหม่ไม่ตรงกัน', 'error');
            return;
        }

        try {
            showLoading('กำลังเปลี่ยนรหัสผ่าน...');
            formData.append('action', 'updatePassword');

            const response = await fetch('../../system/updateProfile.php', {
                method: 'POST',
                body: formData
            });
            await handleResponse(response);

            e.target.reset();
            Swal.fire('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อย', 'success');
        } catch (error) {
            Swal.fire('ผิดพลาด', error.message, 'error');
        }
    });

    // Add input validation
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    });

    // Add password strength meter
    const passwordInput = document.querySelector('input[name="new_password"]');
    if (passwordInput) {
        const strengthMeter = document.createElement('div');
        strengthMeter.className = 'password-strength-meter mt-2';
        passwordInput.parentElement.appendChild(strengthMeter);

        passwordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            updatePasswordStrengthUI(strength, strengthMeter);
        });
    }
});

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
}

function updatePasswordStrengthUI(strength, meterElement) {
    const strengthText = ['อ่อนมาก', 'อ่อน', 'ปานกลาง', 'แข็งแรง', 'แข็งแรงมาก'];
    const strengthClass = ['very-weak', 'weak', 'medium', 'strong', 'very-strong'];
    
    meterElement.className = 'password-strength-meter mt-2 ' + strengthClass[strength - 1];
    meterElement.textContent = 'ความแข็งแรงของรหัสผ่าน: ' + strengthText[strength - 1];
}
</script>