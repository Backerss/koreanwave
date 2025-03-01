<?php
require_once 'db.php';

function getSystemStats() {
    global $db;
    try {
        // จำนวนนักเรียนทั้งหมด
        $studentCount = $db->query("SELECT COUNT(*) FROM users WHERE role = 'student'")->fetchColumn();
        
        // จำนวนบทเรียน
        $lessonCount = $db->query("SELECT COUNT(*) FROM lessons")->fetchColumn();
        
        // จำนวนชั่วโมงเรียนทั้งหมด
        $totalHours = $db->query("SELECT SUM(time_spent)/60 FROM learning_progress")->fetchColumn();
        
        // อัตราความพึงพอใจ
        $satisfactionRate = $db->query("
            SELECT ROUND(AVG(score), 2) 
            FROM exam_results 
            WHERE exam_id IN (SELECT id FROM exams WHERE exam_type = 'posttest')
        ")->fetchColumn();

        // ดึงข้อมูลคอร์สล่าสุด
        $latestCourses = $db->query("
            SELECT l.*, 
                   l.cover_img,
                   (SELECT COUNT(*) FROM learning_progress WHERE lesson_id = l.id) as student_count
            FROM lessons l
            ORDER BY l.created_at DESC
            LIMIT 3
        ")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'stats' => [
                'students' => $studentCount,
                'lessons' => $lessonCount,
                'hours' => round($totalHours),
                'satisfaction' => $satisfactionRate ?: 95
            ],
            'courses' => $latestCourses
        ];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

return getSystemStats();