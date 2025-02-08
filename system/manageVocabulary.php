<?php
require_once 'db.php';

header('Content-Type: application/json');

function handleFileUpload($file, $type) {
    $targetDir = "../data/" . ($type === 'image' ? 'images/' : 'voice/');
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // สร้างชื่อไฟล์ใหม่ด้วย uniqid เพื่อป้องกันชื่อซ้ำ
    $fileName = uniqid() . '_' . basename($file["name"]);
    $targetFile = $targetDir . $fileName;
    
    // ย้ายไฟล์ที่อัพโหลดไปยังโฟลเดอร์ปลายทาง
    if (move_uploaded_file($file["tmp_name"], $targetFile)) {
        return $fileName;
    }
    return null;
}

$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'get':
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT * FROM vocabulary WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(['success' => true, 'vocabulary' => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            $stmt = $db->prepare("SELECT * FROM vocabulary WHERE lesson_id = ?");
            $stmt->execute([$_GET['lesson_id']]);
            echo json_encode(['success' => true, 'vocabulary' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        break;

    case 'add':
        $imgFileName = null;
        $audioFileName = null;

        if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
            $imgFileName = handleFileUpload($_FILES['image'], 'image');
        }
        if (isset($_FILES['audio']) && $_FILES['audio']['error'] === 0) {
            $audioFileName = handleFileUpload($_FILES['audio'], 'voice');
        }

        $stmt = $db->prepare("INSERT INTO vocabulary (lesson_id, word_th, word_en, word_kr, deteil_word, example_one, example_two, img_url, audio_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $_POST['lesson_id'],
            $_POST['word_th'],
            $_POST['word_en'],
            $_POST['word_kr'],
            $_POST['deteil_word'],
            $_POST['example_one'],
            $_POST['example_two'],
            $imgFileName,
            $audioFileName
        ]);
        echo json_encode(['success' => true]);
        break;

    case 'update':
        // ดึงข้อมูลไฟล์เก่า
        $stmt = $db->prepare("SELECT img_url, audio_url FROM vocabulary WHERE id = ?");
        $stmt->execute([$_POST['id']]);
        $oldFiles = $stmt->fetch(PDO::FETCH_ASSOC);

        $updateFields = [
            $_POST['word_th'],
            $_POST['word_en'],
            $_POST['word_kr'],
            $_POST['deteil_word'],
            $_POST['example_one'],
            $_POST['example_two']
        ];

        $sql = "UPDATE vocabulary SET word_th = ?, word_en = ?, word_kr = ?, deteil_word = ?, example_one = ?, example_two = ?";

        // จัดการไฟล์รูปภาพใหม่
        if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
            // ลบไฟล์เก่า
            if ($oldFiles['img_url']) {
                $oldImagePath = "../../data/images/" . $oldFiles['img_url'];
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            $imgFileName = handleFileUpload($_FILES['image'], 'image');
            $sql .= ", img_url = ?";
            $updateFields[] = $imgFileName;
        }

        // จัดการไฟล์เสียงใหม่
        if (isset($_FILES['audio']) && $_FILES['audio']['error'] === 0) {
            // ลบไฟล์เก่า
            if ($oldFiles['audio_url']) {
                $oldAudioPath = "../../data/voice/" . $oldFiles['audio_url'];
                if (file_exists($oldAudioPath)) {
                    unlink($oldAudioPath);
                }
            }
            $audioFileName = handleFileUpload($_FILES['audio'], 'voice');
            $sql .= ", audio_url = ?";
            $updateFields[] = $audioFileName;
        }

        $sql .= " WHERE id = ?";
        $updateFields[] = $_POST['id'];

        $stmt = $db->prepare($sql);
        $stmt->execute($updateFields);
        echo json_encode(['success' => true]);
        break;

    case 'delete':
        // ดึงข้อมูลไฟล์ก่อนลบ
        $stmt = $db->prepare("SELECT img_url, audio_url FROM vocabulary WHERE id = ?");
        $stmt->execute([$_POST['id']]);
        $files = $stmt->fetch(PDO::FETCH_ASSOC);

        // ลบไฟล์รูปภาพ
        if ($files['img_url']) {
            $imagePath = "../../data/images/" . $files['img_url'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        // ลบไฟล์เสียง
        if ($files['audio_url']) {
            $audioPath = "../../data/voice/" . $files['audio_url'];
            if (file_exists($audioPath)) {
                unlink($audioPath);
            }
        }

        // ลบข้อมูลจากฐานข้อมูล
        $stmt = $db->prepare("DELETE FROM vocabulary WHERE id = ?");
        $stmt->execute([$_POST['id']]);
        echo json_encode(['success' => true]);
        break;
}