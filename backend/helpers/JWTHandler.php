<?php
/**
 * JWTHandler - Helper class for JWT authentication
 */

class JWTHandler {
    // JWT secret key - should be stored in a secure environment variable
    private static $secretKey = 'fletnix_jwt_secret_key';
    
    // Token expiration time in seconds (default: 24 hours)
    private static $tokenExpiration = 86400;
    
    /**
     * Generate a JWT token for a user
     * 
     * @param array $userData User data to encode in the token
     * @return string The JWT token
     */
    public static function generateToken($userData) {
        $header = self::base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));
        
        $payload = self::base64UrlEncode(json_encode([
            'sub' => $userData['id'],
            'name' => $userData['username'],
            'role' => $userData['role'],
            'iat' => time(),
            'exp' => time() + self::$tokenExpiration
        ]));
        
        $signature = self::base64UrlEncode(hash_hmac(
            'sha256',
            "{$header}.{$payload}",
            self::$secretKey,
            true
        ));
        
        return "{$header}.{$payload}.{$signature}";
    }
    
    /**
     * Validate a JWT token
     * 
     * @param string $token The JWT token to validate
     * @return array|false User data from the token if valid, false otherwise
     */
    public static function validateToken($token) {
        // Split the token parts
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($header, $payload, $signature) = $parts;
        
        // Verify signature
        $calculatedSignature = self::base64UrlEncode(hash_hmac(
            'sha256',
            "{$header}.{$payload}",
            self::$secretKey,
            true
        ));
        
        if ($calculatedSignature !== $signature) {
            return false;
        }
        
        // Decode payload
        $payloadData = json_decode(self::base64UrlDecode($payload), true);
        
        // Check expiration
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }
        
        return $payloadData;
    }
    
    /**
     * Get user from authorization header
     * 
     * @return array|false User data if token is valid, false otherwise
     */
    public static function getAuthUser() {
        $headers = apache_request_headers();
        
        if (!isset($headers['Authorization'])) {
            return false;
        }
        
        $authHeader = $headers['Authorization'];
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            return false;
        }
        
        $token = substr($authHeader, 7);
        return self::validateToken($token);
    }
    
    /**
     * Base64Url encode
     * 
     * @param string $data Data to encode
     * @return string Base64Url encoded string
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64Url decode
     * 
     * @param string $data Data to decode
     * @return string Decoded data
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
} 