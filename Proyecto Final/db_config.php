<?php
// db_config.php

// Reemplaza cada valor entre comillas con los datos reales sin asteriscos
// Los puedes ver haciendo clic en cada variable en la pestaña de MySQL de Railway.
$host     = 'mysql.railway.internal'; // Revisa si tu MYSQLHOST es este o una URL larga
$port     = '3306';                   // Tu MYSQLPORT (suele ser 3306)
$dbname   = 'railway';                // Tu MYSQLDATABASE
$user     = 'root';                   // Tu MYSQLUSER
$password = 'TU_CONTRASEÑA_LARGA';    // Tu MYSQLPASSWORD (el código largo de letras y números)

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    
    $pdo = new PDO($dsn, $user, $password);
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch (PDOException $e) {
    die("DB Connection Failed: " . $e->getMessage());
}