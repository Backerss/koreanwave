<div class="page" id="profilePage">
    <link rel="stylesheet" href="../../css/profile.css">
    <div class="container-fluid">
        <div class="row">
            <!-- Profile Left Side -->
            <div class="col-md-4">
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar-wrapper">
                            <img src="https://placehold.co/150" alt="Profile" id="profileAvatar">
                            <div class="avatar-edit">
                                <label for="avatarUpload">
                                    <i class="fas fa-camera"></i>
                                </label>
                                <input type="file" id="avatarUpload" accept="image/*" hidden>
                            </div>
                        </div>
                        <h4 class="profile-name">Backerss</h4>
                        <p class="profile-role">นักเรียน ม.6/1</p>
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <i class="fas fa-book-reader"></i>
                            <div class="stat-details">
                                <h5>เกรดเฉลี่ย</h5>
                                <span>3.75</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-clock"></i>
                            <div class="stat-details">
                                <h5>เวลาเรียน</h5>
                                <span>95%</span>
                            </div>
                        </div>
                    </div>
                    <div class="profile-info">
                        <div class="info-item">
                            <i class="fas fa-id-card"></i>
                            <span>รหัสนักเรียน: 12345</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <span>email@example.com</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <span>088-888-8888</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Right Side -->
            <div class="col-md-8">
                <div class="profile-content">
                    <!-- Profile Navigation -->
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
                        <li class="nav-item">
                            <a class="nav-link" data-bs-toggle="tab" href="#notifications">
                                <i class="fas fa-bell"></i> การแจ้งเตือน
                            </a>
                        </li>
                    </ul>

                    <!-- Tab Content -->
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
                                                <input type="text" class="form-control" name="firstName" value="John">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>นามสกุล</label>
                                                <input type="text" class="form-control" name="lastName" value="Doe">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>อีเมล</label>
                                                <input type="email" class="form-control" name="email"
                                                    value="email@example.com">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>เบอร์โทรศัพท์</label>
                                                <input type="tel" class="form-control" name="phone"
                                                    value="088-888-8888">
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
                                        <input type="password" class="form-control" name="currentPassword">
                                    </div>
                                    <div class="form-group">
                                        <label>รหัสผ่านใหม่</label>
                                        <input type="password" class="form-control" name="newPassword">
                                    </div>
                                    <div class="form-group">
                                        <label>ยืนยันรหัสผ่านใหม่</label>
                                        <input type="password" class="form-control" name="confirmPassword">
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-key"></i> เปลี่ยนรหัสผ่าน
                                    </button>
                                </form>
                            </div>
                        </div>

                        <!-- Notifications Tab -->
                        <div class="tab-pane fade" id="notifications">
                            <div class="profile-form">
                                <h5>ตั้งค่าการแจ้งเตือน</h5>
                                <form id="notificationForm">
                                    <div class="notification-settings">
                                        <div class="notification-item">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="emailNotif" checked>
                                                <label class="form-check-label" for="emailNotif">
                                                    แจ้งเตือนทางอีเมล
                                                </label>
                                            </div>
                                            <p class="text-muted">รับการแจ้งเตือนเกี่ยวกับการเรียนผ่านอีเมล
                                            </p>
                                        </div>
                                        <div class="notification-item">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="smsNotif">
                                                <label class="form-check-label" for="smsNotif">
                                                    แจ้งเตือนทาง SMS
                                                </label>
                                            </div>
                                            <p class="text-muted">รับการแจ้งเตือนเกี่ยวกับการเรียนผ่าน SMS
                                            </p>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i> บันทึกการตั้งค่า
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