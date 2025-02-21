<?php
session_start();
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ทีมผู้จัดทำ - ระบบจัดการการเรียนภาษาเกาหลี</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Sarabun:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/main.css">
    <style>
        .team-section {
            background: linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%);
            padding: 120px 0 80px;
            min-height: 100vh;
        }

        .team-card {
            position: relative;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-top: 75px;
        }

        .team-card:hover {
            transform: translateY(-10px) scale(1.01);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
            border-color: #4834d4;
        }

        .team-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, #4834d4, #6c5ce7);
            clip-path: circle(250% at 0% 0%);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
            opacity: 0;
        }

        .team-card:hover::before {
            clip-path: circle(80% at 0% 0%);
            opacity: 0.1;
        }

        .team-image {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            margin-top: 50px !important;
            margin: auto;
            position: relative;
            z-index: 2;
        }

        .team-image::before {
            content: '';
            position: absolute;
            inset: -10px;
            border-radius: 50%;
            border: 2px solid rgba(72, 52, 212, 0.1);
            animation: spin 10s linear infinite;
        }

        @keyframes spin {
            100% { transform: rotate(360deg); }
        }

        .team-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            border: 5px solid white;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            transition: all 0.6s ease;
        }

        .team-card:hover .team-image img {
            transform: scale(1.1);
        }

        .team-content {
            padding: 30px 25px;
            text-align: center;
            position: relative;
            z-index: 2;
        }

        .team-content h4 {
            color: #2d3436;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            transition: all 0.3s ease;
        }

        .team-card:hover .team-content h4 {
            color: #4834d4;
        }

        .team-role {
            color: #4834d4;
            font-weight: 600;
            font-size: 1.1rem;
            margin: 15px 0;
            padding-bottom: 15px;
            position: relative;
        }

        .team-role::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 3px;
            background: linear-gradient(to right, #4834d4, #6c5ce7);
            transition: all 0.3s ease;
        }

        .team-card:hover .team-role::after {
            width: 80px;
        }

        .team-major {
            color: #636e72;
            font-size: 0.95rem;
            padding: 8px 16px;
            background: rgba(72, 52, 212, 0.05);
            border-radius: 20px;
            display: inline-block;
            margin: 10px 0;
        }

        .team-social {
            margin-top: 25px;
            display: flex;
            justify-content: center;
            gap: 15px;
        }

        .team-social a {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(72, 52, 212, 0.05);
            color: #4834d4;
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }

        .team-social a:hover {
            background: #4834d4;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(72, 52, 212, 0.2);
        }

        .section-title {
            color: #2d3436;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 80px;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 5px;
            background: linear-gradient(to right, #4834d4, #6c5ce7);
            border-radius: 10px;
        }

        @media (max-width: 768px) {
            .team-card {
                margin-top: 60px;
            }
            
            .team-image {
                width: 120px;
                height: 120px;
                margin: -60px auto 0;
            }

            .section-title {
                font-size: 2rem;
                margin-bottom: 60px;
            }

            .team-content {
                padding: 20px 15px;
            }

            .team-content h4 {
                font-size: 1.3rem;
            }
        }
    </style>
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
                </ul>
            </div>
        </div>
    </nav>

    <!-- Team Section -->
    <section class="team-section">
        <div class="container">
            <h2 class="text-center section-title mb-5">ทีมผู้จัดทำ</h2>
            
            <!-- Advisors Row -->
            <div class="row justify-content-center mb-5">
                <div class="col-lg-4">
                    <div class="team-card">
                        <div class="team-image">
                            <img src="https://edu.nsru.ac.th/2018/images/employee/12-28-15_05-01-2022_wuttichai.jpg" alt="ที่ปรึกษาโครงการ">
                        </div>
                        <div class="team-content">
                            <h4>ผศ.ดร.วุฒิชัย พิลึก</h4>
                            <div class="team-role">ที่ปรึกษาโครงการ</div>
                            <div class="team-major">สาขาวิชาเทคโนโลยีดิจิทัลเพื่อการศึกษา</div>
                            <div class="team-social">
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fas fa-envelope"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Team Members Row -->
            <div class="row g-4">
                <!-- Team Member 1 -->
                <div class="col-lg-4 col-md-6">
                    <div class="team-card">
                        <div class="team-image">
                            <img src="https://i.imgur.com/aaEgRpz.jpeg" alt="สมาชิกทีม 1">
                        </div>
                        <div class="team-content">
                            <h4>นายอาสาฬ รอดนวน</h4>
                            <div class="team-role">หัวหน้าโครงการ</div>
                            <div class="team-major">สาขาวิชาเทคโนโลยีดิจิทัลเพื่อการศึกษา</div>
                            <div class="team-social">
                                <a href="#"><i class="fab fa-github"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fas fa-envelope"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Team Member 2 -->
                <div class="col-lg-4 col-md-6">
                    <div class="team-card">
                        <div class="team-image">
                            <img src="https://i.imgur.com/qIvhvGO.jpeg" alt="สมาชิกทีม 2">
                        </div>
                        <div class="team-content">
                            <h4>นายพีรัชชัย หิริโอ</h4>
                            <div class="team-role">ด้านภาษา</div>
                            <div class="team-major">สาขาวิชาเทคโนโลยีดิจิทัลเพื่อการศึกษา</div>
                            <div class="team-social">
                                <a href="#"><i class="fab fa-github"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fas fa-envelope"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Team Member 3 -->
                <div class="col-lg-4 col-md-6">
                    <div class="team-card">
                        <div class="team-image">
                            <img src="https://i.imgur.com/EvVv4y8.jpeg" alt="สมาชิกทีม 3">
                        </div>
                        <div class="team-content">
                            <h4>นายธีรพงศ์ ตุนา</h4>
                            <div class="team-role">พัฒนาระบบ</div>
                            <div class="team-major">สาขาวิชาเทคโนโลยีดิจิทัลเพื่อการศึกษา</div>
                            <div class="team-social">
                                <a href="#"><i class="fab fa-github"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fas fa-envelope"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Team Member 4 -->
                <div class="col-lg-4 col-md-6">
                    <div class="team-card">
                        <div class="team-image">
                            <img src="https://i.imgur.com/MkLZkwK.jpeg" alt="สมาชิกทีม 4">
                        </div>
                        <div class="team-content">
                            <h4>นายชัยพร เจี่ย</h4>
                            <div class="team-role">ออกแบบ UX/UI</div>
                            <div class="team-major">สาขาวิชาเทคโนโลยีดิจิทัลเพื่อการศึกษา</div>
                            <div class="team-social">
                                <a href="#"><i class="fab fa-github"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fas fa-envelope"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Team Member 5 -->
                <div class="col-lg-4 col-md-6">
                    <div class="team-card">
                        <div class="team-image">
                            <img src="https://i.imgur.com/dPqKAzH.jpeg" alt="สมาชิกทีม 5">
                        </div>
                        <div class="team-content">
                            <h4>นายสมสกุล เสงี่ยมแก้ว</h4>
                            <div class="team-role">ทดสอบระบบ</div>
                            <div class="team-major">สาขาวิชาเทคโนโลยีดิจิทัลเพื่อการศึกษา</div>
                            <div class="team-social">
                                <a href="#"><i class="fab fa-github"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fas fa-envelope"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

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