<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

include "api_conexao.php";

$nome = trim((string) ($_POST["nome"] ?? ""));
$nomeResponsavel = trim((string) ($_POST["nome_responsavel"] ?? ""));
$emailResponsavel = trim((string) ($_POST["email_responsavel"] ?? ""));
$email = trim((string) ($_POST["email"] ?? ""));
$dataNascimento = trim((string) ($_POST["data_nascimento"] ?? ""));
$idade = intval($_POST["idade"] ?? 0);
$genero = trim((string) ($_POST["genero"] ?? ""));
$senha = $_POST["senha"] ?? "";

if (!$nome || !$email || !$idade || !$genero || strlen($senha) < 4) {
    echo json_encode(["sucesso" => false, "erro" => "Preencha todos os campos corretamente!"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["sucesso" => false, "erro" => "Email inválido!"]);
    exit;
}

if ($nomeResponsavel !== '' && $emailResponsavel !== '' && !filter_var($emailResponsavel, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["sucesso" => false, "erro" => "E-mail do responsável inválido!"]);
    exit;
}

$verificar = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$verificar->bind_param("s", $email);
$verificar->execute();
$verificar->store_result();

if ($verificar->num_rows > 0) {
    echo json_encode(["sucesso" => false, "erro" => "Este e-mail já está cadastrado! Faça login."]);
    $verificar->close();
    $conn->close();
    exit;
}
$verificar->close();

$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

$colunas = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'nome_responsavel'");
$temExtras = $colunas && $colunas->num_rows > 0;

if ($temExtras) {
    $inserir = $conn->prepare("INSERT INTO usuarios (nome, nome_responsavel, email_responsavel, email, data_nascimento, idade, genero, senha, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
    $inserir->bind_param("sssssiis", $nome, $nomeResponsavel, $emailResponsavel, $email, $dataNascimento, $idade, $genero, $senhaHash);
} else {
    $inserir = $conn->prepare("INSERT INTO usuarios (nome, email, idade, genero, senha, criado_em) VALUES (?, ?, ?, ?, ?, NOW())");
    $inserir->bind_param("ssiss", $nome, $email, $idade, $genero, $senhaHash);
}

if ($inserir->execute()) {
    echo json_encode(["sucesso" => true, "mensagem" => "Conta criada com sucesso! ✅ Faça login."]);
} else {
    echo json_encode(["sucesso" => false, "erro" => "Erro ao cadastrar: " . $conn->error]);
}

$inserir->close();
$conn->close();
?>