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
    } elseif ($action === 'addFriend') {
        addFriend($pdo, $data);
    } elseif ($action === 'acceptFriend') {
        acceptFriend($pdo, $data);
    } else {
        echo JSON_encode(['success' => false, 'message' => 'Invalid action']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'getHistory') {
        getHistory($pdo, $_GET['usuario']);
    } elseif ($action === 'getProfile') {
        getProfile($pdo, $_GET['usuario']);
    } elseif ($action === 'searchUsers') {
        searchUsers($pdo, $_GET['query'] ?? '', $_GET['usuario'] ?? '');
    } elseif ($action === 'getFriends') {
        getFriends($pdo, $_GET['usuario']);
    } elseif ($action === 'getLeaderboard') {
        getLeaderboard($pdo, $_GET['usuario']);
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

function getProfile($pdo, $username) {
    try {
        $stmt = $pdo->prepare("SELECT nombre, apellidos, email, telefono, usuario, puntos, created_at FROM usuarios WHERE usuario = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if ($user) {
            echo JSON_encode(['success' => true, 'user' => $user]);
        } else {
            echo JSON_encode(['success' => false, 'message' => 'User not found']);
        }
    } catch (Exception $e) {
        echo JSON_encode(['success' => false]);
    }
}

function searchUsers($pdo, $query, $currentUser) {
    try {
        if (strlen($query) < 2) {
            echo JSON_encode(['success' => true, 'users' => []]);
            return;
        }
        $stmt = $pdo->prepare(
            "SELECT usuario, puntos FROM usuarios 
             WHERE usuario LIKE ? AND usuario != ? 
             ORDER BY usuario ASC LIMIT 10"
        );
        $stmt->execute(["%$query%", $currentUser]);
        $users = $stmt->fetchAll();
        echo JSON_encode(['success' => true, 'users' => $users]);
    } catch (Exception $e) {
        echo JSON_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function addFriend($pdo, $data) {
    try {
        // Get IDs for both users
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->execute([$data['usuario']]);
        $user = $stmt->fetch();

        $stmt->execute([$data['amigo']]);
        $friend = $stmt->fetch();

        if (!$user || !$friend) {
            echo JSON_encode(['success' => false, 'message' => 'Usuario no encontrado']);
            return;
        }

        if ($user['id'] === $friend['id']) {
            echo JSON_encode(['success' => false, 'message' => 'No puedes añadirte a ti mismo']);
            return;
        }

        // Check if friendship already exists (in either direction)
        $stmt = $pdo->prepare(
            "SELECT id, estado FROM amigos 
             WHERE (usuario_id = ? AND amigo_id = ?) OR (usuario_id = ? AND amigo_id = ?)"
        );
        $stmt->execute([$user['id'], $friend['id'], $friend['id'], $user['id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            $msg = $existing['estado'] === 'aceptado' ? 'Ya sois amigos' : 'Solicitud ya enviada';
            echo JSON_encode(['success' => false, 'message' => $msg]);
            return;
        }

        // Create friend request
        $stmt = $pdo->prepare("INSERT INTO amigos (usuario_id, amigo_id, estado) VALUES (?, ?, 'pendiente')");
        $stmt->execute([$user['id'], $friend['id']]);
        echo JSON_encode(['success' => true, 'message' => 'Solicitud enviada']);
    } catch (Exception $e) {
        echo JSON_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getFriends($pdo, $username) {
    try {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            echo JSON_encode(['success' => false, 'message' => 'User not found']);
            return;
        }

        // Get accepted friends
        $stmt = $pdo->prepare(
            "SELECT u.usuario, u.puntos, a.estado, 
                    CASE WHEN a.usuario_id = ? THEN 'enviada' ELSE 'recibida' END as direccion
             FROM amigos a 
             JOIN usuarios u ON (CASE WHEN a.usuario_id = ? THEN a.amigo_id ELSE a.usuario_id END) = u.id
             WHERE (a.usuario_id = ? OR a.amigo_id = ?)
             ORDER BY a.estado ASC, a.created_at DESC"
        );
        $stmt->execute([$user['id'], $user['id'], $user['id'], $user['id']]);
        $friends = $stmt->fetchAll();
        echo JSON_encode(['success' => true, 'friends' => $friends]);
    } catch (Exception $e) {
        echo JSON_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function acceptFriend($pdo, $data) {
    try {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->execute([$data['usuario']]);
        $user = $stmt->fetch();

        $stmt->execute([$data['amigo']]);
        $friend = $stmt->fetch();

        if (!$user || !$friend) {
            echo JSON_encode(['success' => false, 'message' => 'Usuario no encontrado']);
            return;
        }

        $stmt = $pdo->prepare(
            "UPDATE amigos SET estado = 'aceptado' 
             WHERE usuario_id = ? AND amigo_id = ? AND estado = 'pendiente'"
        );
        $stmt->execute([$friend['id'], $user['id']]);

        if ($stmt->rowCount() > 0) {
            echo JSON_encode(['success' => true, 'message' => 'Amistad aceptada']);
        } else {
            echo JSON_encode(['success' => false, 'message' => 'No se encontró la solicitud']);
        }
    } catch (Exception $e) {
        echo JSON_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getLeaderboard($pdo, $username) {
    try {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user) {
            echo JSON_encode(['success' => false, 'message' => 'User not found']);
            return;
        }

        // Get current user + accepted friends, sorted by points desc
        $stmt = $pdo->prepare(
            "SELECT u.usuario, u.puntos
             FROM usuarios u
             WHERE u.id = ?
             UNION
             SELECT u.usuario, u.puntos
             FROM usuarios u
             JOIN amigos a ON (
                 (a.usuario_id = ? AND a.amigo_id = u.id)
                 OR (a.amigo_id = ? AND a.usuario_id = u.id)
             )
             WHERE a.estado = 'aceptado'
             ORDER BY puntos DESC
             LIMIT 20"
        );
        $stmt->execute([$user['id'], $user['id'], $user['id']]);
        $leaderboard = $stmt->fetchAll();
        echo JSON_encode(['success' => true, 'leaderboard' => $leaderboard]);
    } catch (Exception $e) {
        echo JSON_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>
