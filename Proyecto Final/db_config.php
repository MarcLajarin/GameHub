<?php
// Database configuration - Soporte dual (Local WAMP y Produccion Railway)
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

// El DSN incluye el puerto, necesario para Railway.
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Devolver un error JSON amigable para que los modals de auth no fallen con un error de red.
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'DB Connection Failed: ' . $e->getMessage()]);
    exit;
}
?>
