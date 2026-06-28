-- SK All Agriculture Parts Database Schema
-- Compatible with XAMPP MySQL (MariaDB)

CREATE DATABASE IF NOT EXISTS agri_parts_db;
USE agri_parts_db;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Includes technical and agri-specific fields)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    brand VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) DEFAULT NULL,
    stock INT NOT NULL DEFAULT 0,
    short_description TEXT,
    description TEXT,
    main_image VARCHAR(255) NOT NULL,
    material VARCHAR(255) NOT NULL,
    weight VARCHAR(50) NOT NULL,
    compatible_model VARCHAR(255) NOT NULL,
    part_usage VARCHAR(255) NOT NULL, -- e.g. PTO shaft, Rotavator, Tractor
    quality_type VARCHAR(100) NOT NULL, -- e.g. Heavy Duty, Standard
    warranty VARCHAR(100) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 3. Product Extra Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_type VARCHAR(50) DEFAULT 'extra', -- e.g., side, packaging, actual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    payment_method VARCHAR(50) DEFAULT 'COD',
    payment_status ENUM('PENDING', 'PAID', 'COD', 'FAILED') DEFAULT 'COD',
    shipping_address TEXT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    latitude VARCHAR(50) DEFAULT NULL,
    longitude VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- SEED DATA

-- Insert Default Categories
INSERT INTO categories (id, name, slug, description, image) VALUES
(1, 'Rotavator Yoke', 'rotavator-yoke', 'High-durability forged yokes for rotavator connections', '/uploads/cat-yoke.png'),
(2, 'Universal Joint', 'universal-joint', 'Heavy-duty cross and bearing kits for power transmission', '/uploads/cat-ujoint.png'),
(3, 'PTO Shaft Parts', 'pto-shaft-parts', 'Complete power take-off shafts, shields, and couplers', '/uploads/cat-ptoshaft.png'),
(4, 'Blade Holder', 'blade-holder', 'Heavy duty blade bolts, holders, and flanges', '/uploads/cat-bladeholder.png'),
(5, 'Rotavator Gear Parts', 'rotavator-gear-parts', 'Robust gears, pinions, and shafts for side-drive and multi-speed gearboxes', '/uploads/cat-gears.png'),
(6, 'Bearings', 'bearings', 'Specialized heavy-duty ball and roller bearings for agricultural stress', '/uploads/cat-bearings.png'),
(7, 'Coupling Parts', 'coupling-parts', 'Elastic and rigid coupling items for power transmission', '/uploads/cat-couplings.png'),
(8, 'Tractor Spare Parts', 'tractor-spare-parts', 'Engine, clutch, brake, and hydraulic components for leading tractors', '/uploads/cat-tractor.png'),
(9, 'Agricultural Hardware', 'agricultural-hardware', 'Nuts, bolts, spring pins, and heavy-duty fasteners', '/uploads/cat-hardware.png')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Default Admin (Password: admin123, hashed with bcrypt)
INSERT INTO admins (id, name, username, password, email) VALUES
(1, 'SK All Agriculture Parts Admin', 'admin', '$2a$10$N10FxDNTzNRI1lUA90BO8uC7tXGPAM8kifXwnwSL2gAxBP5U6wR7K', 'admin@skallagricultureparts.com')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- Insert Sample Products
INSERT INTO products (id, category_id, name, slug, brand, sku, price, discount_price, stock, short_description, description, main_image, material, weight, compatible_model, part_usage, quality_type, warranty, is_active) VALUES
(1, 2, 'Universal Joint Kit', 'universal-joint-kit-ujk-001', 'Bharat Alloy', 'UJK-001', 850.00, 799.00, 20, 'Heavy-duty universal joint kit for rotavator shaft connection.', 'Ensure smooth power transmission in your farming machinery with this heavy-duty universal joint kit. Designed to withstand high torque loads and harsh field conditions. Easy to greasing and long service life.', '/uploads/prod-ujk.png', 'Forged Alloy Steel', '1.2 kg', 'Standard 1-3/8" 6-Spline PTO systems', 'PTO Shaft Connection', 'Heavy Duty', '6 Months', 1),
(2, 1, 'Rotavator Yoke', 'rotavator-yoke-ry-002', 'AV Forge', 'RY-002', 1200.00, 1099.00, 15, 'High-quality rotavator yoke designed for durable field use.', 'Engineered from premium carbon steel, this yoke is forged and heat-treated to ensure maximum strength and resistance to fatigue. Ideal for demanding rotavator applications.', '/uploads/prod-yoke.png', 'Hardened Forged Steel', '2.5 kg', 'AV-40 / Fieldking Rotavator', 'PTO / Rotavator Shaft Connection', 'Premium Heavy Duty', '1 Year', 1),
(3, 3, 'PTO Cross Kit', 'pto-cross-kit-pck-003', 'Bharat Alloy', 'PCK-003', 650.00, NULL, 35, 'Premium cross kit with grease nipple for agricultural shafts.', 'Perfect replacement cross kit for standard tractor PTO shafts. Complete with circlips and grease nipple for easy maintenance and smooth rotation.', '/uploads/prod-cross.png', 'Chrome-moly Steel', '0.8 kg', 'Universal agricultural PTO shafts', 'PTO Shaft Joint', 'Standard', 'No Warranty', 1),
(4, 4, 'Blade Bolt Set (Pack of 10)', 'blade-bolt-set-bbs-004', 'TuffFast', 'BBS-004', 350.00, 299.00, 100, 'High-tensile grade 10.9 bolts and nuts for rotavator blades.', 'Never compromise on safety in the field. These high-tensile carbon steel bolts are designed to lock rotavator blades securely to the rotor flange. Resists impact and vibration.', '/uploads/prod-bolts.png', 'Grade 10.9 High-Tensile Steel', '0.75 kg (Pack)', 'Universal Rotavators (Maschio, Fieldking, Shaktiman)', 'Blade Flange Fastening', 'Heavy Duty', 'No Warranty', 1),
(5, 8, 'Tractor Dual Clutch Plate', 'tractor-dual-clutch-plate-tcp-005', 'Kalyani Parts', 'TCP-005', 4500.00, 3999.00, 8, 'Dual clutch plate replacement for Mahindra & Swaraj tractors.', 'Premium organic friction material ensures smooth clutch engagement and excellent heat dissipation. Delivers reliable performance during heavy pulling and PTO operations.', '/uploads/prod-clutch.png', 'Cerametallic Friction Material', '4.8 kg', 'Mahindra 575 DI / Swaraj 744 FE', 'Tractor Transmission / Clutch', 'OEM Standard', '1 Year', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 9. Technical Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    machine VARCHAR(255) DEFAULT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Homepage Banners Table
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    link_url VARCHAR(255),
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Banners
INSERT INTO banners (id, title, subtitle, link_url, image_url, display_order, is_active) VALUES
(1, 'High-Tensile Rotavator Parts', 'Engineered for heavy-duty field operations. Premium forged yokes & shafts.', '/shop.html?category=rotavator-yoke', '/uploads/prod-yoke.png', 1, 1),
(2, 'Heavy-Duty Universal Joints', 'Get up to 20% off on all premium universal joint kits this season.', '/shop.html?category=universal-joint', '/uploads/prod-ujk.png', 2, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title), subtitle=VALUES(subtitle), link_url=VALUES(link_url), image_url=VALUES(image_url);


