<?php
session_start();
require_once 'system/db.php';
$systemStats = require 'system/getStats.php';
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบจัดการการเรียนภาษาเกาหลี - โรงเรียนสตรีนครสวรรค์</title>
    <!-- เพิ่ม Meta tags สำหรับ SEO -->
    <meta name="description" content="ระบบจัดการการเรียนภาษาเกาหลีออนไลน์ โรงเรียนสตรีนครสวรรค์ พร้อมแบบทดสอบและบทเรียนมาตรฐาน">
    <meta name="keywords" content="เรียนภาษาเกาหลี, โรงเรียนสตรีนครสวรรค์, TOPIK, ภาษาเกาหลีออนไลน์">
    <!-- Prevent Caching -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <!-- Bootstrap 5.3 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Sarabun:wght@300;400;500;600&display=swap"
        rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/main.css?v=<?= time() ?>">
</head>

<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div class="container">
            <a class="navbar-brand" href="#">
                <img src="https://sns.electivecourses.net/data/img/logo.png" width="40" alt="โลโก้โรงเรียน" class="school-logo me-2">
                โรงเรียนสตรีนครสวรรค์
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">`
                    <li class="nav-item">
                        <a class="nav-link active" href="#home">หน้าแรก</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#courses">คอร์สเรียน</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#contact">ติดต่อ</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-warning ms-2" href="page/auth/login.html">เข้าสู่ระบบ</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero">
        <div class="hero-bg-overlay"></div>
        <div class="container position-relative">
            <div class="row align-items-center">
                <div class="col-lg-6 hero-content">
                    <h1 class="hero-title animation-fadeInUp">
                    บทเรียนภาษาเกาหลี<br>ออนไลน์
                    </h1>
                    <p class="hero-subtitle animation-fadeInUp animation-delay-1">
                        เพื่อพัฒนาทักษะภาษาเกาหลีของคุณกับระบบการเรียนการสอนที่ทันสมัย 
                        พร้อมด้วยบทเรียนมาตรฐานและการติดตามผลการเรียนรู้อย่างมีประสิทธิภาพ
                    </p>
                    <div class="hero-buttons animation-fadeInUp animation-delay-2">
                        <a href="page/objectives.php" class="btn btn-primary">
                            <i class="fas fa-info-circle me-2"></i>ดูรายละเอียด
                        </a>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="hero-image-container animation-fadeInRight">
                        <img src="https://placehold.co/600x400/1a237e/ffffff?text=Korean+Learning" 
                             alt="การเรียนภาษาเกาหลี" 
                             class="img-fluid hero-image">
                        <?php if ($systemStats['success']): ?>
                        <div class="stats-cards">
                            <div class="stat-card animation-fadeInUp animation-delay-3">
                                <h3><?= number_format($systemStats['stats']['students']) ?>+</h3>
                                <p>นักเรียน</p>
                            </div>
                            <div class="stat-card animation-fadeInUp animation-delay-4">
                                <h3><?= number_format($systemStats['stats']['lessons']) ?>+</h3>
                                <p>บทเรียน</p>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Announcement Section -->
    <section id="announcement" class="py-4 bg-warning">
        <div class="container">
            <div class="d-flex align-items-center justify-content-center">
                <i class="fas fa-bullhorn me-3"></i>
                <p class="mb-0"><strong>ประกาศ:</strong> เปิดรับสมัครคอร์สเรียนภาษาเกาหลีภาคเรียนที่ 1/2567 แล้ววันนี้!
                </p>
            </div>
        </div>
    </section>

    <!-- System Features -->
    <section id="features" class="py-5">
        <div class="container">
            <h2 class="text-center mb-5">ระบบการจัดการที่ครบครัน</h2>
            <div class="row g-4">
                <!-- ระบบจัดการผู้ใช้ -->
                <div class="col-md-4">
                    <div class="feature-card">
                        <i class="fas fa-users"></i>
                        <h3>ระบบจัดการผู้ใช้</h3>
                        <ul class="feature-list">
                            <li>จัดการข้อมูลนักเรียนและครู</li>
                            <li>กำหนดสิทธิ์การใช้งาน</li>
                            <li>ติดตามความก้าวหน้า</li>
                        </ul>
                    </div>
                </div>
                <!-- ระบบจัดการบทเรียน -->
                <div class="col-md-4">
                    <div class="feature-card">
                        <i class="fas fa-book"></i>
                        <h3>ระบบจัดการบทเรียน</h3>
                        <ul class="feature-list">
                            <li>สร้างและจัดการเนื้อหา</li>
                            <li>จัดการคำศัพท์และแบบฝึกหัด</li>
                            <li>ระบบมัลติมีเดีย</li>
                        </ul>
                    </div>
                </div>
                <!-- ระบบการสอบ -->
                <div class="col-md-4">
                    <div class="feature-card">
                        <i class="fas fa-tasks"></i>
                        <h3>ระบบการสอบ</h3>
                        <ul class="feature-list">
                            <li>แบบทดสอบก่อน-หลังเรียน</li>
                            <li>ระบบตรวจคะแนนอัตโนมัติ</li>
                            <li>รายงานผลการสอบ</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Learning Process -->
    <section id="learning-process" class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5">กระบวนการเรียนรู้</h2>
            <div class="timeline">
                <div class="row">
                    <div class="col-md-3">
                        <div class="process-card">
                            <div class="process-icon">
                                <i class="fas fa-sign-in-alt"></i>
                            </div>
                            <h4>ลงทะเบียน</h4>
                            <p>สมัครและเข้าสู่ระบบ</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="process-card">
                            <div class="process-icon">
                                <i class="fas fa-book-open"></i>
                            </div>
                            <h4>ทำแบบทดสอบ</h4>
                            <p>ทดสอบก่อนเรียน</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="process-card">
                            <div class="process-icon">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <h4>เรียนรู้</h4>
                            <p>เข้าสู่บทเรียน</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="process-card">
                            <div class="process-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h4>ประเมินผล</h4>
                            <p>ทดสอบหลังเรียน</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Section with Real Data -->
    <section id="stats" class="py-5">
        <div class="container">
            <div class="row g-4">
                <?php if ($systemStats['success']): ?>
                <div class="col-md-3 col-sm-6">
                    <div class="stat-card-modern">
                        <div class="icon-wrapper">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <h3 class="counter"><?= number_format($systemStats['stats']['students']) ?>+</h3>
                        <p>นักเรียนทั้งหมด</p>
                    </div>
                </div>
                <!-- Similar blocks for other stats... -->
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Courses Section -->
    <section id="courses" class="py-5 bg-light">
        <div class="container">
            <h2 class="text-center mb-5">คอร์สเรียนที่เปิดสอน</h2>
            <div class="row g-4">
                <?php if ($systemStats['success']): 
                    foreach ($systemStats['courses'] as $course): ?>
                <div class="col-md-4">
                    <div class="course-card">
                        <div class="course-image">
                            <img src="https://placehold.co/400x300/1a237e/ffffff?text=Course:+<?= urlencode($course['title']) ?>" 
                                 alt="<?= htmlspecialchars($course['title']) ?>" 
                                 class="img-fluid">
                            <div class="course-overlay">
                                <span class="category"><?= htmlspecialchars($course['category']) ?></span>
                            </div>
                        </div>
                        <div class="course-content">
                            <h3><?= htmlspecialchars($course['title']) ?></h3>
                            <div class="course-meta">
                                <span><i class="fas fa-users"></i> <?= $course['student_count'] ?> นักเรียน</span>
                                <span><i class="fas fa-clock"></i> 20 นาที</span>
                            </div>
                            <a href="page/auth/login.html" class="btn btn-primary btn-sm mt-3">
                                ดูรายละเอียด
                            </a>
                        </div>
                    </div>
                </div>
                <?php endforeach; endif; ?>
            </div>
        </div>
    </section>

    <!-- School Info Section -->
    <section id="school-info" class="py-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 school-info-content">
                    <h2 class="animation-fadeInUp">โรงเรียนสตรีนครสวรรค์</h2>
                    <p class="lead animation-fadeInUp animation-delay-1">
                        โรงเรียนมัธยมศึกษาชั้นนำแห่งจังหวัดนครสวรรค์ 
                        มุ่งเน้นการพัฒนาศักยภาพด้านภาษาต่างประเทศ
                    </p>
                    <ul class="school-features animation-fadeInUp animation-delay-2">
                        <li><i class="fas fa-check-circle"></i> มาตรฐานการศึกษาระดับสากล</li>
                        <li><i class="fas fa-user-graduate"></i> บุคลากรครูคุณภาพ</li>
                        <li><i class="fas fa-school"></i> สิ่งแวดล้อมที่เอื้อต่อการเรียนรู้</li>
                        <li><i class="fas fa-globe-asia"></i> เครือข่ายความร่วมมือระดับนานาชาติ</li>
                    </ul>
                </div>
                <div class="col-lg-6">
                    <div class="school-image-wrapper animation-fadeInRight">
                        <div class="school-image">
                            <img src="https://placehold.co/600x400" 
                                 alt="โรงเรียนสตรีนครสวรรค์" 
                                 class="img-fluid">
                        </div>
                        <div class="school-stats">
                            <div class="school-stat-item">
                                <h4>50+</h4>
                                <p>ปีแห่งความเชี่ยวชาญ</p>
                            </div>
                            <div class="school-stat-item">
                                <h4>100+</h4>
                                <p>ครูผู้สอน</p>
                            </div>
                            <div class="school-stat-item">
                                <h4>95%</h4>
                                <p>ความพึงพอใจ</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-5">
        <div class="container">
            <h2 class="text-center mb-5">ติดต่อสอบถาม</h2>
            <div class="row g-4">
                <div class="col-lg-5">
                    <div class="contact-info">
                        <h4>ข้อมูลติดต่อ</h4>
                        <ul class="list-unstyled">
                            <li>
                                <i class="fas fa-map-marker-alt"></i>
                                <span>
                                312 ถ.สวรรค์วิถี ต.ปากน้ำโพ  <br>
                                อ.เมือง  จ.นครสวรรค์  60000
                                </span>
                            </li>
                            <li>
                                <i class="fas fa-phone"></i>
                                <span>056-221207</span>
                            </li>
                            <li>
                                <i class="fas fa-envelope"></i>
                                <span>info@satrinakhonsawan.ac.th</span>
                            </li>
                            <li>
                                <i class="fas fa-clock"></i>
                                <span>จันทร์ - ศุกร์: 08:00 - 16:30 น.</span>
                            </li>
                        </ul>
                        <div class="social-links mt-4">
                            <a href="#" class="facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="line"><i class="fab fa-line"></i></a>
                            <a href="#" class="youtube"><i class="fab fa-youtube"></i></a>
                            <a href="#" class="instagram"><i class="fab fa-instagram"></i></a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="contact-form">
                        <form id="contactForm">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="text" class="form-control" id="name" placeholder="ชื่อ-นามสกุล">
                                        <label for="name">ชื่อ-นามสกุล</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-floating">
                                        <input type="email" class="form-control" id="email" placeholder="อีเมล">
                                        <label for="email">อีเมล</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="form-floating">
                                        <input type="text" class="form-control" id="subject" placeholder="เรื่อง">
                                        <label for="subject">เรื่อง</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="form-floating">
                                        <textarea class="form-control" id="message" style="height: 150px" placeholder="ข้อความ"></textarea>
                                        <label for="message">ข้อความ</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-paper-plane me-2"></i>ส่งข้อความ
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-5">
                    <h5>โรงเรียนสตรีนครสวรรค์</h5>
                    <p>
                        <i class="fas fa-map-marker-alt me-2"></i>
                        312 ถ.สวรรค์วิถี ต.ปากน้ำโพ  <br>
                        อ.เมือง  จ.นครสวรรค์  60000
                    </p>
                    <p>
                        <i class="fas fa-phone me-2"></i> 056-221207<br>
                        <i class="fas fa-envelope me-2"></i> info@satrinakhonsawan.ac.th
                    </p>
                </div>
                <div class="col-md-4">
                    <h5>ลิงก์ด่วน</h5>
                    <ul class="list-unstyled">
                        <li><a href="#courses">คอร์สเรียน</a></li>
                        <li><a href="#features">ระบบการจัดการ</a></li>
                        <li><a href="#learning-process">กระบวนการเรียนรู้</a></li>
                        <li><a href="#contact">ติดต่อเรา</a></li>
                        <li><a href="page/team.php">ผู้จัดทำ</a></li>
                    </ul>
                </div>
                <div class="col-md-3">
                    <h5>เวลาทำการ</h5>
                    <p>
                        <i class="far fa-clock me-2"></i>
                        จันทร์ - ศุกร์: 08:00 - 16:30 น.<br>
                        <i class="far fa-clock me-2"></i>
                        เสาร์: 09:00 - 15:00 น.
                    </p>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-social">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-line"></i></a>
                    <a href="#"><i class="fab fa-youtube"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
                <div class="developer-info">
                    <p class="mb-2">
                        <i class="fas fa-code me-2"></i>
                        พัฒนาโดย: นายอาสาฬ รอดนวน
                    </p>
                </div>
                <p class="copyright">
                    &copy; <?= date('Y') ?> โรงเรียนสตรีนครสวรรค์. All rights reserved.
                </p>
            </div>
        </div>
    </footer>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JS -->
    <script src="js/main.js?v=<?= time() ?>"></script>
</body>

</html>