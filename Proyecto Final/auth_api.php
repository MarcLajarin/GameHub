<?php
header('Content-Type: application/json');

// Credenciales directas de Railway (obtenidas dinámicamente)
$host     = getenv('MYSQLHOST')     ?: 'mysql.railway.internal';
$port     = getenv('MYSQLPORT')     ?: '3306';
$dbname   = getenv('MYSQLDATABASE') ?: 'railway';
$user     = getenv('MYSQLUSER')     ?: 'root';
$password = getenv('MYSQLPASSWORD') ?: '';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Si la base de datos falla, devolvemos un JSON limpio para que no rompa el JS
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la BD: ' . $e->getMessage()
    ]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'register') {
        registerUser($pdo, $data);
    } elseif ($action === 'login') {
        loginUser($pdo, $data);
    } else {
        echo JSON_encode(['success' => false, 'message' => 'Invalid action']);
    }
}

function registerUser($pdo, $data) {
    try {
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, apellidos, telefono, email, usuario, password) VALUES (?, ?, ?, ?, ?, ?)");
        // Note: For education purposes, we'll store simple passwords first, but ideally use password_hash
        $stmt->execute([
            $data['nombre'],
            $data['apellidos'],
            $data['telefono'],
            $data['email'],
            $data['usuario'],
            $data['password'] 
        ]);
        echo JSON_encode(['success' => true, 'message' => 'User registered']);
    } catch (Exception $e) {
        echo JSON_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
}

function loginUser($pdo, $data) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ? OR email = ?");
        $stmt->execute([$data['usuario'], $data['usuario']]);
        $user = $stmt->fetch();

        if ($user && $data['password'] === $user['password']) {
            echo JSON_encode([
                'success' => true, 
                'user' => [
                    'usuario' => $user['usuario'],
                    'nombre' => $user['nombre'],
                    'puntos' => $user['puntos']
                ]
            ]);
        } else {
            echo JSON_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } catch (Exception $e) {
        echo JSON_encode(['success' => false, 'message' => 'Login error']);
    }
}
?>
