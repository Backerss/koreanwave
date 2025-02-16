<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

// ตรวจสอบการเข้าถึงเฉพาะครูและผู้ดูแล
if (!isset($_SESSION['user_data']) || !in_array($_SESSION['user_data']['role'], ['teacher', 'admin'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Access denied'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'getStudentsProgress':
                try {
                    $params = [];
                    $whereConditions = ["u.role = 'student'"];
                    
                    // เพิ่มเงื่อนไขการกรอง
                    if (!empty($_GET['grade'])) {
                        $whereConditions[] = "u.grade_level = ?";
                        $params[] = $_GET['grade'];
                    }
                    if (!empty($_GET['class'])) {
                        $whereConditions[] = "u.classroom = ?";
                        $params[] = $_GET['class'];
                    }

                    $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

                    $sql = "
                        SELECT 
                            u.id,
                            u.student_id,
                            CONCAT(u.first_name, ' ', u.last_name) as full_name,
                            u.grade_level,
                            u.classroom,
                            COUNT(DISTINCT lp.lesson_id) as lessons_taken,
                            (
                                SELECT COUNT(*) 
                                FROM lessons
                            ) as total_lessons,
                            COALESCE(AVG(CASE WHEN e.exam_type = 'pretest' THEN er.score END), 0) as pretest_avg,
                            COALESCE(AVG(CASE WHEN e.exam_type = 'posttest' THEN er.score END), 0) as posttest_avg,
                            COALESCE(
                                (COUNT(DISTINCT CASE WHEN lp.completed = 1 THEN lp.lesson_id END) * 100.0 / 
                                NULLIF((SELECT COUNT(*) FROM lessons), 0)), 
                                0
                            ) as progress
                        FROM users u
                        LEFT JOIN learning_progress lp ON u.id = lp.user_id
                        LEFT JOIN exams e ON lp.lesson_id = e.lesson_id
                        LEFT JOIN exam_results er ON e.id = er.exam_id AND er.user_id = u.id
                        {$whereClause}
                        GROUP BY u.id, u.student_id, u.first_name, u.last_name, u.grade_level, u.classroom
                        ORDER BY u.grade_level, u.classroom, u.first_name
                    ";

                    $stmt = $db->prepare($sql);
                    $stmt->execute($params);
                    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    echo json_encode([
                        'success' => true,
                        'data' => $students
                    ]);

                } catch (Exception $e) {
                    echo json_encode([
                        'success' => false,
                        'message' => $e->getMessage()
                    ]);
                }
                break;

            case 'getSummaryStats':
                try {
                    $params = [];
                    $whereConditions = ["u.role = 'student'"];
                    
                    if (!empty($_GET['grade'])) {
                        $whereConditions[] = "u.grade_level = ?";
                        $params[] = $_GET['grade'];
                    }
                    if (!empty($_GET['class'])) {
                        $whereConditions[] = "u.classroom = ?";
                        $params[] = $_GET['class'];
                    }

                    $whereClause = implode(" AND ", $whereConditions);

                    $sql = "
                        SELECT 
                            COUNT(DISTINCT u.id) as total,
                            SUM(CASE WHEN u.gender = 'male' THEN 1 ELSE 0 END) as male_count,
                            SUM(CASE WHEN u.gender = 'female' THEN 1 ELSE 0 END) as female_count,
                            COUNT(DISTINCT CASE WHEN completed_lessons = total_lessons THEN u.id END) as completed,
                            COUNT(DISTINCT CASE WHEN completed_lessons > 0 AND completed_lessons < total_lessons THEN u.id END) as in_progress,
                            COUNT(DISTINCT CASE WHEN last_activity >= CURDATE() THEN u.id END) as active_today,
                            COUNT(DISTINCT CASE WHEN last_activity < DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN u.id END) as inactive_week,
                            COALESCE(AVG(posttest_score), 0) as average_score,
                            COALESCE(MAX(posttest_score), 0) as highest_score,
                            COALESCE(MIN(CASE WHEN posttest_score > 0 THEN posttest_score END), 0) as lowest_score
                        FROM (
                            SELECT 
                                u.*,
                                COUNT(DISTINCT CASE WHEN lp.completed = 1 THEN lp.lesson_id END) as completed_lessons,
                                (SELECT COUNT(*) FROM lessons) as total_lessons,
                                MAX(lp.updated_at) as last_activity,
                                AVG(CASE WHEN e.exam_type = 'posttest' THEN er.score END) as posttest_score
                            FROM users u
                            LEFT JOIN learning_progress lp ON u.id = lp.user_id
                            LEFT JOIN exams e ON lp.lesson_id = e.lesson_id
                            LEFT JOIN exam_results er ON e.id = er.exam_id AND er.user_id = u.id
                            WHERE {$whereClause}
                            GROUP BY u.id
                        ) stats";

                    $stmt = $db->prepare($sql);
                    $stmt->execute($params);
                    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

                    echo json_encode([
                        'success' => true,
                        'data' => $stats
                    ]);

                } catch (Exception $e) {
                    echo json_encode([
                        'success' => false,
                        'message' => $e->getMessage()
                    ]);
                }
                break;

            case 'getStudentDetails':
                if (!isset($_GET['student_id'])) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Missing student_id parameter'
                    ]);
                    exit;
                }

                try {
                    // ดึงข้อมูลนักเรียน
                    $stmt = $db->prepare("
                        SELECT 
                            u.id,
                            u.student_id,
                            CONCAT(u.first_name, ' ', u.last_name) as full_name,
                            u.grade_level,
                            u.classroom
                        FROM users u
                        WHERE u.id = ? AND u.role = 'student'
                    ");
                    $stmt->execute([$_GET['student_id']]);
                    $student = $stmt->fetch(PDO::FETCH_ASSOC);

                    if (!$student) {
                        throw new Exception('Student not found');
                    }

                    // ดึงข้อมูลความก้าวหน้าในแต่ละบทเรียน
                    $stmt = $db->prepare("
                        SELECT 
                            l.id,
                            l.title,
                            lp.completed,
                            lp.current_vocab_index > 0 as started,
                            er_pre.score as pretest_score,
                            er_post.score as posttest_score
                        FROM lessons l
                        LEFT JOIN learning_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
                        LEFT JOIN exams e_pre ON l.id = e_pre.lesson_id AND e_pre.exam_type = 'pretest'
                        LEFT JOIN exam_results er_pre ON e_pre.id = er_pre.exam_id AND er_pre.user_id = ?
                        LEFT JOIN exams e_post ON l.id = e_post.lesson_id AND e_post.exam_type = 'posttest'
                        LEFT JOIN exam_results er_post ON e_post.id = er_post.exam_id AND er_post.user_id = ?
                        ORDER BY l.id
                    ");
                    $stmt->execute([$_GET['student_id'], $_GET['student_id'], $_GET['student_id']]);
                    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    echo json_encode([
                        'success' => true,
                        'data' => [
                            'student' => $student,
                            'lessons' => $lessons
                        ]
                    ]);

                } catch (Exception $e) {
                    echo json_encode([
                        'success' => false,
                        'message' => $e->getMessage()
                    ]);
                }
                break;
        }
    }
}