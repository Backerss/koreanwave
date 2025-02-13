<?php
function getConfig() {
    $config_file = __DIR__ . '/../config/database.php';
    
    if (!file_exists($config_file)) {
        throw new Exception('Config file not found');
    }
    
    $config = require $config_file;
    if (!is_array($config)) {
        throw new Exception('Invalid config format');
    }
    
    return $config;
}

try {
    // อ่านค่าจาก config
    $config = getConfig();
    
    // สร้างการเชื่อมต่อด้วย PDO
    $db = new PDO(
        "mysql:host={$config['DB_HOST']};dbname={$config['DB_NAME']};charset=utf8", 
        $config['DB_USER'], 
        $config['DB_PASS']
    );
    
    // ตั้งค่า error mode
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(Exception $e) {
    die("Connection failed: " . $e->getMessage());
}