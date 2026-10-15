<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

include "api_conexao.php";

$credential = trim($_POST["credential"] ?? "");

if (!$credential) {
    echo json_encode(["sucesso" => false, "erro" => "Credencial do Google não recebida."]);
    exit;
}

$googleUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($credential);
$context = stream_context_create([
    "http" => [
        "timeout" => 15,
        "ignore_errors" => true
    ]
]);

$payload = @file_get_contents($googleUrl, false, $context);
if (!$payload) {
    echo json_encode(["sucesso" => false, "erro" => "Não foi possível validar o token do Google."]);
    exit;
}

$dados = json_decode($payload, true);
if (!is_array($dados) || empty($dados["email"])) {
    echo json_encode(["sucesso" => false, "erro" => "Token inválido do Google."]);
    exit;
}

if (($dados["email_verified"] ?? false) !== true) {
    echo json_encode(["sucesso" => false, "erro" => "Conta do Google não verificada."]);
    exit;
}

$email = strtolower(trim($dados["email"]));
$nome = trim($dados["name"] ?? explode("@", $email)[0]);

if (!$email) {
    echo json_encode(["sucesso" => false, "erro" => "E-mail do Google não encontrado."]);
    exit;
}

$buscar = $conn->prepare("SELECT id, nome, email, senha, nome_responsavel, email_responsavel, data_nascimento, idade FROM usuarios WHERE email = ? LIMIT 1");
$buscar->bind_param("s", $email);
$buscar->execute();
$resultado = $buscar->get_result();

if ($resultado->num_rows > 0) {
    $usuario = $resultado->fetch_assoc();

    $atualizar = $conn->prepare("UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?");
    $atualizar->bind_param("i", $usuario["id"]);
    $atualizar->execute();

    echo json_encode([
        "sucesso" => true,
        "usuario" => [
            "id" => intval($usuario["id"]),
            "nome" => $usuario["nome"],
            "email" => $usuario["email"],
            "nome_responsavel" => $usuario["nome_responsavel"] ?? "",
            "email_responsavel" => $usuario["email_responsavel"] ?? "",
            "data_nascimento" => $usuario["data_nascimento"] ?? null,
            "idade" => intval($usuario["idade"] ?? 0)
        ]
    ]);

    $buscar->close();
    $conn->close();
    exit;
}

$senhaPadrao = password_hash("google_" . bin2hex(random_bytes(12)), PASSWORD_DEFAULT);
$idadePadrao = 13;
$generoPadrao = "outro";

$inserir = $conn->prepare("INSERT INTO usuarios (nome, email, idade, genero, senha, criado_em, ultimo_acesso) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
$inserir->bind_param("ssiss", $nome, $email, $idadePadrao, $generoPadrao, $senhaPadrao);

if ($inserir->execute()) {
    $novoId = $conn->insert_id;

    echo json_encode([
        "sucesso" => true,
        "usuario" => [
            "id" => intval($novoId),
            "nome" => $nome,
            "email" => $email,
            "nome_responsavel" => "",
            "email_responsavel" => "",
            "data_nascimento" => null,
            "idade" => $idadePadrao
        ]
    ]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Não foi possível criar o usuário do Google."]);
}

$inserir->close();
$conn->close();
