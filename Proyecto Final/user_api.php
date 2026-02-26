<?php
header('Content-Type: application/json');
require_once 'db_config.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = JSON_decode(file_get_contents('php://input'), true);

    if ($action === 'addPoints') {
        addPoints($pdo, $data);
    } elseif ($action === 'addHistory') {
        addHistory($pdo, $data);
    } else {
        echo JSON_encode(['success' => false, 'message' => 'Invalid action']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getHistory') {
        getHistory($pdo, $_GET['usuario']);
    }
}

function addPoints($pdo, $data) {
    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET puntos = puntos + ? WHERE usuario = ?");
        $stmt->execute([$data['amount'], $data['usuario']]);
        echo JSON_encode(['success' => true]);
    } catch (Exception $e) {
        echo JSON_encode(['success' => false]);
    }
}

function addHistory($pdo, $data) {
    try {
        // Find user ID first
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->execute([$data['usuario']]);
        $user = $stmt->fetch();

        if ($user) {
            $stmt = $pdo->prepare("INSERT INTO historial (usuario_id, juego_titulo, juego_url) VALUES (?, ?, ?)");
            $stmt->execute([$user['id'], $data['title'], $data['url']]);
            echo JSON_encode(['success' => true]);
        }
    } catch (Exception $e) {
        echo JSON_encode(['success' => false]);
    }
}

function getHistory($pdo, $username) {
    try {
        $stmt = $pdo->prepare("SELECT h.juego_titulo as title, h.juego_url as url, h.fecha as date 
                               FROM historial h 
                               JOIN usuarios u ON h.usuario_id = u.id 
                               WHERE u.usuario = ? 
                               ORDER BY h.fecha DESC LIMIT 10");
        $stmt->execute([$username]);
        $history = $stmt->fetchAll();
        echo JSON_encode(['success' => true, 'history' => $history]);
    } catch (Exception $e) {
        echo JSON_encode(['success' => false]);
    }
}
?>
