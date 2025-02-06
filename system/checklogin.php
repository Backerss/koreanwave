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
        if (password_verify($password, $row['password_hash'])) {
            $_SESSION['student_id'] = $row['student_id'];
            $_SESSION['name'] = $row['name'];
            echo "success";
        } else {
            echo "failed";
        }
    } else {
        echo "failed";
    }
}









?>