<?php
// Test script to check what media files are being detected

// Include required files
require_once __DIR__ . '/backend/helpers/ApiResponse.php';
require_once __DIR__ . '/backend/helpers/JWTHandler.php';
require_once __DIR__ . '/backend/api/controllers/MediaController.php';

// Create a media controller instance
$mediaController = new MediaController();

// Call the scan method - this will output the JSON directly
$mediaController->scanLocalMedia();

// Exit to prevent further output
exit();
?> 