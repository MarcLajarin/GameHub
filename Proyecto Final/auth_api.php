<?php
header('Content-Type: application/json');
require_once 'db_config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

if ($action === 'register') {
    registerUser($pdo, $data);
} elseif ($action === 'login') {
    loginUser($pdo, $data);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function registerUser($pdo, $data) {
    try {
        $requiredFields = ['nombre', 'apellidos', 'email', 'usuario', 'password'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
                return;
            }
        }

        $stmt = $pdo->prepare(
            "INSERT INTO usuarios (nombre, apellidos, telefono, email, usuario, password)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['nombre'],
            $data['apellidos'],
            $data['telefono'] ?? null,
            $data['email'],
            $data['usuario'],
            $data['password']
        ]);

        echo json_encode(['success' => true, 'message' => 'User registered']);
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
}

function loginUser($pdo, $data) {
    try {
        if (!isset($data['usuario'], $data['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing login credentials']);
            return;
        }

        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ? OR email = ?");
        $stmt->execute([$data['usuario'], $data['usuario']]);
        $user = $stmt->fetch();

        if ($user && $data['password'] === $user['password']) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'usuario' => $user['usuario'],
                    'nombre' => $user['nombre'],
                    'puntos' => $user['puntos']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Login error: ' . $e->getMessage()]);
    }
}
?>
