<?php
header('Content-Type: application/json');

function envValue($key) {
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    return ($value === false || $value === '') ? null : $value;
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

function isRailwayEnvironment() {
    return envValue('RAILWAY_ENVIRONMENT') !== null
        || envValue('RAILWAY_PROJECT_ID') !== null
        || envValue('RAILWAY_SERVICE_ID') !== null;
}

$dbUrl = envValue('MYSQL_URL') ?? envValue('DATABASE_URL');
$dbUrlConfig = parseDatabaseUrl($dbUrl);

$host = $dbUrlConfig['host']
    ?? envValue('MYSQLHOST')
    ?? envValue('DB_HOST')
    ?? (isRailwayEnvironment() ? null : '127.0.0.1');

$db = $dbUrlConfig['db']
    ?? envValue('MYSQLDATABASE')
    ?? envValue('DB_NAME')
    ?? 'gamehub_db';

$user = $dbUrlConfig['user']
    ?? envValue('MYSQLUSER')
    ?? envValue('DB_USER')
    ?? 'root';

$pass = $dbUrlConfig['pass']
    ?? envValue('MYSQLPASSWORD')
    ?? envValue('DB_PASSWORD')
    ?? '';

$port = $dbUrlConfig['port']
    ?? envValue('MYSQLPORT')
    ?? envValue('DB_PORT')
    ?? '3306';

$charset = $dbUrlConfig['charset'] ?? 'utf8mb4';

if (!$host) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'DB Connection Failed: faltan variables de entorno de MySQL en Railway (MYSQLHOST/MYSQL_URL).'
    ]);
    exit;
}

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
        'debug' => [
            'host' => $host,
            'port' => $port,
            'database' => $db,
            'railway' => isRailwayEnvironment()
        ]
    ]);
    exit;
}
?>
