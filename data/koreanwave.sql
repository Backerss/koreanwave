-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 07, 2025 at 05:09 PM
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
(1, 'ผัก', 'vegetables', '2025-02-07 06:28:19');

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
  `email` varchar(120) NOT NULL DEFAULT 'none@gmail.com',
  `tel` varchar(10) NOT NULL DEFAULT '0000000000',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL,
  `profile_img` longtext NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `student_id`, `first_name`, `last_name`, `grade_level`, `classroom`, `email`, `tel`, `password_hash`, `role`, `profile_img`, `created_at`, `updated_at`) VALUES
(1, '12301', 'สมชาย', 'ศรีสุข', 3, '1', 'somchai.sati.ac.th', '0123456789', '$2b$12$WDniTVWn1nW3SXfyvC11RuCA02WyOah6wrpJJDTtzzTQri5AKGRiC', 'student', 'https://example.com/image.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(2, '12302', 'นางสาวธิดา', 'โสมจันทร์', 2, '2', 'tida.sati.ac.th', '0987654321', '$2b$12$7U4wQgP0s9EBg51hUxDHP.UApKXzF9B3mZR7xZh3aODH3eYfMhfaS', 'student', 'https://example.com/image2.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(3, '12303', 'กนกรัตน์', 'วัฒน์', 4, '3', 'kanok.sati.ac.th', '0765432109', '$2b$12$/d//DB7KpZzEc2SNNu3Cq.wx7BySz.j8uKt.Ce8oKvEtn2i6lkX2u', 'student', 'https://example.com/image3.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(4, '12304', 'อัญชลี', 'เจริญ', 0, '1', 'anchalee.sati.ac.th', '0612345678', '$2b$12$zCveIsXvOZhayjTBmh/07OTHPMVlMBYRMqvDSIAe1Rgkzlg2iPn0', 'teacher', 'https://example.com/image4.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(5, '12305', 'มงคล', 'ชิตจันท์', 0, '2', 'mongkol.sati.ac.th', '0912345678', '$2b$12$IjvRieOoWmPixm4SUauxmOSe3JyLKPUl61lXWciKQmVVJhXxyoyyO', 'admin', 'https://example.com/image5.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(6, '12306', 'ภัทรพงษ์', 'เทพวรรณ', 3, '1', 'pattharaphong.sati.ac.th', '0851234567', '$2b$12$Jdk8I6v/h52bhWHzZ5INM.rO.nJO7km4SHSe73lQTGll.qsXh9nYq', 'student', 'https://example.com/image6.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(7, '12307', 'อารีรัตน์', 'สุริยะ', 2, '2', 'areerat.sati.ac.th', '0823456789', '$2b$12$DZ8hV3jtZjX.fhzUS4R7O2V8BhJlZgLZ8UbgXEaOs9YX3.PXyyT9S', 'student', 'https://example.com/image7.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(8, '12308', 'สุกัญญา', 'ศรีสม', 4, '3', 'sukanya.sati.ac.th', '0976543210', '$2b$12$G9VpZR4Ek1BFGQ9gMdxwKh.pdZ2UKM28cJHikj5eZT3fuwSCfs49z8', 'student', 'https://example.com/image8.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(9, '12309', 'สุเทพ', 'คูณเงิน', 0, '2', 'suthep.sati.ac.th', '0945678901', '$2b$12$OfJQsRwr67TtBGR5emPHR7WqHoklMgeNRVp7w0oYsRRt93bRhFzx6i', 'teacher', 'https://example.com/image9.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37'),
(10, '12310', 'วีระชัย', 'แสงชัย', 0, '1', 'weera.sati.ac.th', '0912345678', '$2b$12$XQKNeQJt59NY9zd8kUu9rf39zOujGoGGa5cm4sdjr5dAWn.eP10O2', 'admin', 'https://example.com/image10.jpg', '2025-02-07 12:09:37', '2025-02-07 12:09:37');

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
  `audio_url` varchar(255) DEFAULT NULL,
  `deteil_word` varchar(120) NOT NULL DEFAULT 'none',
  `example_one` varchar(120) NOT NULL,
  `example_two` varchar(120) NOT NULL,
  `img_url` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `vocabulary`
--

INSERT INTO `vocabulary` (`id`, `lesson_id`, `word_th`, `word_en`, `word_kr`, `audio_url`, `deteil_word`, `example_one`, `example_two`, `img_url`) VALUES
(1, 1, 'หัวหอม', 'onion', '양파', 'test', 'none', '', '', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vocabulary`
--
ALTER TABLE `vocabulary`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `vocabulary`
--
ALTER TABLE `vocabulary`
  ADD CONSTRAINT `vocabulary_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
