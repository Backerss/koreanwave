<?php
// Start the session if not already started
session_start();

// Clear all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Redirect to login page
header("Location: ../page/auth/login.html");
exit();
?>