<?php
header('Content-Type: application/json');

function getOnlineUsers() {
    if (file_exists('online_users.json')) {
        $data = json_decode(file_get_contents('online_users.json'), true);
        
        // Remove usuários inativos (mais de 10 segundos sem atualização)
        $now = time();
        foreach ($data as $id => $lastSeen) {
            if ($now - $lastSeen > 10) {
                unset($data[$id]);
            }
        }
        return $data;
    }
    return [];
}

function saveOnlineUsers($users) {
    file_put_contents('online_users.json', json_encode($users));
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';
$userId = $data['userId'] ?? '';

switch($action) {
    case 'ping':
        $users = getOnlineUsers();
        $users[$userId] = time();
        saveOnlineUsers($users);
        
        echo json_encode([
            'success' => true,
            'count' => count($users)
        ]);
        break;

    case 'leave':
        $users = getOnlineUsers();
        unset($users[$userId]);
        saveOnlineUsers($users);
        
        echo json_encode([
            'success' => true
        ]);
        break;
}
?> 