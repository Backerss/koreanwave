<?php
session_start();
require_once '../system/db.php';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>จุดประสงค์การเรียนรู้ - ระบบจัดการการเรียนภาษาเกาหลี</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Sarabun:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/main.css">
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
        <div class="container">
            <a class="navbar-brand" href="../index.php">
                <img src="https://placehold.co/40" alt="โลโก้โรงเรียน" class="school-logo me-2">
                โรงเรียนสตรีนครสวรรค์
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="../index.php">หน้าแรก</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-warning ms-2" href="auth/login.html">เข้าสู่ระบบ</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="py-5 mt-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="card shadow-sm">
                        <div class="card-body p-5">
                            <h1 class="text-center mb-5">จุดประสงค์การเรียนรู้</h1>
                            
                            <div class="objectives-section mb-5">
                                <h3 class="mb-4"><i class="fas fa-bullseye text-primary me-2"></i>จุดประสงค์ทั่วไป</h3>
                                <div class="row g-4">
                                    <div class="col-md-6">
                                        <div class="objective-card">
                                            <h5>ด้านความรู้ (Knowledge)</h5>
                                            <ul>
                                                <li>เข้าใจหลักไวยากรณ์ภาษาเกาหลีพื้นฐาน</li>
                                                <li>รู้คำศัพท์ที่ใช้ในชีวิตประจำวัน</li>
                                                <li>เข้าใจโครงสร้างประโยคพื้นฐาน</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="objective-card">
                                            <h5>ด้านทักษะ (Skills)</h5>
                                            <ul>
                                                <li>สามารถสื่อสารภาษาเกาหลีในชีวิตประจำวัน</li>
                                                <li>สามารถอ่านและเขียนตัวอักษรเกาหลี</li>
                                                <li>สามารถฟังและจับใจความสำคัญได้</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="objectives-section mb-5">
                                <h3 class="mb-4"><i class="fas fa-graduation-cap text-primary me-2"></i>จุดประสงค์เชิงพฤติกรรม</h3>
                                <div class="row g-4">
                                    <div class="col-12">
                                        <div class="objective-card">
                                            <ul>
                                                <li>นักเรียนสามารถใช้ภาษาเกาหลีในการแนะนำตัวได้</li>
                                                <li>นักเรียนสามารถสนทนาภาษาเกาหลีในสถานการณ์ต่างๆ ได้</li>
                                                <li>นักเรียนสามารถอ่านและเขียนประโยคภาษาเกาหลีพื้นฐานได้</li>
                                                <li>นักเรียนสามารถออกเสียงภาษาเกาหลีได้ถูกต้อง</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="text-center">
                                <a href="auth/login.html" class="btn btn-primary btn-lg">
                                    <i class="fas fa-sign-in-alt me-2"></i>เริ่มเรียนเลย
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="py-4 bg-light">
        <div class="container text-center">
            <p class="mb-0">&copy; <?= date('Y') ?> โรงเรียนสตรีนครสวรรค์. All rights reserved.</p>
        </div>
    </footer>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>