<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'api_conexao.php';

// Listar não lidas
$res = $pdo->query("SELECT * FROM notificacoes WHERE lida = 0 ORDER BY criado_em DESC");
$lista = $res->fetchAll(PDO::FETCH_ASSOC);

// Marcar como lidas
$pdo->exec("UPDATE notificacoes SET lida = 1 WHERE lida = 0");

echo json_encode([
    'contagem' => count($lista),
    'notificacoes' => $lista
]);