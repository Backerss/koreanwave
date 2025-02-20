-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 20, 2025 at 06:46 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `koreanwave`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `module`, `description`, `target_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES
(1, 1, 'update', 'users', 'แก้ไขข้อมูลผู้ใช้: สมชาติ Sirisuk (บทบาท: student)', 7, '{\"id\": 7, \"tel\": \"0891234567\", \"club\": \"Science Club\", \"role\": \"student\", \"email\": \"somchai.sirisuk@gmail.com\", \"gender\": \"male\", \"classroom\": \"1\", \"last_name\": \"Sirisuk\", \"created_at\": \"2025-02-16 04:28:08\", \"first_name\": \"Somchai\", \"student_id\": \"12345\", \"updated_at\": \"2025-02-16 04:28:08\", \"grade_level\": 5, \"profile_img\": \"path_to_image1.jpg\", \"password_hash\": \"$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC\"}', '{\"club\": null, \"role\": \"student\", \"email\": \"somchai.sirisuk@gmail.com\", \"gender\": \"male\", \"classroom\": \"1\", \"last_name\": \"Sirisuk\", \"first_name\": \"สมชาติ\", \"student_id\": \"12345\", \"grade_level\": \"5\"}', '::1', '2025-02-17 11:42:33'),
(2, 1, 'update', 'users', 'แก้ไขข้อมูลผู้ใช้: สมชาติ Sirisuk (บทบาท: student)', 7, '{\"id\": 7, \"tel\": \"0891234567\", \"club\": null, \"role\": \"student\", \"email\": \"somchai.sirisuk@gmail.com\", \"gender\": \"male\", \"classroom\": \"1\", \"last_name\": \"Sirisuk\", \"created_at\": \"2025-02-16 04:28:08\", \"first_name\": \"สมชาติ\", \"student_id\": \"12345\", \"updated_at\": \"2025-02-17 18:42:33\", \"grade_level\": 5, \"profile_img\": \"path_to_image1.jpg\", \"password_hash\": \"$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC\"}', '{\"club\": \"\", \"role\": \"student\", \"email\": \"somchai.sirisuk@gmail.com\", \"gender\": \"male\", \"classroom\": \"1\", \"last_name\": \"Sirisuk\", \"first_name\": \"สมชาติ\", \"student_id\": \"12345\", \"grade_level\": \"5\"}', '::1', '2025-02-17 11:45:43'),
(3, 1, 'create', 'vocabulary', 'เพิ่มคำศัพท์: หัวหอม5 (양파)', 3, NULL, '{\"word_kr\": \"양파\", \"word_th\": \"หัวหอม5\", \"has_audio\": true, \"has_image\": true, \"lesson_id\": \"1\"}', '::1', '2025-02-17 15:47:28'),
(4, 1, 'login', 'auth', 'เข้าสู่ระบบสำเร็จ: admin admin (admin)', 1, NULL, '{\"user_role\": \"admin\", \"ip_address\": \"::1\", \"login_type\": \"email\", \"user_email\": \"admin.a@sati.ac.th\"}', '::1', '2025-02-17 18:39:14'),
(5, 1, 'login', 'auth', 'เข้าสู่ระบบสำเร็จ: admin admin (admin)', 1, NULL, '{\"user_role\": \"admin\", \"ip_address\": \"::1\", \"login_type\": \"email\", \"user_email\": \"admin.a@sati.ac.th\"}', '::1', '2025-02-17 18:39:47');

-- --------------------------------------------------------

--
-- Table structure for table `clubs`
--

CREATE TABLE `clubs` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clubs`
--

INSERT INTO `clubs` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'ชุมนุมภาษาเกาหลี', NULL, '2025-02-15 04:39:42'),
(2, 'ชุมนุมดนตรี', NULL, '2025-02-15 04:39:42'),
(3, 'ชุมนุมคณิตศาสตร์', NULL, '2025-02-15 04:39:42'),
(4, 'ชุมนุมวิทยาศาสตร์', NULL, '2025-02-15 04:39:42'),
(5, 'ชุมนุมภาษาอังกฤษ', NULL, '2025-02-15 04:39:42'),
(6, 'ชุมนุมภาษาไทย', NULL, '2025-02-15 04:39:42');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `exam_type` enum('pretest','posttest') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `lesson_id`, `exam_type`, `created_at`, `updated_at`) VALUES
(2, 1, 'pretest', '2025-02-13 05:18:12', '2025-02-13 05:18:12'),
(3, 2, 'pretest', '2025-02-13 21:30:30', '2025-02-13 21:30:30'),
(4, 1, 'posttest', '2025-02-13 22:56:22', '2025-02-13 22:56:22');

-- --------------------------------------------------------

--
-- Table structure for table `exam_answers`
--

CREATE TABLE `exam_answers` (
  `id` int NOT NULL,
  `result_id` int NOT NULL,
  `question_id` int NOT NULL,
  `user_answer` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_results`
--

CREATE TABLE `exam_results` (
  `id` int NOT NULL,
  `exam_id` int NOT NULL,
  `user_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `time_spent` int NOT NULL DEFAULT '0',
  `correct_answers` int NOT NULL DEFAULT '0',
  `total_questions` int NOT NULL DEFAULT '0',
  `answers_json` json DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_results`
--

INSERT INTO `exam_results` (`id`, `exam_id`, `user_id`, `score`, `time_spent`, `correct_answers`, `total_questions`, `answers_json`, `completed_at`) VALUES
(1, 2, 1, '100.00', 7, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 05:18:48'),
(2, 2, 1, '100.00', 83, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 05:20:20'),
(3, 2, 1, '100.00', 3, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 05:34:19'),
(4, 2, 1, '100.00', 4, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 09:06:57'),
(5, 2, 1, '100.00', 0, 0, 0, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 09:14:25'),
(6, 2, 1, '100.00', 79, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 09:21:03'),
(7, 2, 1, '100.00', 5, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 09:22:30'),
(8, 2, 1, '100.00', 2, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 09:25:37'),
(10, 4, 1, '100.00', 271, 4, 4, '[{\"answer\": \"A\", \"question_id\": \"10\"}, {\"answer\": \"B\", \"question_id\": \"11\"}, {\"answer\": \"C\", \"question_id\": \"12\"}, {\"answer\": \"D\", \"question_id\": \"13\"}]', '2025-02-13 23:02:32'),
(11, 2, 1, '100.00', 4, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-13 23:24:05'),
(12, 3, 1, '0.00', 12, 0, 5, '[{\"answer\": \"B\", \"question_id\": \"5\"}, {\"answer\": \"B\", \"question_id\": \"6\"}, {\"answer\": \"C\", \"question_id\": \"7\"}, {\"answer\": \"A\", \"question_id\": \"8\"}, {\"answer\": \"C\", \"question_id\": \"9\"}]', '2025-02-14 00:48:16'),
(13, 4, 1, '100.00', 10, 4, 4, '[{\"answer\": \"A\", \"question_id\": \"10\"}, {\"answer\": \"B\", \"question_id\": \"11\"}, {\"answer\": \"C\", \"question_id\": \"12\"}, {\"answer\": \"D\", \"question_id\": \"13\"}]', '2025-02-14 19:21:39'),
(14, 2, 1, '100.00', 3, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-14 19:28:32'),
(15, 2, 1, '100.00', 5, 2, 2, '[{\"answer\": \"A\", \"question_id\": \"3\"}, {\"answer\": \"B\", \"question_id\": \"4\"}]', '2025-02-14 19:43:47'),
(16, 2, 1, '0.00', 2, 0, 0, NULL, '2025-02-14 19:51:23'),
(17, 2, 1, '0.00', 6, 0, 0, NULL, '2025-02-14 19:51:27'),
(18, 2, 1, '100.00', 2, 0, 0, NULL, '2025-02-14 19:54:25'),
(19, 2, 1, '100.00', 5, 0, 0, NULL, '2025-02-15 04:34:41'),
(20, 4, 1, '100.00', 7, 0, 0, NULL, '2025-02-15 04:35:06'),
(21, 2, 3, '100.00', 2, 0, 0, NULL, '2025-02-15 07:31:56'),
(24, 4, 3, '100.00', 8, 0, 0, NULL, '2025-02-15 08:27:57'),
(25, 2, 1, '100.00', 4, 2, 2, NULL, '2025-02-15 08:46:34'),
(26, 4, 1, '50.00', 6, 2, 4, NULL, '2025-02-15 08:47:20'),
(27, 2, 5, '100.00', 5, 2, 2, NULL, '2025-02-15 19:53:59');

-- --------------------------------------------------------

--
-- Table structure for table `learning_progress`
--

CREATE TABLE `learning_progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `current_vocab_index` int DEFAULT '0',
  `pretest_done` tinyint(1) DEFAULT '0',
  `posttest_done` tinyint(1) DEFAULT '0',
  `completed` tinyint(1) DEFAULT '0',
  `last_accessed` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `time_spent` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `learning_progress`
--

INSERT INTO `learning_progress` (`id`, `user_id`, `lesson_id`, `current_vocab_index`, `pretest_done`, `posttest_done`, `completed`, `last_accessed`, `created_at`, `time_spent`) VALUES
(11, 1, 1, 1, 1, 1, 1, '2025-02-15 08:47:11', '2025-02-15 08:46:30', 0),
(12, 5, 1, 0, 1, 0, 0, '2025-02-15 19:53:53', '2025-02-15 19:53:53', 0);

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` enum('vegetables','fruits','meats') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `title`, `category`, `created_at`) VALUES
(1, 'ผัก', 'vegetables', '2025-02-12 10:50:54'),
(2, 'ผลไม้', 'fruits', '2025-02-12 10:51:14'),
(3, 'เนื้อ', 'meats', '2025-02-12 10:51:23');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int NOT NULL,
  `exam_id` int NOT NULL,
  `question_text` text NOT NULL,
  `option_a` text NOT NULL,
  `option_b` text NOT NULL,
  `option_c` text NOT NULL,
  `option_d` text NOT NULL,
  `correct_answer` char(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `exam_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`) VALUES
(3, 2, 'ตอบ 1', '1', '1', '1', '1', 'A'),
(4, 2, 'ตอบ 2', '1', '2', '1', '3', 'B'),
(5, 3, 'asdasdasd', 'aasdasdas', 'as', 'asdasdas', 'dasdas', 'D'),
(6, 3, 'asdasdas', 'dasdasd', 'd', 'dasdasdas', 'asdas', 'D'),
(7, 3, 'asdsadasd', 'asdas', 'dasd', 'asdasdasdasd', 'asdasd', 'D'),
(8, 3, 'asdasdasd', 'asdasdas', 'asdsadsadasdas', 'asdasdasda', 'asdasdasasdas', 'C'),
(9, 3, 'asdasd', 'sadasd', 'asdas', 'dasdasdas', 'dsadas', 'D'),
(10, 4, 'ตอบข้อที่ 1', '1', '2', '3', '4', 'A'),
(11, 4, 'ตอบข้อที่ 2', '1', '2', '3', '4', 'B'),
(12, 4, 'ตอบ C', '1', '2', '3', '4', 'C'),
(13, 4, 'ตอบข้อที่ D', '1', '2', '3', '4', 'D');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `grade_level` int DEFAULT NULL,
  `classroom` varchar(10) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `club` varchar(100) DEFAULT NULL,
  `email` varchar(120) NOT NULL DEFAULT 'none@gmail.com',
  `tel` varchar(10) NOT NULL DEFAULT '0000000000',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL,
  `profile_img` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `student_id`, `first_name`, `last_name`, `grade_level`, `classroom`, `gender`, `club`, `email`, `tel`, `password_hash`, `role`, `profile_img`, `created_at`, `updated_at`) VALUES
(1, NULL, 'admin', 'admin', NULL, NULL, 'male', 'ชุมนุมภาษาอังกฤษ', 'admin.a@sati.ac.th', '0622647041', '$2y$10$OQVVfQby7pvi/2Xj3.QehOp4rlqWeu1H3pBQw7zObOo2FEc5W0/t.', 'admin', '', '2025-02-12 10:37:19', '2025-02-15 05:03:00'),
(3, '10002', 'อาสาฬ', 'รอดนวน', 1, '1', NULL, NULL, 'none@gmail.com', '0000000000', '$2y$10$OQVVfQby7pvi/2Xj3.QehOp4rlqWeu1H3pBQw7zObOo2FEc5W0/t.', 'student', NULL, '2025-02-13 08:13:24', '2025-02-13 08:13:24'),
(4, NULL, 'อาสาฬ', 'รอดนวน', NULL, NULL, NULL, NULL, 'none@gmail.com', '0000000000', '$2y$10$OeZF.yAmSc8is5sbG.QPweLDmSogUnwJgkW9o3HNs6LaQD2gKHS4y', 'admin', NULL, '2025-02-13 08:13:40', '2025-02-13 08:13:40'),
(5, '10003', 'อาสาฬ', 'รอดนวน', 1, '1', 'male', 'ชุมนุมคณิตศาสตร์', 'AsanRodnuan2546@gmail.com', '0000000000', '$2y$10$SByRlvEDf149dkvHm6EqyOU3kFvcHLJlgUsC5yhIjc1rkBEWd5FzK', 'student', NULL, '2025-02-13 08:34:02', '2025-02-15 19:54:31'),
(6, '10004', 'อาสาฬ', 'รอดนวน', 1, '1', NULL, NULL, 'AsanRodnuan2546@gmail.com', '0000000000', '$2y$10$D6U/s9MgrVyR38QVC7fP5eABOoBEoL/TaiYWYbM51DQOc2WUPjZx6', 'student', NULL, '2025-02-13 08:41:27', '2025-02-13 08:41:27'),
(7, '12345', 'สมชาติ', 'Sirisuk', 5, '1', 'male', '', 'somchai.sirisuk@gmail.com', '0891234567', '$2y$10$9FzaYlcamzTr2XYxvxUBi.a7SiYQXjt.AGsjcR.duFJmndP1vEqm6', 'student', 'path_to_image1.jpg', '2025-02-15 21:28:08', '2025-02-17 11:45:43'),
(8, '12346', 'Somsri', 'Kittipong', 5, '2', 'female', 'Math Club', 'somsri.kittipong@gmail.com', '0891234568', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image2.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(9, NULL, 'Anusorn', 'Jirasak', 12, '3', 'male', 'Debate Club', 'anusorn.jirasak@gmail.com', '0891234569', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'teacher', 'path_to_image3.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(10, NULL, 'Chalerm', 'Songpol', 0, '0', 'male', 'N/A', 'chalerm.songpol@gmail.com', '0891234570', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'admin', 'path_to_image4.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(11, '12347', 'Pimchanok', 'Sirimat', 10, '1', 'female', 'Music Club', 'pimchanok.sirimat@gmail.com', '0891234571', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image5.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(12, '12348', 'Nathapat', 'Thongthao', 8, '2', 'male', 'Art Club', 'nathapat.thongthao@gmail.com', '0891234572', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image6.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(13, NULL, 'Ratchanon', 'Wongsiri', 11, '3', 'male', 'Computer Club', 'ratchanon.wongsiri@gmail.com', '0891234573', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'teacher', 'path_to_image7.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(14, '12349', 'Chutikan', 'Tungthong', 12, '4', 'female', 'Science Club', 'chutikan.tungthong@gmail.com', '0891234574', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image8.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(15, '12350', 'Suda', 'Phaisan', 6, '1', 'female', 'Literature Club', 'suda.phaisan@gmail.com', '0891234575', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image9.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(16, '12351', 'Jirawat', 'Tansai', 7, '2', 'male', 'Football Club', 'jirawat.tansai@gmail.com', '0891234576', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image10.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(17, NULL, 'Kittipong', 'Chareon', 10, '3', 'male', 'Debate Club', 'kittipong.chareon@gmail.com', '0891234577', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'teacher', 'path_to_image11.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(18, '12352', 'Kanya', 'Hathai', 5, '1', 'female', 'Science Club', 'kanya.hathai@gmail.com', '0891234578', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image12.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(19, '12353', 'Pattarapol', 'Siam', 8, '2', 'male', 'Math Club', 'pattarapol.siam@gmail.com', '0891234579', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image13.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(20, NULL, 'Chalida', 'Phromrung', 9, '3', 'female', 'Art Club', 'chalida.phromrung@gmail.com', '0891234580', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'teacher', 'path_to_image14.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(21, '12354', 'Surat', 'Yothin', 12, '4', 'male', 'Sports Club', 'surat.yothin@gmail.com', '0891234581', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image15.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(22, '12355', 'Arthit', 'Sikong', 10, '1', 'male', 'Literature Club', 'arthit.sikong@gmail.com', '0891234582', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image16.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(23, NULL, 'Pichit', 'Nattapol', 7, '2', 'female', 'Music Club', 'pichit.nattapol@gmail.com', '0891234583', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'teacher', 'path_to_image17.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(24, '12356', 'Rapeepat', 'Chaiyo', 6, '3', 'male', 'Football Club', 'rapeepat.chaiyo@gmail.com', '0891234584', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image18.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(25, '12357', 'Nonglak', 'Somwang', 5, '1', 'female', 'Art Club', 'nonglak.somwang@gmail.com', '0891234585', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image19.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(26, NULL, 'Chayut', 'Sungthong', 12, '4', 'male', 'Sports Club', 'chayut.sungthong@gmail.com', '0891234586', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'teacher', 'path_to_image20.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(27, '12358', 'Amorn', 'Kittisak', 9, '2', 'male', 'Math Club', 'amorn.kittisak@gmail.com', '0891234587', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image21.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(28, NULL, 'Sasiprapa', 'Somchit', 11, '3', 'female', 'Literature Club', 'sasiprapa.somchit@gmail.com', '0891234588', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'teacher', 'path_to_image22.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08'),
(29, '12359', 'Siriporn', 'Jumjai', 7, '1', 'female', 'Debate Club', 'siriporn.jumjai@gmail.com', '0891234589', '$2y$10$JtGSHqEXAfoe4pRkFAD2j.mlt0qZpa9P7IObVMyjkpA3gFn4xXZvC', 'student', 'path_to_image23.jpg', '2025-02-15 21:28:08', '2025-02-15 21:28:08');

-- --------------------------------------------------------

--
-- Table structure for table `vocabulary`
--

CREATE TABLE `vocabulary` (
  `id` int NOT NULL,
  `lesson_id` int NOT NULL,
  `word_th` varchar(100) NOT NULL,
  `word_en` varchar(100) NOT NULL,
  `word_kr` varchar(100) NOT NULL,
  `audio_url` varchar(255) DEFAULT 'no_audio.mp3',
  `deteil_word` varchar(120) NOT NULL DEFAULT 'none',
  `example_one` varchar(120) NOT NULL,
  `example_two` varchar(120) NOT NULL,
  `img_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vocabulary`
--

INSERT INTO `vocabulary` (`id`, `lesson_id`, `word_th`, `word_en`, `word_kr`, `audio_url`, `deteil_word`, `example_one`, `example_two`, `img_url`) VALUES
(1, 1, 'หัวหอม', 'Onion', '양파', '67ad81a9dbd25_gam.mp3', 'หัวหอม ในภาษาเกาหลี', '양파가 정말 매워요.', '이 요리에 양파가 들어가요?', '67ad81a9db986_1.jpg'),
(2, 1, 'กระเทียม', 'Garlic', '마늘 ', '67b059db9546e_gam.mp3', 'กระเทียมเป็นพืชสมุนไพร', 'ฉันใส่กระเทียมลงไปในผัดกะเพราเพื่อเพิ่มรสชาติ	', '마늘은 건강에 좋아서 요리에 자주 사용돼요.', '67adb4e559306_2.jpg'),
(3, 1, 'หัวหอม5', 'onion', '양파', '67b35a10387e5_gam.mp3', 'asdasdasdasd', 'สักอย่างแหละ', 'หัวหอม', '67b35a1037c7a_11.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `clubs`
--
ALTER TABLE `clubs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `result_id` (`result_id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Indexes for table `learning_progress`
--
ALTER TABLE `learning_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `vocabulary`
--
ALTER TABLE `vocabulary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `clubs`
--
ALTER TABLE `clubs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `exam_answers`
--
ALTER TABLE `exam_answers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_results`
--
ALTER TABLE `exam_results`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `learning_progress`
--
ALTER TABLE `learning_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `vocabulary`
--
ALTER TABLE `vocabulary`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`);

--
-- Constraints for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`result_id`) REFERENCES `exam_results` (`id`),
  ADD CONSTRAINT `exam_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);

--
-- Constraints for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD CONSTRAINT `exam_results_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`);

--
-- Constraints for table `learning_progress`
--
ALTER TABLE `learning_progress`
  ADD CONSTRAINT `learning_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `learning_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`);

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`);

--
-- Constraints for table `vocabulary`
--
ALTER TABLE `vocabulary`
  ADD CONSTRAINT `vocabulary_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
