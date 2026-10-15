<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require_once 'api_conexao.php';

$dados = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$texto = trim($dados['texto'] ?? '');
$usuario_id = intval($dados['usuario_id'] ?? 0);

if (!$texto) {
    echo json_encode(['sucesso' => true, 'acao' => 'normal']);
    exit;
}

$texto_min = mb_strtolower($texto);

// Pegar regras
$res = $pdo->query("SELECT * FROM regras_seguranca WHERE ativo = 1");
$regras = $res->fetchAll(PDO::FETCH_ASSOC);

$correspondencia = null;

foreach ($regras as $regra) {
    $termos = explode(',', $regra['palavra_chave']);
    foreach ($termos as $termo) {
        $termo = trim(mb_strtolower($termo));
        if ($termo && str_contains($texto_min, $termo)) {
            $correspondencia = $regra;
            break 2;
        }
    }
}

// Se não encontrou = conversa normal
if (!$correspondencia) {
    echo json_encode(['sucesso' => true, 'acao' => 'normal']);
    exit;
}

// Salvar notificação se for risco
if ($correspondencia['acao'] === 'notificar_admin' && $usuario_id) {
    $pdo->prepare("INSERT INTO notificacoes 
        (usuario_id, tipo, mensagem, nivel) VALUES (?, ?, ?, 'grave')")
        ->execute([
            $usuario_id,
            $correspondencia['categoria'],
            $correspondencia['mensagem_alerta']
        ]);
}

echo json_encode([
    'sucesso' => true,
    'acao' => $correspondencia['acao'],
    'categoria' => $correspondencia['categoria'],
    'resposta' => $correspondencia['mensagem_alerta'],
    'alerta_cvv' => $correspondencia['acao'] === 'notificar_admin'
]);