<?php
// db_config.php

// Railway proporciona estas variables automáticamente en su entorno de ejecución.
// Si no existen (por ejemplo, ejecutándolo en local), usará los valores por defecto (localhost).
$host     = getenv('MYSQLHOST')     ?: '127.0.0.1';
$port     = getenv('MYSQLPORT')     ?: '3306';
$dbname   = getenv('MYSQLDATABASE') ?: 'railway';
$user     = getenv('MYSQLUSER')     ?: 'root';
$password = getenv('MYSQLPASSWORD') ?: '';

try {
    // Configuramos el DSN incluyendo explícitamente el Host y el Puerto internos de Railway
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    
    $pdo = new PDO($dsn, $user, $password);
    
    // Configuraciones de seguridad y manejo de errores obligatorias
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    // Si la conexión falla, nos mostrará el motivo real en pantalla sin colgar el servidor
    die("DB Connection Failed: " . $e->getMessage());
}