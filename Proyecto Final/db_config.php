<?php
header('Content-Type: application/json');

function envValue($key) {
    return $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key) ?: null;
}

function parseDatabaseUrl($url) {
    if (!$url) {
        return [];
    }

    $parts = parse_url($url);
    if ($parts === false) {
        return [];
    }

    parse_str($parts['query'] ?? '', $query);

    return [
        'host' => $parts['host'] ?? null,
        'port' => isset($parts['port']) ? (string) $parts['port'] : null,
        'db' => isset($parts['path']) ? ltrim($parts['path'], '/') : null,
        'user' => $parts['user'] ?? null,
        'pass' => $parts['pass'] ?? null,
        'charset' => $query['charset'] ?? null,
    ];
}

$dbUrl = envValue('MYSQL_URL') ?? envValue('DATABASE_URL');
$dbUrlConfig = parseDatabaseUrl($dbUrl);

$host = $dbUrlConfig['host'] ?? envValue('MYSQLHOST') ?? 'localhost';
$db = $dbUrlConfig['db'] ?? envValue('MYSQLDATABASE') ?? 'gamehub_db';
$user = $dbUrlConfig['user'] ?? envValue('MYSQLUSER') ?? 'root';
$pass = $dbUrlConfig['pass'] ?? envValue('MYSQLPASSWORD') ?? '';
$port = $dbUrlConfig['port'] ?? envValue('MYSQLPORT') ?? '3306';
$charset = $dbUrlConfig['charset'] ?? 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'DB Connection Failed: ' . $e->getMessage(),
    ]);
    exit;
}
?>
