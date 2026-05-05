<?php
// Database configuration - ACTUALIZADO PARA RAILWAY
$host = 'mysql.railway.internal'; 
$db   = 'railway';
$user = 'root';
$pass = 'bLetHVRbohhpLXOLluOKrSPEmPjbRzmG'; 
$port = '3306'; 
$charset = 'utf8mb4';

// El DSN ahora incluye el puerto, esencial para Railway
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     // En producción es mejor un mensaje genérico, pero para tu presentación esto está bien
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
?>