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

function garantirEstruturaUsuarios($conn) {
    if (!$conn || !($conn instanceof mysqli)) {
        return;
    }

    $colunas = [];
    $resultado = $conn->query("SHOW COLUMNS FROM usuarios");
    if ($resultado) {
        while ($linha = $resultado->fetch_assoc()) {
            $colunas[] = strtolower((string) $linha['Field']);
        }
    }

    $alteracoes = [];
    if (!in_array('nome_responsavel', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN nome_responsavel VARCHAR(100) NULL AFTER nome";
    }
    if (!in_array('email_responsavel', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN email_responsavel VARCHAR(150) NULL AFTER email";
    }
    if (!in_array('data_nascimento', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN data_nascimento DATE NULL AFTER email_responsavel";
    }
    if (!in_array('idade', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN idade INT NOT NULL DEFAULT 0 AFTER data_nascimento";
    }
    if (!in_array('genero', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN genero VARCHAR(30) NOT NULL DEFAULT 'outro' AFTER idade";
    }
    if (!in_array('status', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'pendente' AFTER genero";
    }
    if (!in_array('is_admin', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER status";
    }
    if (!in_array('ultimo_acesso', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN ultimo_acesso DATETIME NULL AFTER criado_em";
    }
    if (!in_array('aprovado_em', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN aprovado_em DATETIME NULL AFTER ultimo_acesso";
    }
    if (!in_array('criado_em', $colunas, true)) {
        $alteracoes[] = "ADD COLUMN criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP";
    }

    foreach ($alteracoes as $sql) {
        $conn->query("ALTER TABLE usuarios $sql");
    }
}

function garantirUsuarioAdminPadrao($conn) {
    if (!$conn || !($conn instanceof mysqli)) {
        return;
    }

    garantirEstruturaUsuarios($conn);

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
