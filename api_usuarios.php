<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'api_conexao.php';

function garantirTabelasAdmin($conn) {
    $sqls = [
        "CREATE TABLE IF NOT EXISTS admin_pii (
            id INT AUTO_INCREMENT PRIMARY KEY,
            valor VARCHAR(255) NOT NULL,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_admin_pii (valor)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS admin_faixas_temas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(150) NOT NULL,
            tema VARCHAR(150) NOT NULL,
            idade_min INT NOT NULL DEFAULT 0,
            idade_max INT NOT NULL DEFAULT 120,
            permitido TINYINT(1) NOT NULL DEFAULT 1,
            motivo TEXT NOT NULL,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS admin_alertas_temas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            idade_min INT NOT NULL DEFAULT 0,
            idade_max INT NOT NULL DEFAULT 120,
            descricao TEXT NOT NULL,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
        "CREATE TABLE IF NOT EXISTS admin_alertas_conversa (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario VARCHAR(150) NOT NULL,
            email VARCHAR(200) DEFAULT NULL,
            horario DATETIME NOT NULL,
            motivos TEXT NOT NULL,
            texto TEXT DEFAULT NULL,
            tipo VARCHAR(50) NOT NULL DEFAULT 'tema_sensiveis',
            status VARCHAR(30) NOT NULL DEFAULT 'pendente',
            revisado_em DATETIME NULL DEFAULT NULL,
            resolvido_em DATETIME NULL DEFAULT NULL,
            observacao TEXT DEFAULT NULL,
            criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    ];

    foreach ($sqls as $sql) {
        $conn->query($sql);
    }

    $conn->query("ALTER TABLE admin_alertas_conversa ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'pendente'");
    $conn->query("ALTER TABLE admin_alertas_conversa ADD COLUMN IF NOT EXISTS revisado_em DATETIME NULL DEFAULT NULL");
    $conn->query("ALTER TABLE admin_alertas_conversa ADD COLUMN IF NOT EXISTS resolvido_em DATETIME NULL DEFAULT NULL");
    $conn->query("ALTER TABLE admin_alertas_conversa ADD COLUMN IF NOT EXISTS observacao TEXT DEFAULT NULL");
}

garantirTabelasAdmin($conn);

$rawBody = file_get_contents('php://input');
$dados = [];

if (!empty($rawBody)) {
    $jsonDados = json_decode($rawBody, true);
    if (is_array($jsonDados)) {
        $dados = $jsonDados;
    } else {
        parse_str($rawBody, $dados);
    }
}

if (!is_array($dados) || empty($dados)) {
    $dados = $_POST;
}
$acao = $dados['acao'] ?? '';

if ($acao === 'listar_admin_configuracoes') {
    $pii = [];
    $res = $conn->query("SELECT valor FROM admin_pii ORDER BY id ASC");
    while ($linha = $res->fetch_assoc()) {
        $pii[] = $linha['valor'];
    }

    $faixas = [];
    $res = $conn->query("SELECT nome, tema, idade_min, idade_max, permitido, motivo FROM admin_faixas_temas ORDER BY id DESC");
    while ($linha = $res->fetch_assoc()) {
        $faixas[] = [
            'nome' => $linha['nome'],
            'tema' => $linha['tema'],
            'idadeMin' => intval($linha['idade_min']),
            'idadeMax' => intval($linha['idade_max']),
            'permitido' => (bool) $linha['permitido'],
            'motivo' => $linha['motivo']
        ];
    }

    $alertas = [];
    $res = $conn->query("SELECT titulo, idade_min, idade_max, descricao FROM admin_alertas_temas ORDER BY id DESC");
    while ($linha = $res->fetch_assoc()) {
        $alertas[] = [
            'titulo' => $linha['titulo'],
            'idadeMin' => intval($linha['idade_min']),
            'idadeMax' => intval($linha['idade_max']),
            'descricao' => $linha['descricao']
        ];
    }

    $alertasConversa = [];
    $res = $conn->query("SELECT id, usuario, email, horario, motivos, texto, tipo, status, revisado_em, resolvido_em, observacao FROM admin_alertas_conversa ORDER BY id DESC LIMIT 25");
    while ($linha = $res->fetch_assoc()) {
        $alertasConversa[] = [
            'id' => intval($linha['id']),
            'usuario' => $linha['usuario'],
            'email' => $linha['email'],
            'horario' => $linha['horario'],
            'motivos' => $linha['motivos'] !== '' ? json_decode($linha['motivos'], true) ?: [$linha['motivos']] : [],
            'texto' => $linha['texto'],
            'tipo' => $linha['tipo'],
            'status' => $linha['status'] ?? 'pendente',
            'revisado_em' => $linha['revisado_em'],
            'resolvido_em' => $linha['resolvido_em'],
            'observacao' => $linha['observacao']
        ];
    }

    echo json_encode(['sucesso' => true, 'pii' => $pii, 'faixas' => $faixas, 'alertas' => $alertas, 'alertas_conversa' => $alertasConversa]);
    exit;
}

if ($acao === 'salvar_pii_admin') {
    $valor = $dados['valor'] ?? $dados['dados'] ?? '[]';
    $lista = json_decode($valor, true);
    if (!is_array($lista)) {
        $lista = array_map('trim', preg_split('/\n|,|;/', (string) $valor));
        $lista = array_values(array_filter(array_unique(array_filter($lista, fn($item) => $item !== ''))));
    }

    $conn->query('DELETE FROM admin_pii');
    $stmt = $conn->prepare('INSERT INTO admin_pii (valor) VALUES (?)');
    foreach ($lista as $item) {
        $valorItem = trim((string) $item);
        if ($valorItem !== '') {
            $stmt->bind_param('s', $valorItem);
            $stmt->execute();
        }
    }

    echo json_encode(['sucesso' => true, 'pii' => $lista]);
    exit;
}

if ($acao === 'salvar_faixa_admin') {
    $registro = json_decode((string) ($dados['dados'] ?? '{}'), true);
    if (!is_array($registro) || empty($registro['nome']) || empty($registro['tema']) || empty($registro['motivo'])) {
        echo json_encode(['erro' => 'Dados da faixa inválidos.']);
        exit;
    }

    $stmt = $conn->prepare('INSERT INTO admin_faixas_temas (nome, tema, idade_min, idade_max, permitido, motivo) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('ssiiis', $registro['nome'], $registro['tema'], intval($registro['idadeMin'] ?? 0), intval($registro['idadeMax'] ?? 120), intval((bool) ($registro['permitido'] ?? 1)), $registro['motivo']);
    echo json_encode(['sucesso' => $stmt->execute()]);
    exit;
}

if ($acao === 'salvar_alerta_admin') {
    $registro = json_decode((string) ($dados['dados'] ?? '{}'), true);
    if (!is_array($registro) || empty($registro['titulo']) || empty($registro['descricao'])) {
        echo json_encode(['erro' => 'Dados do alerta inválidos.']);
        exit;
    }

    $stmt = $conn->prepare('INSERT INTO admin_alertas_temas (titulo, idade_min, idade_max, descricao) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('siis', $registro['titulo'], intval($registro['idadeMin'] ?? 0), intval($registro['idadeMax'] ?? 120), $registro['descricao']);
    echo json_encode(['sucesso' => $stmt->execute()]);
    exit;
}

if ($acao === 'registrar_alerta_conversa') {
    $registro = json_decode((string) ($dados['dados'] ?? '{}'), true);
    if (!is_array($registro)) {
        echo json_encode(['erro' => 'Dados do alerta inválidos.']);
        exit;
    }

    $motivos = $registro['motivos'] ?? [];
    $usuario = trim((string) ($registro['usuario'] ?? 'Usuário'));
    $email = trim((string) ($registro['email'] ?? ''));
    $texto = trim((string) ($registro['texto'] ?? ''));
    $horario = !empty($registro['horario']) ? $registro['horario'] : date('Y-m-d H:i:s');

    $stmt = $conn->prepare('INSERT INTO admin_alertas_conversa (usuario, email, horario, motivos, texto, tipo, status) VALUES (?, ?, ?, ?, ?, ?, "pendente")');
    $stmt->bind_param('ssssss', $usuario, $email, $horario, json_encode($motivos), $texto, 'tema_sensiveis');
    echo json_encode(['sucesso' => $stmt->execute()]);
    exit;
}

if ($acao === 'atualizar_status_alerta') {
    $registro = json_decode((string) ($dados['dados'] ?? '{}'), true);
    $id = intval($registro['id'] ?? $dados['id'] ?? 0);
    $status = trim((string) ($registro['status'] ?? $dados['status'] ?? 'pendente'));
    $observacao = trim((string) ($registro['observacao'] ?? $dados['observacao'] ?? ''));

    if ($id <= 0) {
        echo json_encode(['erro' => 'Alerta inválido.']);
        exit;
    }

    if (!in_array($status, ['pendente', 'lida', 'resolvida'], true)) {
        echo json_encode(['erro' => 'Status inválido.']);
        exit;
    }

    $revisadoEm = $status === 'lida' || $status === 'resolvida' ? date('Y-m-d H:i:s') : null;
    $resolvidoEm = $status === 'resolvida' ? date('Y-m-d H:i:s') : null;

    $stmt = $conn->prepare('UPDATE admin_alertas_conversa SET status = ?, revisado_em = ?, resolvido_em = ?, observacao = ? WHERE id = ?');
    $stmt->bind_param('ssssi', $status, $revisadoEm, $resolvidoEm, $observacao, $id);
    echo json_encode(['sucesso' => $stmt->execute()]);
    exit;
}

if ($acao === 'cadastrar') {
    $nome = trim((string) ($dados['nome'] ?? ''));
    $nomeResponsavel = trim((string) ($dados['nome_responsavel'] ?? ''));
    $emailResponsavel = trim((string) ($dados['email_responsavel'] ?? ''));
    $email = trim((string) ($dados['email'] ?? ''));
    $dataNascimento = trim((string) ($dados['data_nascimento'] ?? ''));
    $idade = intval($dados['idade'] ?? 0);
    $genero = trim((string) ($dados['genero'] ?? 'outro'));
    $senha = (string) ($dados['senha'] ?? '');

    if (!$nome || !$email || !$idade || !$genero || strlen($senha) < 4) {
        echo json_encode(['erro' => 'Preencha todos os campos corretamente 💜']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['erro' => 'Email inválido 💜']);
        exit;
    }

    if ($emailResponsavel !== '' && !filter_var($emailResponsavel, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['erro' => 'E-mail do responsável inválido 💜']);
        exit;
    }

    if ($idade < 1 || $idade > 120) {
        echo json_encode(['erro' => 'Idade inválida 💜']);
        exit;
    }

    $verificar = $conn->prepare("SELECT id FROM usuarios WHERE nome = ? OR email = ? LIMIT 1");
    $verificar->bind_param('ss', $nome, $email);
    $verificar->execute();
    if ($verificar->get_result()->num_rows > 0) {
        echo json_encode(['erro' => 'Já existe uma conta com esses dados 💜']);
        exit;
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $colunasExtras = $conn->query("SHOW COLUMNS FROM usuarios LIKE 'nome_responsavel'");
    $temExtras = $colunasExtras && $colunasExtras->num_rows > 0;

    if ($temExtras) {
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, nome_responsavel, email_responsavel, email, data_nascimento, idade, genero, status, senha) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', ?)");
        $stmt->bind_param('sssssiis', $nome, $nomeResponsavel, $emailResponsavel, $email, $dataNascimento, $idade, $genero, $senhaHash);
    } else {
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, idade, genero, status, senha) VALUES (?, ?, ?, ?, 'pendente', ?)");
        $stmt->bind_param('ssiss', $nome, $email, $idade, $genero, $senhaHash);
    }

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => 'Sua conta foi criada e está pendente de aprovação pelo administrador 💜']);
    } else {
        echo json_encode(['erro' => 'Erro ao cadastrar 💜']);
    }
    exit;
}

if ($acao === 'cadastrar_admin') {
    $nome = trim((string) ($dados['nome'] ?? ''));
    $email = trim((string) ($dados['email'] ?? ''));
    $senha = (string) ($dados['senha'] ?? '');
    $idade = intval($dados['idade'] ?? 0);
    $genero = trim((string) ($dados['genero'] ?? 'outro'));

    if (!$nome || !$email || !$senha || $idade < 1 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['erro' => 'Dados do usuário inválidos.']);
        exit;
    }

    $verificar = $conn->prepare("SELECT id FROM usuarios WHERE email = ? LIMIT 1");
    $verificar->bind_param('s', $email);
    $verificar->execute();
    if ($verificar->get_result()->num_rows > 0) {
        echo json_encode(['erro' => 'Esse e-mail já está em uso.']);
        exit;
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, idade, genero, status, is_admin, senha, criado_em) VALUES (?, ?, ?, ?, 'aprovado', 0, ?, NOW())");
    $stmt->bind_param('ssiss', $nome, $email, $idade, $genero, $senhaHash);

    if ($stmt->execute()) {
        echo json_encode(['sucesso' => 'Usuário cadastrado com sucesso!']);
    } else {
        echo json_encode(['erro' => 'Erro ao cadastrar usuário.']);
    }
    exit;
}

if ($acao === 'login') {
    $email = trim((string) ($dados['email'] ?? ''));
    $senha = (string) ($dados['senha'] ?? '');

    $stmt = $conn->prepare("SELECT id, nome, senha, idade, data_nascimento, nome_responsavel, email_responsavel, status, is_admin FROM usuarios WHERE email = ? LIMIT 1");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 1) {
        $u = $res->fetch_assoc();
        if (password_verify($senha, $u['senha'])) {
            $statusUsuario = $u['status'] ?? 'aprovado';
            $adminFlag = intval($u['is_admin'] ?? 0);

            if ($statusUsuario !== 'aprovado' && !$adminFlag) {
                echo json_encode(['erro' => 'Sua conta ainda está pendente de aprovação pelo administrador.']);
                exit;
            }

            $upd = $conn->prepare("UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?");
            $upd->bind_param('i', $u['id']);
            $upd->execute();

            echo json_encode([
                'sucesso' => true,
                'id' => intval($u['id']),
                'nome_usuario' => $u['nome'],
                'email' => $email,
                'nome_responsavel' => $u['nome_responsavel'] ?? '',
                'email_responsavel' => $u['email_responsavel'] ?? '',
                'data_nascimento' => $u['data_nascimento'] ?? null,
                'idade' => intval($u['idade'] ?? 0),
                'status' => $statusUsuario,
                'is_admin' => $adminFlag
            ]);
        } else {
            echo json_encode(['erro' => 'Email ou senha incorretos 💜']);
        }
    } else {
        echo json_encode(['erro' => 'Email ou senha incorretos 💜']);
    }
    exit;
}

if ($acao === 'listar_usuarios') {
    $resultado = $conn->query("SELECT id, nome, email, idade, genero, status, is_admin, criado_em FROM usuarios ORDER BY FIELD(status, 'pendente', 'aprovado', 'rejeitado') ASC, criado_em DESC");
    $usuarios = [];
    while ($linha = $resultado->fetch_assoc()) {
        $usuarios[] = $linha;
    }
    echo json_encode(['sucesso' => true, 'usuarios' => $usuarios]);
    exit;
}

if ($acao === 'aprovar_usuario') {
    $id = intval($dados['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['erro' => 'Usuário inválido.']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE usuarios SET status = 'aprovado', aprovado_em = NOW() WHERE id = ?");
    $stmt->bind_param('i', $id);
    echo json_encode(['sucesso' => $stmt->execute()]);
    exit;
}

if ($acao === 'rejeitar_usuario') {
    $id = intval($dados['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['erro' => 'Usuário inválido.']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE usuarios SET status = 'rejeitado' WHERE id = ?");
    $stmt->bind_param('i', $id);
    echo json_encode(['sucesso' => $stmt->execute()]);
    exit;
}

echo json_encode(['erro' => 'Ação inválida 💜']);
?>