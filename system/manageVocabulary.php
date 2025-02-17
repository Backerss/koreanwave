<?php
session_start();
require_once 'db.php';
require_once 'Logger.php';

header('Content-Type: application/json');

try {
    // สร้าง Logger instance
    $logger = new Logger($db, $_SESSION['user_data']['id']);

    function handleFileUpload($file, $type) {
        $targetDir = "../data/" . ($type === 'image' ? 'images/' : 'voice/');
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $fileName = uniqid() . '_' . basename($file["name"]);
        $targetFile = $targetDir . $fileName;
        
        if (move_uploaded_file($file["tmp_name"], $targetFile)) {
            return $fileName;
        }
        return null;
    }

    $action = $_REQUEST['action'] ?? '';
    
    // เริ่ม Transaction
    $db->beginTransaction();

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
            $result = $stmt->execute([
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

            if ($result) {
                $vocabId = $db->lastInsertId();
                // บันทึก Log
                $logger->log(
                    'create',
                    'vocabulary',
                    "เพิ่มคำศัพท์: {$_POST['word_th']} ({$_POST['word_kr']})",
                    $vocabId,
                    null,
                    [
                        'lesson_id' => $_POST['lesson_id'],
                        'word_th' => $_POST['word_th'],
                        'word_kr' => $_POST['word_kr'],
                        'has_image' => !empty($imgFileName),
                        'has_audio' => !empty($audioFileName)
                    ]
                );
                $db->commit();
                echo json_encode(['success' => true, 'id' => $vocabId]);
            } else {
                throw new Exception("ไม่สามารถเพิ่มคำศัพท์ได้");
            }
            break;

        case 'update':
            // ดึงข้อมูลเก่า
            $stmt = $db->prepare("SELECT * FROM vocabulary WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $oldData = $stmt->fetch(PDO::FETCH_ASSOC);

            $updateFields = [
                $_POST['word_th'],
                $_POST['word_en'],
                $_POST['word_kr'],
                $_POST['deteil_word'],
                $_POST['example_one'],
                $_POST['example_two']
            ];

            $sql = "UPDATE vocabulary SET word_th = ?, word_en = ?, word_kr = ?, deteil_word = ?, example_one = ?, example_two = ?";

            // จัดการไฟล์ใหม่
            if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
                if ($oldData['img_url']) {
                    $oldImagePath = "../data/images/" . $oldData['img_url'];
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
                $imgFileName = handleFileUpload($_FILES['image'], 'image');
                $sql .= ", img_url = ?";
                $updateFields[] = $imgFileName;
            }

            if (isset($_FILES['audio']) && $_FILES['audio']['error'] === 0) {
                if ($oldData['audio_url']) {
                    $oldAudioPath = "../data/voice/" . $oldData['audio_url'];
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
            $result = $stmt->execute($updateFields);

            if ($result) {
                // บันทึก Log
                $logger->log(
                    'update',
                    'vocabulary',
                    "แก้ไขคำศัพท์: {$_POST['word_th']} ({$_POST['word_kr']})",
                    $_POST['id'],
                    $oldData,
                    [
                        'word_th' => $_POST['word_th'],
                        'word_kr' => $_POST['word_kr'],
                        'updated_image' => isset($_FILES['image']),
                        'updated_audio' => isset($_FILES['audio'])
                    ]
                );
                $db->commit();
                echo json_encode(['success' => true]);
            } else {
                throw new Exception("ไม่สามารถอัพเดทคำศัพท์ได้");
            }
            break;

        case 'delete':
            // ดึงข้อมูลก่อนลบ
            $stmt = $db->prepare("SELECT * FROM vocabulary WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $vocab = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($vocab) {
                // ลบไฟล์
                if ($vocab['img_url']) {
                    $imagePath = "../data/images/" . $vocab['img_url'];
                    if (file_exists($imagePath)) {
                        unlink($imagePath);
                    }
                }
                if ($vocab['audio_url']) {
                    $audioPath = "../data/voice/" . $vocab['audio_url'];
                    if (file_exists($audioPath)) {
                        unlink($audioPath);
                    }
                }

                // ลบข้อมูล
                $stmt = $db->prepare("DELETE FROM vocabulary WHERE id = ?");
                $result = $stmt->execute([$_POST['id']]);

                if ($result) {
                    // บันทึก Log
                    $logger->log(
                        'delete',
                        'vocabulary',
                        "ลบคำศัพท์: {$vocab['word_th']} ({$vocab['word_kr']})",
                        $_POST['id'],
                        $vocab,
                        null
                    );
                    $db->commit();
                    echo json_encode(['success' => true]);
                } else {
                    throw new Exception("ไม่สามารถลบคำศัพท์ได้");
                }
            } else {
                throw new Exception("ไม่พบคำศัพท์ที่ต้องการลบ");
            }
            break;

        default:
            throw new Exception("Invalid action");
    }

} catch (Exception $e) {
    $db->rollBack();
    error_log("Vocabulary Management Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}