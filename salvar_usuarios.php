<?php
header('Content-Type: application/json');

$usuarios = json_decode(file_get_contents('php://input'), true);

if (file_put_contents('users.json', json_encode($usuarios, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar arquivo']);
}
?> 