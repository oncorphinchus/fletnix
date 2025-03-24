<?php
// Include database configuration
require_once __DIR__ . '/../config/database.php';

// Connect to the database
$conn = Database::getConnection();

// Create admin user with password 'admin'
$username = 'admin';
$email = 'admin@fletnix.local';
$password = password_hash('admin', PASSWORD_DEFAULT);
$display_name = 'Administrator';

// Check if user already exists
$checkQuery = "SELECT id FROM users WHERE username = :username OR email = :email";
$checkStmt = $conn->prepare($checkQuery);
$checkStmt->bindParam(':username', $username);
$checkStmt->bindParam(':email', $email);
$checkStmt->execute();

if ($checkStmt->rowCount() > 0) {
    // Update existing user
    $updateQuery = "UPDATE users SET password = :password WHERE username = :username";
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->bindParam(':password', $password);
    $updateStmt->bindParam(':username', $username);
    
    if ($updateStmt->execute()) {
        echo "Admin user password updated successfully.\n";
    } else {
        echo "Failed to update admin user password.\n";
    }
} else {
    // Create new user
    $insertQuery = "INSERT INTO users (username, email, password, display_name) 
                    VALUES (:username, :email, :password, :display_name)";
    $insertStmt = $conn->prepare($insertQuery);
    $insertStmt->bindParam(':username', $username);
    $insertStmt->bindParam(':email', $email);
    $insertStmt->bindParam(':password', $password);
    $insertStmt->bindParam(':display_name', $display_name);
    
    if ($insertStmt->execute()) {
        echo "Admin user created successfully.\n";
    } else {
        echo "Failed to create admin user.\n";
    }
}

// Print the password hash for verification
echo "Password hash: " . $password . "\n"; 