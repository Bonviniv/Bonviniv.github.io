<?php
header('Content-Type: application/json');

$action = $_POST['action'] ?? '';
$codigo = $_POST['codigo'] ?? '';

function verificarBatalha($codigo) {
    $batalhas = json_decode(file_get_contents('batalhas.json'), true) ?? [];
    return isset($batalhas[$codigo]);
}

function criarBatalha($codigo) {
    $batalhas = json_decode(file_get_contents('batalhas.json'), true) ?? [];
    if (!isset($batalhas[$codigo])) {
        $batalhas[$codigo] = [
            'usuarios' => 1,
            'ultima_atualizacao' => time()
        ];
        file_put_contents('batalhas.json', json_encode($batalhas));
        return true;
    }
    return false;
}

function atualizarContador($codigo) {
    $batalhas = json_decode(file_get_contents('batalhas.json'), true) ?? [];
    if (isset($batalhas[$codigo])) {
        $batalhas[$codigo]['usuarios'] = isset($_POST['entrada']) ? 
            $batalhas[$codigo]['usuarios'] + 1 : 
            $batalhas[$codigo]['usuarios'];
        $batalhas[$codigo]['ultima_atualizacao'] = time();
        file_put_contents('batalhas.json', json_encode($batalhas));
        return $batalhas[$codigo]['usuarios'];
    }
    return 0;
}

function getBatalhas() {
    if (file_exists('batalhas.json')) {
        $conteudo = file_get_contents('batalhas.json');
        $batalhas = json_decode($conteudo, true);
        return is_array($batalhas) ? $batalhas : [];
    }
    return [];
}

function saveBatalhas($batalhas) {
    file_put_contents('batalhas.json', json_encode($batalhas, JSON_PRETTY_PRINT));
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$action = $data['action'] ?? '';
$codigo = $data['codigo'] ?? '';

error_log("Recebida ação: " . $action);
error_log("Dados recebidos: " . print_r($data, true));

switch($action) {
    case 'verificar':
        echo json_encode(['existe' => verificarBatalha($codigo)]);
        break;
    case 'criar':
        echo json_encode(['sucesso' => criarBatalha($codigo)]);
        break;
    case 'atualizar':
        echo json_encode(['usuarios' => atualizarContador($codigo)]);
        break;
    case 'registrar_jogador':
        $nome = $data['nome'] ?? '';
        
        if (empty($codigo) || empty($nome)) {
            echo json_encode([
                'success' => false,
                'message' => 'Código ou nome inválido'
            ]);
            break;
        }

        $batalhas = getBatalhas();
        
        if (!isset($batalhas[$codigo])) {
            $batalhas[$codigo] = ['jogadores' => []];
        }
        
        // Registra ou atualiza o jogador
        $batalhas[$codigo]['jogadores'][$nome] = $batalhas[$codigo]['jogadores'][$nome] ?? 0;
        saveBatalhas($batalhas);
        
        echo json_encode([
            'success' => true,
            'message' => 'Jogador registrado',
            'jogadores' => $batalhas[$codigo]['jogadores']
        ]);
        break;
    case 'listar_jogadores':
        if (empty($codigo)) {
            echo json_encode([
                'success' => false,
                'message' => 'Código inválido'
            ]);
            break;
        }

        $batalhas = getBatalhas();
        $jogadores = isset($batalhas[$codigo]['jogadores']) ? 
                    $batalhas[$codigo]['jogadores'] : [];
        
        echo json_encode([
            'success' => true,
            'jogadores' => $jogadores
        ]);
        break;
    case 'remover_jogador':
        $nome = $data['nome'] ?? '';
        
        if (empty($codigo) || empty($nome)) {
            echo json_encode([
                'success' => false,
                'message' => 'Código ou nome inválido'
            ]);
            break;
        }

        $batalhas = getBatalhas();
        
        if (isset($batalhas[$codigo]['jogadores'][$nome])) {
            unset($batalhas[$codigo]['jogadores'][$nome]);
            saveBatalhas($batalhas);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Jogador removido'
        ]);
        break;
    case 'incrementar_vitorias':
        $nome = $_POST['nome'] ?? '';
        $batalhas = getBatalhas();
        if (isset($batalhas[$codigo]['jogadores'][$nome])) {
            $batalhas[$codigo]['jogadores'][$nome]++;
            saveBatalhas($batalhas);
        }
        echo json_encode(['success' => true]);
        break;
}
?> 