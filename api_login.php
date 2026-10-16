<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");
session_start();

include "api_conexao.php";

garantirUsuarioAdminPadrao($conn);

$rawBody = file_get_contents('php://input');
$entrada = is_array($_POST) ? $_POST : [];

if (is_string($rawBody) && trim($rawBody) !== '') {
    $rawBody = preg_replace('/^\xEF\xBB\xBF/', '', $rawBody);
    $rawBody = trim($rawBody);
    $jsonDados = json_decode($rawBody, true);

    if (is_array($jsonDados) && !empty($jsonDados)) {
        $entrada = $jsonDados;
    } else {
        parse_str($rawBody, $dadosParseados);
        if (is_array($dadosParseados) && !empty($dadosParseados)) {
            $entrada = $dadosParseados;
        }
    }
}

$email = trim((string) ($entrada["email"] ?? $_POST["email"] ?? ""));
$senha = (string) ($entrada["senha"] ?? $_POST["senha"] ?? "");

if (!$email || !$senha) {
    echo json_encode(["sucesso" => false, "erro" => "Preencha e-mail e senha!"]);
    exit;
}

$buscar = $conn->prepare("SELECT id, nome, email, senha, idade, data_nascimento, nome_responsavel, email_responsavel, status, is_admin FROM usuarios WHERE email = ? LIMIT 1");
$buscar->bind_param("s", $email);
$buscar->execute();
$resultado = $buscar->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(["sucesso" => false, "erro" => "E-mail não encontrado!"]);
    $buscar->close();
    $conn->close();
    exit;
}

$usuario = $resultado->fetch_assoc();

if (password_verify($senha, $usuario["senha"])) {
    $statusUsuario = $usuario["status"] ?? "aprovado";
    $adminFlag = intval($usuario["is_admin"] ?? 0);

    if ($statusUsuario !== "aprovado" && !$adminFlag) {
        echo json_encode(["sucesso" => false, "erro" => "Sua conta ainda está pendente de aprovação pelo administrador."]);
        $buscar->close();
        $conn->close();
        exit;
    }

    $atualizar = $conn->prepare("UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?");
    $atualizar->bind_param("i", $usuario["id"]);
    $atualizar->execute();
    $atualizar->close();

    $_SESSION["usuario_id"] = $usuario["id"];
    $_SESSION["usuario_nome"] = $usuario["nome"];

    echo json_encode([
        "sucesso" => true,
        "usuario" => [
            "id" => intval($usuario["id"]),
            "nome" => $usuario["nome"],
            "email" => $usuario["email"],
            "nome_responsavel" => $usuario["nome_responsavel"] ?? "",
            "email_responsavel" => $usuario["email_responsavel"] ?? "",
            "data_nascimento" => $usuario["data_nascimento"] ?? null,
            "idade" => intval($usuario["idade"] ?? 0),
            "status" => $statusUsuario,
            "is_admin" => $adminFlag
        ]
    ]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Senha incorreta!"]);
}

$buscar->close();
$conn->close();
?>