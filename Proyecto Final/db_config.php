<?php
header('Content-Type: application/json');
ini_set('default_socket_timeout', '5');

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

$dbUrl = envValue('MYSQL_URL')
    ?? envValue('MYSQL_PUBLIC_URL')
    ?? envValue('DATABASE_URL');
$dbUrlConfig = parseDatabaseUrl($dbUrl);

$host = envValue('MYSQLHOST')
    ?? envValue('DB_HOST')
    ?? $dbUrlConfig['host']
    ?? (isRailwayEnvironment() ? null : '127.0.0.1');

$db = envValue('MYSQLDATABASE')
    ?? envValue('DB_NAME')
    ?? $dbUrlConfig['db']
    ?? 'gamehub_db';

$user = envValue('MYSQLUSER')
    ?? envValue('DB_USER')
    ?? $dbUrlConfig['user']
    ?? 'root';

$pass = envValue('MYSQLPASSWORD')
    ?? envValue('DB_PASSWORD')
    ?? $dbUrlConfig['pass']
    ?? '';

$port = envValue('MYSQLPORT')
    ?? envValue('DB_PORT')
    ?? $dbUrlConfig['port']
    ?? '3306';

$charset = $dbUrlConfig['charset'] ?? 'utf8mb4';

if ($host && str_contains($host, '${{')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'DB Connection Failed: la variable MYSQLHOST en Railway no se ha resuelto correctamente.',
        'debug' => ['host' => $host]
    ]);
    exit;
}

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
    PDO::ATTR_TIMEOUT => 5,
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
