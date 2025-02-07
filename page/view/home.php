<!DOCTYPE html>
<html lang="th">

<?php

session_start();
if (!isset($_SESSION['user_data'])) {
    header("Location: ../../page/auth/login.html");
    exit();
}
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบจัดการข้อมูล - โรงเรียนสตรีนครสวรรค์</title>
    <!-- Bootstrap 5.3 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- DataTables -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">
    <!-- SweetAlert2 -->
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../../css/home.css">
    <link rel="stylesheet" href="../../css/gradesPage.css">
    <link rel="stylesheet" href="../../css/lessonpage.css">
</head>

<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <div class="sidebar-header">
            <img src="https://sns.electivecourses.net/data/img/logo.png" alt="โลโก้" class="logo">
            <h5>โรงเรียนสตรีนครสวรรค์</h5>
        </div>
        <ul class="sidebar-menu">
            <li class="active" data-page="dashboard">
                <i class="fas fa-home"></i>
                <span>หน้าหลัก</span>
            </li>
            <li data-page="profile">
                <i class="fas fa-user"></i>
                <span>ข้อมูลส่วนตัว</span>
            </li>
            <li data-page="grades">
                <i class="fas fa-chart-line"></i>
                <span>ผลการเรียน</span>
            </li>
            <li data-page="attendance">
                <i class="fas fa-clipboard-check"></i>
                <span>การเข้าเรียน</span>
            </li>
            <li data-page="settings">
                <i class="fas fa-cog"></i>
                <span>ตั้งค่า</span>
            </li>

            <?php if ($_SESSION['user_data']['role'] == 'teacher' || $_SESSION['user_data']['role'] == 'admin'): ?>
            <hr>
            <li data-page="users">
                <i class="fas fa-users"></i>
                <span>จัดการผู้ใช้</span>
            </li>
            <li data-page="courses"> 
                <i class="fas fa-book"></i>
                <span>จัดการคอร์ส</span>
            </li>
            <?php endif; ?>


        </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Navbar -->
        <nav class="top-navbar">
            <div class="nav-left">
                <button id="sidebarToggle">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="breadcrumb">
                    <span id="currentPage">หน้าหลัก</span>
                </div>
            </div>
            <div class="nav-right">
                <div class="notification-bell">
                    <i class="fas fa-bell"></i>
                    <span class="badge">5</span>
                </div>
                <div class="user-profile">
                    <img src="https://placehold.co/40" alt="โปรไฟล์">
                    <div class="user-info">
                        <span class="user-name"><?php echo $_SESSION['user_data']['name']; ?></span>

                        <span class='user-role'><?php echo $_SESSION['user_data']['role']; ?></span>
                    </div>
                    <div class="dropdown">
                        <button class="btn dropdown-toggle" data-bs-toggle="dropdown">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#profile"><i class="fas fa-user"></i> โปรไฟล์</a></li>
                            <li data-page="profile"><a class="dropdown-item" href="#settings"><i class="fas fa-cog"></i>
                                    ตั้งค่า</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item text-danger" href="../../system/logout.php" id="logoutBtn">
                                    <i class="fas fa-sign-out-alt"></i> ออกจากระบบ</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Content Area -->
        <div class="content-area">
            <!-- Dashboard Page -->
            <?php include('../inc/dashbordPage.php') ?>

            <!-- Other Pages (Hidden by default) -->
            <?php include('../inc/profilePage.php') ?>
            <!-- Add other pages as needed -->
            <!-- หน้าเรียนบทเรียนแบบเป็นหน้าต่างเรียนเลย -->
            <?php include('../inc/lessonPage.php') ?>
            <!-- หน้าเรียนบทเรียนแบบเป็นหน้าต่างเรียนเลย -->
            <!-- หน้า ทำแบบทดสอบก่อนเรียน-->
            <?php include('../inc/pretestPage.php') ?>
            <!-- หน้า ทำแบบทดสอบก่อนเรียน-->
            <!-- หน้าจัดการผู้ใช้ -->
            <?php include('../inc/usersPage.php') ?>
            <!-- หน้าจัดการผู้ใช้ -->

            <!-- หน้าแสดงผลการเรียน -->
            <?php include('../inc/gradesPage.php') ?>
            <!-- หน้าแสดงผลการเรียน -->

            <!--หน้าแสดงการเข้าเรียน-->
            <?php include('../inc/attendancePage.php') ?>
            <!--หน้าแสดงการเข้าเรียน-->

            <!-- หน้าแสดงการสร้าง แก้ไข ลบ คอร์สและเนื้อหาภายในคอร์ส -->
            <?php include('../inc/couresePage.php') ?>
            <!-- หน้าแสดงการสร้าง แก้ไข ลบ คอร์สและเนื้อหาภายในคอร์ส -->

        </div>

    </div>

    </div>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- DataTables -->
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Custom JS -->
    <script src="../../js/home.js"></script>
</body>

</html>