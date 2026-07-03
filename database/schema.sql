-- 土族盘绣纹样开放素材库 - MySQL 8.0+ 数据库结构
CREATE DATABASE IF NOT EXISTS `tuzu_panxiu`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE `tuzu_panxiu`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `download_file`;
DROP TABLE IF EXISTS `pattern_image`;
DROP TABLE IF EXISTS `application_case`;
DROP TABLE IF EXISTS `inheritor`;
DROP TABLE IF EXISTS `creation`;
DROP TABLE IF EXISTS `document`;
DROP TABLE IF EXISTS `pattern`;
DROP TABLE IF EXISTS `banner`;
DROP TABLE IF EXISTS `page_content`;
DROP TABLE IF EXISTS `media_file`;
DROP TABLE IF EXISTS `tag`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `site_setting`;
DROP TABLE IF EXISTS `admin_user`;

CREATE TABLE `admin_user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt 哈希',
  `display_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NULL,
  `status` ENUM('active','disabled') NOT NULL DEFAULT 'active',
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_user_username` (`username`),
  UNIQUE KEY `uk_admin_user_email` (`email`),
  KEY `idx_admin_user_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `site_setting` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` JSON NOT NULL,
  `description` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_site_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `resource_type` ENUM('pattern','document','creation','inheritor','application_case') NOT NULL,
  `parent_id` BIGINT UNSIGNED NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` VARCHAR(500) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'published',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_category_type_slug` (`resource_type`,`slug`),
  KEY `idx_category_query` (`resource_type`,`status`,`sort_order`),
  KEY `idx_category_parent` (`parent_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tag` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `description` VARCHAR(500) NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'published',
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_slug` (`slug`),
  KEY `idx_tag_query` (`status`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `media_file` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `original_name` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL COMMENT 'uploads 下的相对 URL',
  `mime_type` VARCHAR(150) NOT NULL,
  `file_type` ENUM('image','pdf','word','zip','video','audio','other') NOT NULL,
  `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '字节',
  `width` INT UNSIGNED NULL,
  `height` INT UNSIGNED NULL,
  `sha256` CHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_media_file_url` (`file_url`),
  KEY `idx_media_file_type_created` (`file_type`,`created_at`),
  KEY `idx_media_file_sha256` (`sha256`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `banner` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(500) NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `link_url` VARCHAR(500) NULL,
  `link_text` VARCHAR(100) NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
  `sort_order` INT NOT NULL DEFAULT 0,
  `start_at` DATETIME NULL,
  `end_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_banner_query` (`status`,`sort_order`,`start_at`,`end_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pattern` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `cover_image` VARCHAR(500) NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `source_area` VARCHAR(255) NULL,
  `application_part` VARCHAR(255) NULL,
  `craft_type` VARCHAR(255) NULL,
  `main_colors` JSON NULL COMMENT 'HEX 颜色码数组，如 ["#E60012"]',
  `meaning` TEXT NULL,
  `description` TEXT NULL,
  `content` LONGTEXT NULL,
  `tags` JSON NULL COMMENT '标签名称或 slug 数组',
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `download_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pattern_category` (`category_id`),
  KEY `idx_pattern_list` (`status`,`is_featured`,`sort_order`,`published_at`),
  KEY `idx_pattern_craft` (`craft_type`),
  KEY `idx_pattern_part` (`application_part`),
  KEY `idx_pattern_area` (`source_area`),
  CONSTRAINT `fk_pattern_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pattern_image` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pattern_id` BIGINT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pattern_image_order` (`pattern_id`,`sort_order`),
  CONSTRAINT `fk_pattern_image_pattern` FOREIGN KEY (`pattern_id`) REFERENCES `pattern` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `document` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `cover_image` VARCHAR(500) NULL,
  `category_id` BIGINT UNSIGNED NULL,
  `author` VARCHAR(255) NULL,
  `source` VARCHAR(500) NULL,
  `year` SMALLINT UNSIGNED NULL,
  `summary` TEXT NULL,
  `description` TEXT NULL,
  `content` LONGTEXT NULL,
  `tags` JSON NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `download_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_category` (`category_id`),
  KEY `idx_document_list` (`status`,`is_featured`,`sort_order`,`published_at`),
  KEY `idx_document_year` (`year`),
  CONSTRAINT `fk_document_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `creation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `title` VARCHAR(255) NOT NULL, `cover_image` VARCHAR(500) NULL,
  `category_id` BIGINT UNSIGNED NULL, `creator_name` VARCHAR(255) NULL, `creation_date` DATE NULL,
  `description` TEXT NULL, `content` LONGTEXT NULL, `tags` JSON NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft', `sort_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0, `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `download_count` BIGINT UNSIGNED NOT NULL DEFAULT 0, `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_creation_category` (`category_id`), KEY `idx_creation_list` (`status`,`is_featured`,`sort_order`,`published_at`),
  CONSTRAINT `fk_creation_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inheritor` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `title` VARCHAR(255) NOT NULL COMMENT '姓名', `cover_image` VARCHAR(500) NULL,
  `category_id` BIGINT UNSIGNED NULL, `level` VARCHAR(100) NULL, `region` VARCHAR(255) NULL, `birth_year` SMALLINT UNSIGNED NULL,
  `description` TEXT NULL, `content` LONGTEXT NULL, `tags` JSON NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft', `sort_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0, `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `download_count` BIGINT UNSIGNED NOT NULL DEFAULT 0, `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_inheritor_category` (`category_id`), KEY `idx_inheritor_list` (`status`,`is_featured`,`sort_order`,`published_at`),
  CONSTRAINT `fk_inheritor_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `application_case` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, `title` VARCHAR(255) NOT NULL, `cover_image` VARCHAR(500) NULL,
  `category_id` BIGINT UNSIGNED NULL, `case_type` VARCHAR(100) NULL, `client_name` VARCHAR(255) NULL, `case_date` DATE NULL,
  `description` TEXT NULL, `content` LONGTEXT NULL, `tags` JSON NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft', `sort_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0, `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `download_count` BIGINT UNSIGNED NOT NULL DEFAULT 0, `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_application_case_category` (`category_id`), KEY `idx_application_case_list` (`status`,`is_featured`,`sort_order`,`published_at`),
  CONSTRAINT `fk_application_case_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `download_file` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `resource_type` ENUM('pattern','document','creation','inheritor','application_case') NOT NULL,
  `resource_id` BIGINT UNSIGNED NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL COMMENT '直接下载 URL，不含申请或审核流程',
  `file_type` VARCHAR(100) NOT NULL,
  `file_size` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '字节',
  `download_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_download_file_resource_url` (`resource_type`,`resource_id`,`file_url`),
  KEY `idx_download_file_resource` (`resource_type`,`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `page_content` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_key` VARCHAR(100) NOT NULL COMMENT '如 about、platform_intro、footer',
  `title` VARCHAR(255) NOT NULL,
  `cover_image` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `content` LONGTEXT NULL,
  `tags` JSON NULL,
  `status` ENUM('draft','published','offline') NOT NULL DEFAULT 'draft',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `download_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), UNIQUE KEY `uk_page_content_key` (`page_key`),
  KEY `idx_page_content_list` (`status`,`sort_order`,`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
