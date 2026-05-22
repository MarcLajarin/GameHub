<?php
header('Content-Type: application/json');

register_shutdown_function(function () {
    $error = error_get_last();
    if (!$error) {
        return;
    }

    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR];
    if (!in_array($error['type'], $fatalTypes, true)) {
        return;
    }

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }

    echo json_encode([
        'success' => false,
        'message' => 'Fatal PHP error: ' . $error['message'],
        'file' => basename($error['file'] ?? ''),
        'line' => $error['line'] ?? null,
    ]);
});

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
                echo json_encode(['success' => false, 'field' => $field, 'message' => "Missing field: $field"]);
                return;
            }
        }

        $nombre = trim((string) $data['nombre']);
        $apellidos = trim((string) $data['apellidos']);
        $telefono = trim((string) ($data['telefono'] ?? ''));
        $email = trim((string) $data['email']);
        $usuario = trim((string) $data['usuario']);
        $password = (string) $data['password'];

        $lettersOnlyPattern = '/^[A-Za-zÀ-ÿñÑ\s]{3,}$/u';
        if (!preg_match($lettersOnlyPattern, $nombre)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'field' => 'regName', 'message' => 'Name must contain only letters and be at least 3 characters.']);
            return;
        }

        if (!preg_match($lettersOnlyPattern, $apellidos)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'field' => 'regSurname', 'message' => 'Surname must contain only letters and be at least 3 characters.']);
            return;
        }

        if (!preg_match('/^\d{9,12}$/', $telefono)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'field' => 'regPhone', 'message' => 'Phone must contain 9 to 12 digits.']);
            return;
        }

        if (strlen($email) <= 5 || strpos($email, '@') === false || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'field' => 'regEmail', 'message' => 'Email must contain @ and be longer than 5 characters.']);
            return;
        }

        $stmt = $pdo->prepare(
            "INSERT INTO usuarios (nombre, apellidos, telefono, email, usuario, password)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $nombre,
            $apellidos,
            $telefono,
            $email,
            $usuario,
            $password
        ]);

        echo json_encode(['success' => true, 'message' => 'User registered']);
    } catch (\Throwable $e) {
        $message = $e->getMessage();
        $field = null;

        if ($e instanceof \PDOException && ($e->errorInfo[1] ?? null) === 1062) {
            if (str_contains($message, 'usuarios.email')) {
                $field = 'regEmail';
                $message = 'This email is already registered.';
            } elseif (str_contains($message, 'usuarios.usuario')) {
                $field = 'regUser';
                $message = 'This username is already registered.';
            } else {
                $message = 'This record already exists.';
            }
        }

        http_response_code(500);
        echo json_encode(['success' => false, 'field' => $field, 'message' => $message]);
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
