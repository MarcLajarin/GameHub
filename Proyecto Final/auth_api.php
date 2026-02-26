<?php
header('Content-Type: application/json');
require_once 'db_config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = JSON_decode(file_get_contents('php://input'), true);

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
