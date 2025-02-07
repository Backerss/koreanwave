<?php

session_start();
require_once 'db.php';

if (isset($_POST['studentId']) && isset($_POST['password'])) {
    $studentId = $_POST['studentId'];
    $password = $_POST['password'];

    $query = "SELECT * FROM users WHERE student_id = :studentId";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':studentId', $studentId);
    $stmt->execute();

    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if($password == $row['student_id'])
        {            
            $_SESSION['user_data'] = [
                'studentId' => $row['student_id'],
                'name' => $row['first_name'] . " " . $row['last_name'],
                'email' => $row['email'],
                'role' => $row['role'],
                'grade_level' => $row['grade_level'],
                'classroom' => $row['classroom'],
            ];

            echo "success";
        } else {
            echo "failed";
        }
    } else {
        echo "failed";
    }
}










?>