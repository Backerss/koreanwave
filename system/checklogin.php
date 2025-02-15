<?php

session_start();
require_once 'db.php';

if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $loginType = $_POST['loginType'];

    try {
        if ($loginType === 'student') {
            $query = "SELECT * FROM users WHERE student_id = :username";
        } else {
            $query = "SELECT * FROM users WHERE email = :username";
        }

        $stmt = $db->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // ตรวจสอบรหัสผ่าน
            if ($loginType === 'student') {
                // สำหรับนักเรียน ใช้ student_id เป็นรหัสผ่าน
                $isValid = ($password === $user['student_id']);
            } else {
                // สำหรับผู้ใช้อื่นๆ ตรวจสอบ password_hash
                $isValid = password_verify($password, $user['password_hash']);
            }

            if ($isValid) {
                $_SESSION['user_data'] = [
                    'id' => $user['id'],
                    'studentId' => $user['student_id'],
                    'name' => $user['first_name'] . " " . $user['last_name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'grade_level' => $user['grade_level'],
                    'classroom' => $user['classroom'],
                ];
                echo "success";
            } else {
                echo "invalid_password";
            }
        } else {
            echo "user_not_found";
        }
    } catch (PDOException $e) {
        echo "error: " . $e->getMessage();
    }
} else {
    echo "missing_fields";
}
?>