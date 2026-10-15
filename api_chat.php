<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'api_conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);
$acao = $dados['acao'] ?? '';

// Salvar mensagem na conversa
if ($acao === 'salvar') {
    $usuario_nome = trim($dados['usuario_nome'] ?? '');
    $mensagem = trim($dados['mensagem'] ?? '');
    $origem = $dados['origem'] ?? 'usuario';

    if (!$usuario_nome || !$mensagem) {
        echo json_encode(['erro' => 'Dados incompletos 💜']);
        exit;
    }

    // Buscar ID do usuário pelo nome
    $buscar = $conn->prepare("SELECT id FROM usuarios WHERE nome = ? LIMIT 1");
    $buscar->bind_param('s', $usuario_nome);
    $buscar->execute();
    $resultado = $buscar->get_result();
    
    if ($resultado->num_rows === 0) {
        echo json_encode(['erro' => 'Usuário não encontrado 💜']);
        exit;
    }
    
    $usuario = $resultado->fetch_assoc();
    $usuario_id = $usuario['id'];

    // Inserir mensagem
    $stmt = $conn->prepare("INSERT INTO conversas (usuario_id, mensagem, origem, criado_em) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param('iss', $usuario_id, $mensagem, $origem);
    
    if ($stmt->execute()) {
        echo json_encode(['sucesso' => 'Mensagem salva 💜']);
    } else {
        echo json_encode(['erro' => 'Erro ao salvar: ' . $conn->error]);
    }
    exit;
}

// Carregar histórico de conversa
if ($acao === 'carregar') {
    $usuario_nome = trim($dados['usuario_nome'] ?? '');
    
    $buscar = $conn->prepare("SELECT id FROM usuarios WHERE nome = ? LIMIT 1");
    $buscar->bind_param('s', $usuario_nome);
    $buscar->execute();
    $resultado = $buscar->get_result();
    
    if ($resultado->num_rows === 0) {
        echo json_encode(['conversa' => []]);
        exit;
    }
    
    $usuario = $resultado->fetch_assoc();
    $usuario_id = $usuario['id'];

    $stmt = $conn->prepare("SELECT mensagem, origem, criado_em FROM conversas WHERE usuario_id = ? ORDER BY criado_em ASC");
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $res = $stmt->get_result();
    
    $conversa = [];
    while ($linha = $res->fetch_assoc()) {
        $conversa[] = $linha;
    }
    
    echo json_encode(['conversa' => $conversa]);
    exit;
}

// Salvar registro de humor
if ($acao === 'salvar_humor') {
    $usuario_nome = trim($dados['usuario_nome'] ?? '');
    $data = $dados['data'] ?? date('Y-m-d');
    $humor = $dados['humor'] ?? '';
    $anotacao = trim($dados['anotacao'] ?? '');

    $buscar = $conn->prepare("SELECT id FROM usuarios WHERE nome = ? LIMIT 1");
    $buscar->bind_param('s', $usuario_nome);
    $buscar->execute();
    $resultado = $buscar->get_result();
    
    if ($resultado->num_rows === 0) {
        echo json_encode(['erro' => 'Usuário não encontrado 💜']);
        exit;
    }
    
    $usuario = $resultado->fetch_assoc();
    $usuario_id = $usuario['id'];

    // Verificar se já existe registro para o dia
    $verificar = $conn->prepare("SELECT id FROM registros WHERE usuario_id = ? AND data = ? LIMIT 1");
    $verificar->bind_param('is', $usuario_id, $data);
    $verificar->execute();
    
    if ($verificar->get_result()->num_rows > 0) {
        $stmt = $conn->prepare("UPDATE registros SET humor = ?, anotacao = ? WHERE usuario_id = ? AND data = ?");
        $stmt->bind_param('ssis', $humor, $anotacao, $usuario_id, $data);
    } else {
        $stmt = $conn->prepare("INSERT INTO registros (usuario_id, data, humor, anotacao) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('isss', $usuario_id, $data, $humor, $anotacao);
    }
    
    if ($stmt->execute()) {
        echo json_encode(['sucesso' => 'Humor registrado 💜']);
    } else {
        echo json_encode(['erro' => 'Erro ao registrar: ' . $conn->error]);
    }
    exit;
}

// Carregar registros de humor
if ($acao === 'carregar_humor') {
    $usuario_nome = trim($dados['usuario_nome'] ?? '');
    $mes = $dados['mes'] ?? date('m');
    $ano = $dados['ano'] ?? date('Y');

    $buscar = $conn->prepare("SELECT id FROM usuarios WHERE nome = ? LIMIT 1");
    $buscar->bind_param('s', $usuario_nome);
    $buscar->execute();
    $resultado = $buscar->get_result();
    
    if ($resultado->num_rows === 0) {
        echo json_encode(['registros' => []]);
        exit;
    }
    
    $usuario = $resultado->fetch_assoc();
    $usuario_id = $usuario['id'];

    $inicio = "$ano-$mes-01";
    $fim = date("Y-m-t", strtotime($inicio));

    $stmt = $conn->prepare("SELECT data, humor, anotacao FROM registros WHERE usuario_id = ? AND data BETWEEN ? AND ? ORDER BY data ASC");
    $stmt->bind_param('iss', $usuario_id, $inicio, $fim);
    $stmt->execute();
    $res = $stmt->get_result();
    
    $registros = [];
    while ($linha = $res->fetch_assoc()) {
        $registros[] = $linha;
    }
    
    echo json_encode(['registros' => $registros]);
    exit;
}

echo json_encode(['erro' => 'Ação inválida 💜']);
?>