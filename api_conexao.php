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
