<?php
$servidor = "127.0.0.1";
$usuario = "root";
$senha = "";
$banco = "bestup";

$conn = new mysqli($servidor, $usuario, $senha, $banco);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        "sucesso" => false,
        "erro" => "Falha na conexão: " . $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");

function garantirUsuarioAdminPadrao($conn) {
    if (!$conn || !($conn instanceof mysqli)) {
        return;
    }

    $resultado = $conn->query("SELECT id FROM usuarios WHERE email = 'admin@gmail.com' LIMIT 1");
    if ($resultado && $resultado->num_rows > 0) {
        return;
    }

    $senhaHash = password_hash('123mudar', PASSWORD_DEFAULT);
    $nomeAdmin = 'Super Admin';
    $emailAdmin = 'admin@gmail.com';
    $idadeAdmin = 30;
    $generoAdmin = 'outro';

    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, idade, genero, status, is_admin, criado_em) VALUES (?, ?, ?, ?, ?, 'aprovado', 1, NOW())");
    if (!$stmt) {
        return;
    }

    $stmt->bind_param('sssis', $nomeAdmin, $emailAdmin, $senhaHash, $idadeAdmin, $generoAdmin);
    $stmt->execute();
    $stmt->close();
}

garantirUsuarioAdminPadrao($conn);
