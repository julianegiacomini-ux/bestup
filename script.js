const API_URL = window.location.origin + "/BestUp/";
let sintese = window.speechSynthesis;
let reconhecimento = null;
let usuarioLogado = null;

// =============================================
// DECLARAR FUNÇÕES GLOBALMENTE
// =============================================
window.abrirAtividade = abrirAtividade;
window.voltarMenuKids = voltarMenuKids;
window.limparDesenho = limparDesenho;
window.salvarDesenho = salvarDesenho;
window.proximaEmocao = proximaEmocao;
window.tocarSom = tocarSom;
window.proximoSom = proximoSom;
window.reiniciarMemoria = reiniciarMemoria;
window.abrirKids = abrirKids;
window.abrirConfiguracoes = abrirConfiguracoes;
window.voltarPrincipal = voltarPrincipal;
window.mostrarAjudaReal = mostrarAjudaReal;
window.fecharModalAjuda = fecharModalAjuda;
window.sairDaConta = sairDaConta;
window.mostrarAba = mostrarAba;
window.alternarSenha = alternarSenha;
window.fazerLogin = fazerLogin;
window.fazerCadastro = fazerCadastro;
window.registrarHumor = registrarHumor;
window.enviarMensagem = enviarMensagem;
window.alternarMicrofone = alternarMicrofone;
window.recuperarSenha = recuperarSenha;
window.loginGoogle = loginGoogle;
window.abrirCalendario = abrirCalendario;
window.abrirDia = abrirDia;
window.aplicarTema = aplicarTema;
window.aplicarDecoracao = aplicarDecoracao;
window.selecionarFerramenta = selecionarFerramenta;
window.abrirPainelAdmin = abrirPainelAdmin;
window.cadastrarUsuarioAdmin = cadastrarUsuarioAdmin;
window.aprovarUsuario = aprovarUsuario;
window.rejeitarUsuario = rejeitarUsuario;
window.salvarPiiAdmin = salvarPiiAdmin;
window.salvarFaixaTemaAdmin = salvarFaixaTemaAdmin;
window.salvarAlertaTemaAdmin = salvarAlertaTemaAdmin;
window.marcarAlertaConversa = marcarAlertaConversa;

// =============================================
// DECORAÇÕES DO CHAT
// =============================================
const decoracoes = {
    nenhum: "",
    coracao: "🤍",
    flor: "🌸",
    estrela: "⭐",
    borboleta: "🦋",
    laco: "🎀"
};

// =============================================
// CORES E NOMES DO HUMOR
// =============================================
const corHumor = {
    muito_bom: "#90EE90",
    bom: "#FFD93D",
    mais_ou_menos: "#FFB74D",
    ruim: "#90CAF9",
    muito_ruim: "#CE93D8"
};
const nomeHumor = {
    muito_bom: "😄 Muito bom",
    bom: "🙂 Bom",
    mais_ou_menos: "😐 Mais ou menos",
    ruim: "😔 Ruim",
    muito_ruim: "😢 Muito ruim"
};

// =============================================
// MARCAS DA SEQUÊNCIA
// =============================================
const diasSequencia = [3, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

// =============================================
// FUNÇÕES DE DATA
// =============================================
function dataPadrao(data) {
    const d = data || new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
function dataISO(data) {
    const d = data || new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    if (Number.isNaN(nascimento.getTime())) return 0;

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const passouAniversario = hoje.getMonth() > nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() >= nascimento.getDate());

    if (!passouAniversario) idade -= 1;
    return idade;
}
function obterVersaoConfiguracao(usuario) {
    const idadeUsuario = Number(usuario?.idade || 0);
    const dataNascimento = usuario?.data_nascimento || usuario?.nascimento || usuario?.dataNascimento || null;
    const idadeReal = dataNascimento ? calcularIdade(dataNascimento) : idadeUsuario;
    return idadeReal <= 12 ? "crianca" : "adolescente";
}
function renderizarConfiguracoes() {
    const container = document.getElementById("config-variacao");
    if (!container) return;

    const usuario = usuarioLogado || JSON.parse(localStorage.getItem("usuario_logado") || "null");
    const versao = obterVersaoConfiguracao(usuario || {});

    const tematicas = [
        { nome: "Azul", valor: "azul", classe: "azul" },
        { nome: "Rosa", valor: "rosa", classe: "rosa" },
        { nome: "Lavanda", valor: "lavanda", classe: "lavanda" },
        { nome: "Mint", valor: "mint", classe: "mint" },
        { nome: "Pêssego", valor: "pessego", classe: "pessego" }
    ];

    const decoracoesDisponiveis = [
        { key: "laco", icon: "🎀" },
        { key: "coracao", icon: "🤍" },
        { key: "flor", icon: "🌸" },
        { key: "estrela", icon: "⭐" },
        { key: "borboleta", icon: "🦋" }
    ];

    const temaAtual = localStorage.getItem("tema_fundo") || "azul";
    const decorAtual = localStorage.getItem("decoracao_chat") || "nenhum";

    if (versao === "crianca") {
        container.innerHTML = `
            <div class="config-variacao crianca">
                <div class="config-topo">
                    <h3>Cor de fundo</h3>
                    <button class="botao-voltar-config" onclick="voltarPrincipal()">↩ Voltar</button>
                </div>
                <div class="config-grupo">
                    <div class="paleta-temas">
                        ${tematicas.map(item => `
                            <div class="cor-tema ${item.classe} ${temaAtual === item.valor ? 'selecionado' : ''}" data-tema="${item.valor}" onclick="aplicarTema('${item.valor}')"><span>${item.nome}</span></div>
                        `).join('')}
                    </div>
                </div>
                <div class="config-grupo">
                    <h4>Decoração do chat</h4>
                    <div class="config-selecao">
                        ${decoracoesDisponiveis.map(item => `
                            <button type="button" class="icone-decoracao ${item.key} ${decorAtual === item.key ? 'ativo' : ''}" title="${item.key}" data-decoracao="${item.key}" onclick="localStorage.setItem('decoracao_chat', '${item.key}'); aplicarDecoracao(); renderizarConfiguracoes();">${item.icon}</button>
                        `).join('')}
                    </div>
                </div>
                <button class="config-sair" onclick="sairDaConta()">Sair da conta</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="config-variacao adolescente">
                <div class="config-topo">
                    <h3>Cor de fundo</h3>
                    <button class="botao-voltar-config" onclick="voltarPrincipal()">↩ Voltar</button>
                </div>
                <div class="config-grupo">
                    <div class="paleta-temas">
                        ${tematicas.map(item => `
                            <div class="cor-tema ${item.classe} ${temaAtual === item.valor ? 'selecionado' : ''}" data-tema="${item.valor}" onclick="aplicarTema('${item.valor}')"><span>${item.nome}</span></div>
                        `).join('')}
                    </div>
                </div>
                <div class="config-grupo">
                    <h4>Decoração do chat</h4>
                    <p class="ajuda-texto">Escolha o que aparece do ladinho das mensagens:</p>
                    <select id="estilo-decoracao" onchange="aplicarDecoracao()">
                        <option value="nenhum" ${decorAtual === 'nenhum' ? 'selected' : ''}>Nenhum</option>
                        <option value="coracao" ${decorAtual === 'coracao' ? 'selected' : ''}>Corações 🤍</option>
                        <option value="flor" ${decorAtual === 'flor' ? 'selected' : ''}>Florzinha 🌸</option>
                        <option value="estrela" ${decorAtual === 'estrela' ? 'selected' : ''}>Estrela ⭐</option>
                        <option value="borboleta" ${decorAtual === 'borboleta' ? 'selected' : ''}>Borboleta 🦋</option>
                        <option value="laco" ${decorAtual === 'laco' ? 'selected' : ''}>Laço 🎀</option>
                    </select>
                </div>
                <button class="config-sair" onclick="sairDaConta()">Sair da conta</button>
            </div>
        `;
    }

    aplicarTema(temaAtual);
    const decoracaoEl = document.getElementById("estilo-decoracao");
    if (decoracaoEl) decoracaoEl.value = decorAtual;
    atualizarDecoracaoMensagens();
}

// =============================================
// LIMPAR TEXTO PARA VOZ
// =============================================
function limparTextoParaVoz(texto) {
    if (!texto) return "";
    return texto.replace(/[^\p{L}\p{N}\s.!?]/gu, " ").replace(/\s+/g, " ").trim();
}
function falar(texto) {
    const limpo = limparTextoParaVoz(texto);
    if (!limpo || !sintese) return;
    sintese.cancel();
    const fala = new SpeechSynthesisUtterance(limpo);
    fala.lang = "pt-BR";
    const velocidadeEl = document.getElementById("velocidade-voz");
    fala.rate = parseFloat(velocidadeEl?.value || 1);
    sintese.speak(fala);
}

// =============================================
// TEMA E DECORAÇÃO
// =============================================
function aplicarTema(cor) {
    if (!cor) cor = "azul";
    document.body.classList.remove("tema-azul", "tema-rosa", "tema-lavanda", "tema-mint", "tema-pessego");
    if (!document.body.classList.contains("tela-inicio")) {
        document.body.classList.add(`tema-${cor}`);
    }
    localStorage.setItem("tema_fundo", cor);
    document.querySelectorAll('.cor-tema').forEach(el => el.classList.remove('selecionado'));
    document.querySelector(`.cor-tema.${cor}`)?.classList.add('selecionado');
}
function aplicarDecoracao() {
    const escolha = document.getElementById("estilo-decoracao")?.value || "nenhum";
    localStorage.setItem("decoracao_chat", escolha);
    atualizarDecoracaoMensagens();
}
function pegarDecoracao() {
    const salva = localStorage.getItem("decoracao_chat");
    return decoracoes[salva] || "";
}
function atualizarDecoracaoMensagens() {
    const icone = pegarDecoracao();
    document.querySelectorAll('.balao .decoracao-balao').forEach(el => {
        el.textContent = icone;
        el.style.display = icone ? "inline" : "none";
    });
}
function criarBalao(texto, tipo = "amigo") {
    const icone = pegarDecoracao();
    const d = document.createElement("div");
    d.className = `balao ${tipo}`;
    if (icone) {
        d.innerHTML = `<span class="texto-balao">${texto}</span><span class="decoracao-balao">${icone}</span>`;
    } else {
        d.innerHTML = `<span class="texto-balao">${texto}</span>`;
    }
    return d;
}

// =============================================
// SEQUÊNCIA DE DIAS BONS
// =============================================
function calcularSequencia() {
    if (!usuarioLogado) return { contagem: 0, quebrou: false, ultimoAlcance: 0 };
    const hoje = new Date();
    const registros = JSON.parse(localStorage.getItem(`humor_${usuarioLogado.id}`) || "{}");
    let sequencia = 0;
    let quebrou = false;
    let ultimoAlcance = parseInt(localStorage.getItem(`sequencia_alcance_${usuarioLogado.id}`) || "0");
    
    for (let i = 0; i < 365; i++) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - i);
        const chave = dataISO(data);
        const humor = registros[chave];
        
        if (!humor) { if (i === 0) continue; break; }
        if (humor === "muito_bom" || humor === "bom") { sequencia++; }
        else { if (i === 0) quebrou = true; break; }
    }
    return { contagem: sequencia, quebrou, ultimoAlcance };
}
function verificarSequencia() {
    if (!usuarioLogado) return;
    const { contagem, quebrou, ultimoAlcance } = calcularSequencia();
    const caixa = document.getElementById("caixa-conversa");
    
    if (quebrou && ultimoAlcance > 0) {
        const msgQuebra = criarBalao(
            "Não se preocupe! 💜 Um dia difícil não apaga tudo que você já conquistou. Amanhã é um novo recomeço e estou aqui com você. Quer contar o que aconteceu?",
            "amigo"
        );
        caixa?.appendChild(msgQuebra);
        if (caixa) caixa.scrollTop = caixa.scrollHeight;
        falar("Não se preocupe. Um dia difícil não apaga tudo que você já conquistou. Estou aqui com você.");
        localStorage.setItem(`sequencia_alcance_${usuarioLogado.id}`, "0");
        return;
    }
    
    for (const marca of diasSequencia) {
        if (contagem >= marca && ultimoAlcance < marca) {
            localStorage.setItem(`sequencia_alcance_${usuarioLogado.id}`, marca);
            const mensagem = marca === 3
                ? `Você está há ${marca} dias se sentindo bem! 🎉 Que incrível! Continue assim, você está fazendo um ótimo trabalho! 💜`
                : `Parabéns! 🎉 Você completou ${marca} dias de cuidar de si mesmo! Isso é muito especial e você merece todo o reconhecimento! 💜✨`;
            const msg = criarBalao(mensagem, "amigo");
            caixa?.appendChild(msg);
            if (caixa) caixa.scrollTop = caixa.scrollHeight;
            falar(mensagem);
            break;
        }
    }
}

// =============================================
// REGISTRAR HUMOR — SUBSTITUI, NÃO DUPLICA ✅
// =============================================
async function registrarHumor(tipo) {
    if (!usuarioLogado) return;
    const dataHoje = dataISO();
    
    // 1. Salva/ATUALIZA o humor do dia — substitui se já existir
    const reg = JSON.parse(localStorage.getItem(`humor_${usuarioLogado.id}`) || "{}");
    reg[dataHoje] = tipo;
    localStorage.setItem(`humor_${usuarioLogado.id}`, JSON.stringify(reg));
    localStorage.setItem(`ultimo_humor_${usuarioLogado.id}`, dataPadrao());
    
    // 2. Adiciona mensagem na conversa
    const conversas = JSON.parse(localStorage.getItem(`conversas_${usuarioLogado.id}`) || "{}");
    if (!conversas[dataHoje]) conversas[dataHoje] = [];
    
    const jaTinha = Object.keys(reg).length > 0 && reg[dataHoje] === tipo;
    if (jaTinha) {
        conversas[dataHoje].push({
            tipo: "amigo",
            texto: `Atualizou: ${nomeHumor[tipo]} 💜`,
            hora: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})
        });
    } else {
        conversas[dataHoje].push({
            tipo: "usuario",
            texto: `Escolheu: ${nomeHumor[tipo]}`,
            hora: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})
        });
    }
    localStorage.setItem(`conversas_${usuarioLogado.id}`, JSON.stringify(conversas));
    
    // 3. Resposta do Amigo(a)
    const respostas = {
        "muito_bom": "Que alegria! 🎉 O que te deixou tão feliz hoje?",
        "bom": "Que bom que está bem! 🤍 Isso é maravilhoso.",
        "mais_ou_menos": "Entendo… dias assim acontecem 💜 Estou aqui com você.",
        "ruim": "Sinto muito que o dia esteja difícil 💙 Fica comigo, tá?",
        "muito_ruim": "Sinto muito 💜 Você não está sozinho(a). Amanhã pode ser melhor."
    };
    
    document.getElementById("bloco-humor-interno")?.remove();
    const caixa = document.getElementById("caixa-conversa");
    const balao = criarBalao(respostas[tipo], "amigo");
    caixa?.appendChild(balao);
    
    conversas[dataHoje].push({
        tipo: "amigo",
        texto: respostas[tipo],
        hora: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})
    });
    localStorage.setItem(`conversas_${usuarioLogado.id}`, JSON.stringify(conversas));
    
    if (caixa) caixa.scrollTop = caixa.scrollHeight;
    falar(respostas[tipo]);
    
    verificarSequencia();
    liberarConversa();
}

// =============================================
// LOGIN E CADASTRO
// =============================================
async function fazerLogin() {
    const email = document.getElementById("login-email")?.value.trim();
    const senha = document.getElementById("login-senha")?.value;
    if (!email || !senha) { alert("Preencha e-mail e senha!"); return; }

    const form = new FormData();
    form.append("email", email);
    form.append("senha", senha);

    try {
        const resp = await fetch(API_URL + "api_login.php", { method: "POST", body: form });
        const texto = await resp.text();

        let res = {};
        if (texto) {
            try {
                res = JSON.parse(texto);
            } catch (erroParse) {
                console.error("Resposta inválida do login:", texto.slice(0, 500));
                alert("O servidor respondeu com conteúdo inesperado. Verifique se o PHP está funcionando e recarregue a página. 💜");
                return;
            }
        }

        const usuario = res.usuario || {
            id: res.id,
            nome: res.nome_usuario || res.nome || "Usuário",
            email: res.email || email,
            nome_responsavel: res.nome_responsavel || "",
            email_responsavel: res.email_responsavel || "",
            data_nascimento: res.data_nascimento || null,
            idade: Number(res.idade || 0)
        };

        if (res.sucesso) {
            usuarioLogado = {
                ...usuario,
                is_admin: Number(res.is_admin ?? usuario.is_admin ?? 0),
                status: res.status || usuario.status || 'aprovado'
            };
            localStorage.setItem("usuario_logado", JSON.stringify(usuarioLogado));
            if (document.getElementById("manter-conectado")?.checked) {
                localStorage.setItem("ultimo_email", email);
            }

            if (usuarioLogado.is_admin === 1 || usuarioLogado.email === 'admin@gmail.com') {
                abrirPainelAdmin();
                return;
            }

            entrarTelaPrincipal();
        } else {
            alert(res.erro || "Não foi possível entrar no sistema.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão! Verifique se o XAMPP está ligado 🟢");
    }
}
function entrarTelaPrincipal() {
    const perfil = obterVersaoConfiguracao(usuarioLogado || {});
    document.body.dataset.perfil = perfil;

    document.getElementById("bloco-aba-acesso")?.classList.add("escondido");
    document.getElementById("bloco-form-acesso")?.classList.add("escondido");

    if (perfil === "crianca") {
        document.getElementById("tela-principal")?.classList.add("escondido");
        document.getElementById("tela-kids")?.classList.remove("escondido");
        document.getElementById("tela-calendario")?.classList.add("escondido");
        document.getElementById("tela-config")?.classList.add("escondido");
        document.body.classList.remove("tela-inicio");
        document.body.classList.add("tela-principal");
        return;
    }

    document.getElementById("tela-kids")?.classList.add("escondido");
    document.getElementById("tela-principal")?.classList.remove("escondido");
    document.body.classList.remove("tela-inicio");
    document.body.classList.add("tela-principal");
    
    aplicarTema(localStorage.getItem("tema_fundo") || "azul");
    
    const decorSalva = localStorage.getItem("decoracao_chat") || "nenhum";
    if (document.getElementById("estilo-decoracao")) {
        document.getElementById("estilo-decoracao").value = decorSalva;
    }
    
    const caixa = document.getElementById("caixa-conversa");
    if (caixa) caixa.innerHTML = "";
    caixa?.appendChild(criarBalao(`Olá, ${usuarioLogado?.nome || 'amigo'}! 💜 Como foi o seu dia hoje?`, "amigo"));
    
    const blocoHumor = document.createElement("div");
    blocoHumor.id = "bloco-humor-interno";
    blocoHumor.className = "escolha-humor";
    blocoHumor.innerHTML = `
        <p class="pergunta-humor">Escolha como está se sentindo:</p>
        <div class="botoes-humor">
            <button onclick="registrarHumor('muito_bom')" class="botao-humor muito-bom">😄 Muito bom</button>
            <button onclick="registrarHumor('bom')" class="botao-humor bom">🙂 Bom</button>
            <button onclick="registrarHumor('mais_ou_menos')" class="botao-humor mais-ou-menos">😐 Mais ou menos</button>
            <button onclick="registrarHumor('ruim')" class="botao-humor ruim">😔 Ruim</button>
            <button onclick="registrarHumor('muito_ruim')" class="botao-humor muito-ruim">😢 Muito ruim</button>
        </div>
    `;
    caixa?.appendChild(blocoHumor);
    if (caixa) caixa.scrollTop = caixa.scrollHeight;
    
    const areaEnvio = document.getElementById("area-envio");
    const entradaTexto = document.getElementById("entrada-texto");
    if (areaEnvio) areaEnvio.classList.add("bloqueada");
    if (entradaTexto) { entradaTexto.disabled = true; entradaTexto.placeholder = "Escolha como está se sentindo primeiro…"; }
}
function liberarConversa() {
    const areaEnvio = document.getElementById("area-envio");
    const entradaTexto = document.getElementById("entrada-texto");
    if (areaEnvio) areaEnvio.classList.remove("bloqueada");
    if (entradaTexto) { entradaTexto.disabled = false; entradaTexto.placeholder = "Digite sua mensagem…"; }
}
async function fazerCadastro() {
    const nome = document.getElementById("cad-nome")?.value.trim();
    const nomeResponsavel = document.getElementById("cad-responsavel-nome")?.value.trim();
    const emailResponsavel = document.getElementById("cad-responsavel-email")?.value.trim();
    const email = document.getElementById("cad-email")?.value.trim();
    const dataNascimento = document.getElementById("cad-data-nascimento")?.value;
    const genero = document.getElementById("cad-genero")?.value;
    const senha = document.getElementById("cad-senha")?.value;
    
    if (!nome || !nomeResponsavel || !emailResponsavel || !email || !dataNascimento || !genero || !senha) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const idade = calcularIdade(dataNascimento);
    if (idade < 1 || idade > 120) {
        alert("Data de nascimento inválida! Verifique a idade informada.");
        return;
    }
    
    const form = new FormData();
    form.append("acao", "cadastrar");
    form.append("nome", nome);
    form.append("nome_responsavel", nomeResponsavel);
    form.append("email_responsavel", emailResponsavel);
    form.append("email", email);
    form.append("data_nascimento", dataNascimento);
    form.append("idade", idade);
    form.append("genero", genero);
    form.append("senha", senha);
    
    try {
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const texto = await resp.text();
        let res = {};
        if (texto) {
            try { res = JSON.parse(texto); }
            catch {
                console.error("Resposta inválida no cadastro:", texto.slice(0, 500));
                alert("O servidor retornou uma resposta inválida durante o cadastro. Verifique o PHP e recarregue a página. 💜");
                return;
            }
        }

        if (res.sucesso) { alert("Conta criada! Faça login 💜"); mostrarAba("entrar"); }
        else { alert(res.erro || "Erro ao cadastrar."); }
    } catch {
        alert("Erro de conexão! Verifique o XAMPP 🟢");
    }
}

// =============================================
// MENSAGENS E MICROFONE
// =============================================
function adicionarMensagemUsuario(texto) {
    const caixa = document.getElementById("caixa-conversa");
    if (!caixa) return;
    caixa.appendChild(criarBalao(texto, "usuario"));
    caixa.scrollTop = caixa.scrollHeight;
    
    if (!usuarioLogado) return;
    const conversas = JSON.parse(localStorage.getItem(`conversas_${usuarioLogado.id}`) || "{}");
    const hoje = dataISO();
    if (!conversas[hoje]) conversas[hoje] = [];
    conversas[hoje].push({ tipo: "usuario", texto, hora: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) });
    localStorage.setItem(`conversas_${usuarioLogado.id}`, JSON.stringify(conversas));
}
async function enviarMensagem() {
    const campo = document.getElementById("entrada-texto");
    if (!campo || campo.disabled) return;
    const texto = campo.value.trim();
    if (!texto) return;

    const risco = detectarRiscoDeConteudo(texto, usuarioLogado || null);
    adicionarMensagemUsuario(texto);
    campo.value = "";

    setTimeout(() => {
        let resposta = "Entendo… 💜 Quer contar mais?";

        if (risco.risco) {
            registrarAlertaConversa(risco.motivos, texto, usuarioLogado || null);
            resposta = "Esse tema pede cuidado. Eu não posso tratar dados pessoais ou conteúdos sensíveis. Posso continuar com apoio emocional seguro e orientar para conversar com uma pessoa responsável ou um canal de ajuda confiável. 💜";
            const lista = document.getElementById("lista-alertas-sistema");
            if (lista) {
                carregarDadosAdminLocais();
            }
        }

        const caixa = document.getElementById("caixa-conversa");
        caixa?.appendChild(criarBalao(resposta, "amigo"));
        if (caixa) caixa.scrollTop = caixa.scrollHeight;
        falar(resposta);

        if (!usuarioLogado) return;
        const conversas = JSON.parse(localStorage.getItem(`conversas_${usuarioLogado.id}`) || "{}");
        const hoje = dataISO();
        if (!conversas[hoje]) conversas[hoje] = [];
        conversas[hoje].push({ tipo: "amigo", texto: resposta, hora: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) });
        localStorage.setItem(`conversas_${usuarioLogado.id}`, JSON.stringify(conversas));
    }, 600);
}
function alternarMicrofone() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { alert("Use o Chrome para falar!"); return; }
    const botao = document.getElementById("botao-microfone");
    
    if (!reconhecimento) {
        reconhecimento = new Rec();
        reconhecimento.lang = "pt-BR";
        reconhecimento.onresult = e => {
            const campo = document.getElementById("entrada-texto");
            if (campo && !campo.disabled) {
                campo.value = e.results[0][0].transcript;
                enviarMensagem();
            }
        };
    }
    
    if (botao?.classList.contains("gravando")) { 
        reconhecimento.stop(); 
        botao?.classList.remove("gravando"); 
    } else { 
        reconhecimento.start(); 
        botao?.classList.add("gravando"); 
    }
}

// =============================================
// NAVEGAÇÃO E TELAS
// =============================================
function mostrarAba(aba) {
    document.getElementById("form-entrar")?.classList.toggle("escondido", aba !== "entrar");
    document.getElementById("form-cadastrar")?.classList.toggle("escondido", aba !== "cadastrar");
    document.getElementById("form-recuperar")?.classList.add("escondido");
    document.getElementById("botao-entrar")?.classList.toggle("ativo", aba === "entrar");
    document.getElementById("botao-cadastrar")?.classList.toggle("ativo", aba === "cadastrar");
}
function mostrarRecuperar() {
    document.getElementById("form-entrar")?.classList.add("escondido");
    document.getElementById("form-cadastrar")?.classList.add("escondido");
    document.getElementById("form-recuperar")?.classList.remove("escondido");
}
function voltarParaAcesso() { mostrarAba("entrar"); }
function alternarSenha(idCampo) {
    const campo = document.getElementById(idCampo);
    if (campo) campo.type = campo.type === "password" ? "text" : "password";
}
function loginGoogle() {
    alert("Login com Google temporariamente indisponível. Use o login do sistema. 💜");
}
function recuperarSenha() { alert("Código enviado! 💜 (funcionalidade em desenvolvimento)"); voltarParaAcesso(); }

function limparTextoParaSeguranca(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function detectarRiscoDeConteudo(texto, usuarioAtual = null) {
    const pii = JSON.parse(localStorage.getItem("bestup_pii") || "[]");
    const alertas = JSON.parse(localStorage.getItem("bestup_alertas_temas") || "[]");
    const textoLimpo = limparTextoParaSeguranca(texto);
    const idade = Number(usuarioAtual?.idade || 0);

    const piiMatches = pii
        .map(item => item.trim())
        .filter(Boolean)
        .filter(item => textoLimpo.includes(limparTextoParaSeguranca(item)));

    const regras = alertas.filter(item => {
        const titulo = limparTextoParaSeguranca(item.titulo || "");
        const descricao = limparTextoParaSeguranca(item.descricao || "");
        const faixaOk = idade >= Number(item.idadeMin || 0) && idade <= Number(item.idadeMax || 120);
        return faixaOk && (titulo && textoLimpo.includes(titulo) || descricao && textoLimpo.includes(descricao));
    });

    const padroesSensiveis = [
        "cpf", "rg", "telefone", "celular", "endereco", "rua", "bairro", "cep", "cartao", "senha",
        "nascimento", "nome completo", "email pessoal", "localizacao", "droga", "armas", "self harm",
        "suicidio", "suicídio", "violencia sexual", "abuso", "sexo", "exploracao"
    ];

    const padroesEncontrados = padroesSensiveis.filter(item => textoLimpo.includes(item));
    const motivos = [...piiMatches, ...regras.map(item => item.titulo), ...padroesEncontrados];

    return {
        risco: piiMatches.length > 0 || regras.length > 0 || padroesEncontrados.length > 0,
        motivos: [...new Set(motivos)],
        piiMatches,
        textoOriginal: texto
    };
}

async function carregarDadosAdminServidor() {
    try {
        const form = new FormData();
        form.append("acao", "listar_admin_configuracoes");

        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();

        if (!dados.sucesso) return false;

        if (Array.isArray(dados.pii)) localStorage.setItem("bestup_pii", JSON.stringify(dados.pii));
        if (Array.isArray(dados.faixas)) localStorage.setItem("bestup_faixas_temas", JSON.stringify(dados.faixas));
        if (Array.isArray(dados.alertas)) localStorage.setItem("bestup_alertas_temas", JSON.stringify(dados.alertas));
        if (Array.isArray(dados.alertas_conversa)) localStorage.setItem("bestup_alertas_gerados", JSON.stringify(dados.alertas_conversa));

        carregarDadosAdminLocais();
        return true;
    } catch (erro) {
        console.warn("Falha ao sincronizar configuração do painel.", erro);
        return false;
    }
}

async function registrarAlertaConversa(motivos, textoOriginal, usuarioAtual = null) {
    const novoAlerta = {
        id: Date.now(),
        usuario: usuarioAtual?.nome || "Usuário",
        email: usuarioAtual?.email || "",
        horario: new Date().toISOString(),
        motivos: Array.isArray(motivos) ? motivos : [motivos],
        texto: String(textoOriginal || "").slice(0, 220),
        tipo: "tema_sensiveis"
    };

    try {
        const form = new FormData();
        form.append("acao", "registrar_alerta_conversa");
        form.append("dados", JSON.stringify({
            usuario: novoAlerta.usuario,
            email: novoAlerta.email,
            horario: novoAlerta.horario,
            motivos: novoAlerta.motivos,
            texto: novoAlerta.texto,
            tipo: novoAlerta.tipo
        }));
        await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
    } catch (erro) {
        console.warn("Não foi possível salvar alerta no servidor, usando backup local.", erro);
    }

    const alertasAtuais = JSON.parse(localStorage.getItem("bestup_alertas_gerados") || "[]");
    alertasAtuais.unshift({ ...novoAlerta, horario: novoAlerta.horario });
    localStorage.setItem("bestup_alertas_gerados", JSON.stringify(alertasAtuais.slice(0, 25)));
}

async function marcarAlertaConversa(id, status) {
    const observacao = status === 'resolvida' ? 'Conversa revisada e resolvida antes do desvio crítico.' : 'Alerta revisado pela equipe responsável.';
    const form = new FormData();
    form.append('acao', 'atualizar_status_alerta');
    form.append('dados', JSON.stringify({ id, status, observacao }));

    try {
        const resp = await fetch(API_URL + 'api_usuarios.php', { method: 'POST', body: form });
        const dados = await resp.json();
        if (dados.sucesso) {
            await carregarDadosAdminServidor();
            alert(status === 'resolvida' ? 'Alerta marcado como resolvido.' : 'Alerta marcado como lido.');
        } else {
            alert(dados.erro || 'Erro ao atualizar alerta.');
        }
    } catch (erro) {
        console.error(erro);
        alert('Erro ao atualizar o status do alerta.');
    }
}

function carregarDadosAdminLocais() {
    const pii = JSON.parse(localStorage.getItem("bestup_pii") || "[]");
    const faixas = JSON.parse(localStorage.getItem("bestup_faixas_temas") || "[]");
    const alertas = JSON.parse(localStorage.getItem("bestup_alertas_temas") || "[]");
    const alertasGerados = JSON.parse(localStorage.getItem("bestup_alertas_gerados") || "[]");

    const piiInput = document.getElementById("admin-pii-input");
    if (piiInput) piiInput.value = pii.join("\n");

    const faixaLista = document.getElementById("lista-faixas-admin");
    if (faixaLista) {
        faixaLista.innerHTML = faixas.length ? faixas.map((item) => `
            <div class="item-admin">
                <strong>${item.nome}</strong>
                <span>${item.tema} • ${item.idadeMin} a ${item.idadeMax} anos • ${item.permitido ? 'Permitido' : 'Proibido'}</span>
                <small>${item.motivo}</small>
            </div>
        `).join('') : '<p>Nenhuma faixa cadastrada.</p>';
    }

    const alertaLista = document.getElementById("lista-alertas-admin");
    if (alertaLista) {
        alertaLista.innerHTML = alertas.length ? alertas.map(item => `
            <div class="item-admin">
                <strong>${item.titulo}</strong>
                <span>${item.idadeMin} a ${item.idadeMax} anos</span>
                <small>${item.descricao}</small>
            </div>
        `).join('') : '<p>Nenhum alerta cadastrado.</p>';
    }

    const alertasSistema = document.getElementById("lista-alertas-sistema");
    if (alertasSistema) {
        alertasSistema.innerHTML = alertasGerados.length ? alertasGerados.map(item => {
            const status = (item.status || 'pendente').toLowerCase();
            const statusTexto = status === 'lida' ? 'Lida' : status === 'resolvida' ? 'Resolvida' : 'Pendente';
            const statusClasse = status === 'lida' ? 'lida' : status === 'resolvida' ? 'resolvida' : 'pendente';
            const botaoLida = status === 'pendente' ? `<button class="botao-admin botao-aprovar" onclick="marcarAlertaConversa(${item.id}, 'lida')">Marcar como lida</button>` : '';
            const botaoResolvida = status !== 'resolvida' ? `<button class="botao-admin botao-rejeitar" onclick="marcarAlertaConversa(${item.id}, 'resolvida')">Resolver</button>` : '';

            return `
                <div class="item-admin alert-${statusClasse}">
                    <div class="item-admin-topo">
                        <strong>${item.usuario}</strong>
                        <span class="status-badge ${statusClasse}">${statusTexto}</span>
                    </div>
                    <span>${new Date(item.horario).toLocaleString('pt-BR')}</span>
                    <small>${Array.isArray(item.motivos) ? item.motivos.join(', ') : (item.motivos || '')}</small>
                    <small>Mensagem: "${item.texto || 'Sem texto'}"</small>
                    <div class="acoes-admin">
                        ${botaoLida}
                        ${botaoResolvida}
                    </div>
                </div>
            `;
        }).join('') : '<p>Nenhum alerta de conversa sensível registrado.</p>';
    }

    const piiLista = document.getElementById("lista-pii-admin");
    if (piiLista) {
        piiLista.innerHTML = pii.length ? pii.map(item => `<span class="tag-admin">${item}</span>`).join('') : '<p>Nenhuma PII cadastrada.</p>';
    }
}

async function salvarPiiAdmin() {
    const input = document.getElementById("admin-pii-input");
    const valor = input?.value || "";
    const itens = valor
        .split(/\n|,|;/)
        .map(item => item.trim())
        .filter(Boolean)
        .filter((item, index, arr) => arr.indexOf(item) === index);

    try {
        const form = new FormData();
        form.append("acao", "salvar_pii_admin");
        form.append("valor", JSON.stringify(itens));
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();
        if (!dados.sucesso) throw new Error(dados.erro || "Erro ao salvar PIIs.");
    } catch (erro) {
        console.warn("Persistência em banco falhou; usando armazenamento local.", erro);
    }

    localStorage.setItem("bestup_pii", JSON.stringify(itens));
    await carregarDadosAdminServidor();
    alert("PIIs protegidas salvas com sucesso.");
}

async function salvarFaixaTemaAdmin() {
    const nome = document.getElementById("admin-faixa-nome")?.value.trim();
    const tema = document.getElementById("admin-faixa-tema")?.value.trim();
    const idadeMin = Number(document.getElementById("admin-faixa-idade-min")?.value || 0);
    const idadeMax = Number(document.getElementById("admin-faixa-idade-max")?.value || 120);
    const permitido = Number(document.getElementById("admin-faixa-permitido")?.value || 1);
    const motivo = document.getElementById("admin-faixa-motivo")?.value.trim();

    if (!nome || !tema || !motivo) {
        alert("Preencha nome, tema e motivo da faixa.");
        return;
    }

    const faixas = JSON.parse(localStorage.getItem("bestup_faixas_temas") || "[]");
    const registro = { nome, tema, idadeMin, idadeMax, permitido: Boolean(permitido), motivo };
    faixas.push(registro);

    try {
        const form = new FormData();
        form.append("acao", "salvar_faixa_admin");
        form.append("dados", JSON.stringify(registro));
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();
        if (!dados.sucesso) throw new Error(dados.erro || "Erro ao salvar faixa.");
    } catch (erro) {
        console.warn("Persistência em banco falhou; usando armazenamento local.", erro);
    }

    localStorage.setItem("bestup_faixas_temas", JSON.stringify(faixas));
    document.getElementById("admin-faixa-nome").value = "";
    document.getElementById("admin-faixa-tema").value = "";
    document.getElementById("admin-faixa-idade-min").value = "";
    document.getElementById("admin-faixa-idade-max").value = "";
    document.getElementById("admin-faixa-motivo").value = "";
    await carregarDadosAdminServidor();
    alert("Faixa de tema salva.");
}

async function salvarAlertaTemaAdmin() {
    const titulo = document.getElementById("admin-alerta-titulo")?.value.trim();
    const idadeMin = Number(document.getElementById("admin-alerta-idade-min")?.value || 0);
    const idadeMax = Number(document.getElementById("admin-alerta-idade-max")?.value || 120);
    const descricao = document.getElementById("admin-alerta-descricao")?.value.trim();

    if (!titulo || !descricao) {
        alert("Preencha título e descrição do alerta.");
        return;
    }

    const alertas = JSON.parse(localStorage.getItem("bestup_alertas_temas") || "[]");
    const registro = { titulo, idadeMin, idadeMax, descricao };
    alertas.push(registro);

    try {
        const form = new FormData();
        form.append("acao", "salvar_alerta_admin");
        form.append("dados", JSON.stringify(registro));
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();
        if (!dados.sucesso) throw new Error(dados.erro || "Erro ao salvar alerta.");
    } catch (erro) {
        console.warn("Persistência em banco falhou; usando armazenamento local.", erro);
    }

    localStorage.setItem("bestup_alertas_temas", JSON.stringify(alertas));
    document.getElementById("admin-alerta-titulo").value = "";
    document.getElementById("admin-alerta-idade-min").value = "";
    document.getElementById("admin-alerta-idade-max").value = "";
    document.getElementById("admin-alerta-descricao").value = "";
    await carregarDadosAdminServidor();
    alert("Alerta de tema salvo.");
}

async function abrirPainelAdmin() {
    document.getElementById("bloco-aba-acesso")?.classList.add("escondido");
    document.getElementById("bloco-form-acesso")?.classList.add("escondido");
    document.getElementById("tela-principal")?.classList.add("escondido");
    document.getElementById("tela-kids")?.classList.add("escondido");
    document.getElementById("tela-calendario")?.classList.add("escondido");
    document.getElementById("tela-config")?.classList.add("escondido");
    document.getElementById("tela-admin")?.classList.remove("escondido");
    await carregarDadosAdminServidor();
    await carregarPainelAdmin();
}

async function carregarPainelAdmin() {
    const form = new FormData();
    form.append("acao", "listar_usuarios");

    try {
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();
        const lista = document.getElementById("lista-usuarios-admin");
        if (!lista) return;

        if (!dados.sucesso || !Array.isArray(dados.usuarios)) {
            lista.innerHTML = "<p>Não foi possível carregar os usuários.</p>";
            return;
        }

        if (dados.usuarios.length === 0) {
            lista.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
            return;
        }

        lista.innerHTML = dados.usuarios.map(usuario => {
            const status = usuario.status || 'pendente';
            const statusTexto = status === 'aprovado' ? 'Aprovado' : status === 'rejeitado' ? 'Rejeitado' : 'Pendente';
            const statusClasse = status === 'aprovado' ? 'aprovado' : status === 'rejeitado' ? 'rejeitado' : 'pendente';
            const botaoAprovar = status === 'pendente'
                ? `<button class="botao-admin botao-aprovar" onclick="aprovarUsuario(${usuario.id})">Aprovar</button>`
                : '';
            const botaoRejeitar = status !== 'rejeitado'
                ? `<button class="botao-admin botao-rejeitar" onclick="rejeitarUsuario(${usuario.id})">Rejeitar</button>`
                : '';

            return `
                <div class="usuario-admin-item">
                    <div>
                        <strong>${usuario.nome}</strong><br>
                        <span>${usuario.email}</span><br>
                        <small>Idade: ${usuario.idade || '-'} | Gênero: ${usuario.genero || '-'} </small>
                    </div>
                    <div class="usuario-admin-status-group">
                        <span class="status-badge ${statusClasse}">${statusTexto}</span>
                        <div class="acoes-admin">
                            ${botaoAprovar}
                            ${botaoRejeitar}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (erro) {
        console.error(erro);
        const lista = document.getElementById("lista-usuarios-admin");
        if (lista) lista.innerHTML = "<p>Erro ao carregar usuários.</p>";
    }
}

async function aprovarUsuario(id) {
    const form = new FormData();
    form.append("acao", "aprovar_usuario");
    form.append("id", id);

    try {
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();
        if (dados.sucesso) {
            alert("Usuário aprovado com sucesso!");
            await carregarPainelAdmin();
        } else {
            alert(dados.erro || "Erro ao aprovar usuário.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao aprovar usuário.");
    }
}

async function rejeitarUsuario(id) {
    const form = new FormData();
    form.append("acao", "rejeitar_usuario");
    form.append("id", id);

    try {
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();
        if (dados.sucesso) {
            alert("Usuário rejeitado com sucesso.");
            await carregarPainelAdmin();
        } else {
            alert(dados.erro || "Erro ao rejeitar usuário.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao rejeitar usuário.");
    }
}

async function cadastrarUsuarioAdmin() {
    const nome = document.getElementById("admin-nome")?.value.trim();
    const email = document.getElementById("admin-email")?.value.trim();
    const idade = Number(document.getElementById("admin-idade")?.value || 0);
    const genero = document.getElementById("admin-genero")?.value || "outro";
    const senha = document.getElementById("admin-senha")?.value;

    if (!nome || !email || !senha || !idade) {
        alert("Preencha nome, e-mail, idade e senha.");
        return;
    }

    const form = new FormData();
    form.append("acao", "cadastrar_admin");
    form.append("nome", nome);
    form.append("email", email);
    form.append("idade", idade);
    form.append("genero", genero);
    form.append("senha", senha);

    try {
        const resp = await fetch(API_URL + "api_usuarios.php", { method: "POST", body: form });
        const dados = await resp.json();
        if (dados.sucesso) {
            alert("Usuário cadastrado com sucesso!");
            document.getElementById("admin-nome").value = "";
            document.getElementById("admin-email").value = "";
            document.getElementById("admin-idade").value = "";
            document.getElementById("admin-genero").value = "outro";
            document.getElementById("admin-senha").value = "";
            await carregarPainelAdmin();
        } else {
            alert(dados.erro || "Erro ao cadastrar usuário.");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão ao cadastrar usuário.");
    }
}

// =============================================
// CALENDÁRIO
// =============================================
let mesCalendarioAtual = new Date();

function atualizarCabecalhoCalendario() {
    const nomeMesAno = document.getElementById("nome-mes-ano");
    if (!nomeMesAno) return;
    const nomesMes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    nomeMesAno.textContent = `${nomesMes[mesCalendarioAtual.getMonth()]} / ${mesCalendarioAtual.getFullYear()}`;
}

function mesAnterior() {
    mesCalendarioAtual = new Date(mesCalendarioAtual.getFullYear(), mesCalendarioAtual.getMonth() - 1, 1);
    montarCalendario();
}

function proximoMes() {
    mesCalendarioAtual = new Date(mesCalendarioAtual.getFullYear(), mesCalendarioAtual.getMonth() + 1, 1);
    montarCalendario();
}

function abrirCalendario() {
    document.getElementById("tela-principal")?.classList.add("escondido");
    document.getElementById("tela-calendario")?.classList.remove("escondido");
    mesCalendarioAtual = new Date();
    atualizarCabecalhoCalendario();
    montarCalendario();
}

function montarCalendario() {
    if (!usuarioLogado) return;
    const mes = mesCalendarioAtual.getMonth();
    const ano = mesCalendarioAtual.getFullYear();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const registros = JSON.parse(localStorage.getItem(`humor_${usuarioLogado.id}`) || "{}");
    const conversas = JSON.parse(localStorage.getItem(`conversas_${usuarioLogado.id}`) || "{}");

    atualizarCabecalhoCalendario();

    const nomesMes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

    const contagem = { muito_bom:0, bom:0, mais_ou_menos:0, ruim:0, muito_ruim:0 };
    Object.values(registros).forEach(h => { if (contagem[h] !== undefined) contagem[h]++; });

    let html = `
        <div class="calendario-card">
            <div class="calendario-bow">🎀</div>
            <div class="calendario-mes-titulo">
                ${nomesMes[mes]}
                <span class="calendario-ano">${ano}</span>
            </div>
            <div class="grade-calendario">
                ${diasSemana.map(d => `<div class="dia-semana">${d}</div>`).join('')}
                ${Array.from({ length: primeiroDia.getDay() }, () => '<div class="dia-calendario vazio"></div>').join('')}
                ${Array.from({ length: ultimoDia.getDate() }, (_, index) => {
                    const d = index + 1;
                    const dataObj = new Date(ano, mes, d);
                    const chave = dataISO(dataObj);
                    const humor = registros[chave];
                    const temConversa = conversas[chave] && conversas[chave].length > 0;
                    const hoje = new Date();
                    const ehHoje = d === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
                    const fundo = humor ? corHumor[humor] : 'rgba(255,255,255,0.2)';
                    const destaque = ehHoje ? 'selecionado' : '';
                    return `
                        <div class="dia-calendario ${destaque}" onclick="abrirDia('${chave}', ${d})" style="background:${fundo};">
                            <span class="numero-dia">${d}</span>
                            ${temConversa ? '<span style="font-size:10px;">💬</span>' : '<span style="font-size:10px; opacity:0;">.</span>'}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    const resumoHtml = `
        <div class="resumo-mes">
            <h3>Resumo do Mês</h3>
            <div class="resumo-grid">
                <div class="item-resumo"><span class="ponto-humor ponto-muito-bom"></span><strong>Muito bom:</strong> ${contagem.muito_bom} dias</div>
                <div class="item-resumo"><span class="ponto-humor ponto-bom"></span><strong>Bom:</strong> ${contagem.bom} dias</div>
                <div class="item-resumo"><span class="ponto-humor ponto-mais-ou-menos"></span><strong>Mais ou menos:</strong> ${contagem.mais_ou_menos} dias</div>
                <div class="item-resumo"><span class="ponto-humor ponto-ruim"></span><strong>Ruim:</strong> ${contagem.ruim} dias</div>
                <div class="item-resumo"><span class="ponto-humor ponto-muito-ruim"></span><strong>Muito ruim:</strong> ${contagem.muito_ruim} dias</div>
            </div>
        </div>
    `;

    document.getElementById("grade-calendario").innerHTML = html;
    document.getElementById("resumo-mes").innerHTML = resumoHtml;
}

function abrirDia(chaveData, numeroDia) {
    if (!usuarioLogado) return;
    const registros = JSON.parse(localStorage.getItem(`humor_${usuarioLogado.id}`) || "{}");
    const conversas = JSON.parse(localStorage.getItem(`conversas_${usuarioLogado.id}`) || "{}");
    const humor = registros[chaveData];
    const msgs = conversas[chaveData] || [];

    let html = `
        <div class="detalle-dia">
            <h4>📅 Dia ${numeroDia}</h4>
    `;

    if (humor) {
        html += `<span class="humor-dia" style="background:${corHumor[humor]};">${nomeHumor[humor]}</span>`;
    } else {
        html += `<p style="color:#999; margin:0 0 12px;">Nenhum humor registrado neste dia.</p>`;
    }

    if (msgs.length > 0) {
        html += `<h5 style="margin:15px 0 8px; color:#56070C;">💬 Conversa do dia</h5><div class="lista-conversas">`;
        msgs.forEach(m => {
            html += `
                <div class="balao-conversa ${m.tipo === 'amigo' ? 'amigo' : 'usuario'}">
                    <small>${m.hora}</small>
                    ${m.texto}
                </div>`;
        });
        html += `</div>`;
    } else {
        html += `<p style="color:#999; margin:10px 0 0;">Sem conversas registradas.</p>`;
    }

    html += `<button class="botao-voltar-calendario" onclick="montarCalendario()">← Voltar ao calendário</button></div>`;
    document.getElementById("grade-calendario").innerHTML = html;
}

// =============================================
// 🎮 ESPAÇO KIDS
// =============================================
function abrirKids() {
    document.getElementById("tela-principal")?.classList.add("escondido");
    document.getElementById("tela-kids")?.classList.remove("escondido");
}
function voltarMenuKids() {
    document.getElementById("menu-kids")?.classList.remove("escondido");
    document.querySelectorAll("[id^='atividade-']").forEach(div => div.classList.add("escondido"));
}
function abrirAtividade(nome) {
    document.getElementById("menu-kids").classList.add("escondido");
    document.querySelectorAll("[id^='atividade-']").forEach(div => {
        if (div.id !== `atividade-${nome}`) div.classList.add("escondido");
    });
    document.getElementById(`atividade-${nome}`).classList.remove("escondido");
    
    if (nome === "desenho") iniciarDesenho();
    if (nome === "emocoes") iniciarEmocoes();
    if (nome === "som") iniciarSons();
    if (nome === "memoria") iniciarMemoria();
    if (nome === "rosto") iniciarRosto();
    if (nome === "animais") iniciarAnimais();
}

// === DESENHO E COLORIR ===
let desenhoAtivo = false;
let corPincel = "#56070C";
let tamanhoPincel = 8;
let ultimoPonto = null;
let contextoDesenho = null;
let ferramentaAtual = "pincel";
function selecionarFerramenta(tipo) {
    ferramentaAtual = tipo;
    document.querySelectorAll(".botao-ferramenta").forEach(b => b.classList.remove("ativo"));
    document.getElementById(`ferramenta-${tipo}`)?.classList.add("ativo");
}
function iniciarDesenho() {
    const canvas = document.getElementById("tela-desenho");
    if (!canvas) { console.log("❌ Canvas não encontrado!"); return; }
    
    contextoDesenho = canvas.getContext("2d");
    const container = canvas.parentElement;
    canvas.width = container.clientWidth * 2;
    canvas.height = container.clientHeight * 2;
    contextoDesenho.scale(2, 2);
    contextoDesenho.lineCap = contextoDesenho.lineJoin = "round";
    
    const paleta = [
        "#000000","#56070C","#8E4585","#154360","#1E8449","#F39C12","#E74C3C","#EC407A",
        "#9B59B6","#3498DB","#2ECC71","#F1C40F","#E67E22","#FFFFFF","#BCE5FF","#FFD4E2",
        "#D4F1E8","#FFE8D6","#E5D9F2","#FFE4EC","#FFC2E0","#C2E0FF","#E0FFD4","#FFF4C2"
    ];
    const grade = document.getElementById("grade-cores");
    if (grade) {
        grade.innerHTML = "";
        paleta.forEach(cor => {
            const btn = document.createElement("button");
            btn.className = `botao-cor ${cor === corPincel ? 'selecionada' : ''}`;
            btn.style.background = cor;
            btn.style.border = cor === "#FFFFFF" ? "2px solid #ddd" : "";
            btn.onclick = () => {
                selecionarFerramenta("pincel");
                document.querySelectorAll(".botao-cor").forEach(b => b.classList.remove("selecionada"));
                btn.classList.add("selecionada");
                corPincel = cor;
            };
            grade.appendChild(btn);
        });
    }
    
    const controlePincel = document.getElementById("tamanho-pincel");
    if (controlePincel) {
        controlePincel.value = tamanhoPincel;
        controlePincel.oninput = e => tamanhoPincel = parseInt(e.target.value);
    }
    
    desenhoAtivo = false; ultimoPonto = null;
    
    const eventoInicio = e => {
        e.preventDefault();
        desenhoAtivo = true;
        ultimoPonto = pegarCoordenada(e, canvas);
    };
    const eventoMovimento = e => {
        if (!desenhoAtivo) return;
        e.preventDefault();
        const atual = pegarCoordenada(e, canvas);
        desenharLinha(ultimoPonto, atual);
        ultimoPonto = atual;
    };
    const eventoFim = () => {
        desenhoAtivo = false;
        ultimoPonto = null;
    };
    
    canvas.onmousedown = eventoInicio;
    canvas.ontouchstart = eventoInicio;
    canvas.onmousemove = eventoMovimento;
    canvas.ontouchmove = eventoMovimento;
    canvas.onmouseup = eventoFim;
    canvas.ontouchend = eventoFim;
    canvas.onmouseout = eventoFim;
}
function pegarCoordenada(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / 2 / rect.width;
    const escalaY = canvas.height / 2 / rect.height;
    const x = ((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) * escalaX;
    const y = ((e.touches ? e.touches[0].clientY : e.clientY) - rect.top) * escalaY;
    return { x, y };
}
function desenharLinha(de, para) {
    if (!contextoDesenho) return;
    contextoDesenho.beginPath();
    
    if (ferramentaAtual === "borracha") {
        contextoDesenho.globalCompositeOperation = "destination-out";
        contextoDesenho.lineWidth = tamanhoPincel * 2.5;
    } else {
        contextoDesenho.globalCompositeOperation = "source-over";
        contextoDesenho.lineWidth = tamanhoPincel;
        contextoDesenho.strokeStyle = corPincel;
    }
    
    contextoDesenho.moveTo(de.x, de.y);
    contextoDesenho.lineTo(para.x, para.y);
    contextoDesenho.stroke();
}
function limparDesenho() {
    const canvas = document.getElementById("tela-desenho");
    if (!canvas || !contextoDesenho) return;
    contextoDesenho.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
}
function salvarDesenho() {
    const canvas = document.getElementById("tela-desenho");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `desenho_${dataPadrao().replaceAll("/","-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

// === JOGO DAS EMOÇÕES ===
let indiceEmocao = 0, acertouEmocao = false;
const listaEmocoes = [
    { emoji: "😄", nome: "Alegria", dica: "Olha o sorriso! ✨" },
    { emoji: "😠", nome: "Raiva", dica: "Bochechas inchadas 😤" },
    { emoji: "😭", nome: "Tristeza", dica: "Olhinhos cheios d'água 💧" },
    { emoji: "🤔", nome: "Curiosidade", dica: "Humm… pensando 🤷" },
    { emoji: "😌", nome: "Calma", dica: "Olhinhos fechadinhos 💜" },
    { emoji: "🥰", nome: "Amor", dica: "Corações flutuando 💖" }
];
function iniciarEmocoes() { indiceEmocao = 0; acertouEmocao = false; carregarEmocao(); }
function carregarEmocao() {
    const atual = listaEmocoes[indiceEmocao];
    const elImg = document.getElementById("imagem-emocao");
    const elFeed = document.getElementById("feedback-emocao");
    const elProx = document.getElementById("botao-prox-emocao");
    const elBotoes = document.getElementById("botoes-emocao");
    
    if (elImg) elImg.innerHTML = atual.emoji;
    if (elFeed) { elFeed.className = "feedback-jogo"; elFeed.textContent = ""; }
    if (elProx) elProx.classList.add("escondido");
    acertouEmocao = false;
    
    if (elBotoes) {
        elBotoes.innerHTML = "";
        listaEmocoes.forEach(e => {
            const btn = document.createElement("button");
            btn.className = "botao-emocao";
            btn.textContent = e.nome;
            btn.onclick = () => verificarEmocao(e.nome);
            elBotoes.appendChild(btn);
        });
    }
}
function verificarEmocao(escolha) {
    if (acertouEmocao) return;
    const certo = listaEmocoes[indiceEmocao].nome;
    const elFeed = document.getElementById("feedback-emocao");
    const elProx = document.getElementById("botao-prox-emocao");
    
    if (escolha === certo) {
        if (elFeed) { elFeed.textContent = "✅ Isso mesmo! " + listaEmocoes[indiceEmocao].dica; elFeed.className = "feedback-jogo feedback-certo"; }
        acertouEmocao = true; elProx?.classList.remove("escondido");
    } else {
        if (elFeed) { elFeed.textContent = "💜 Tente de novo!"; elFeed.className = "feedback-jogo feedback-errado"; }
    }
}
function proximaEmocao() { indiceEmocao = (indiceEmocao + 1) % listaEmocoes.length; carregarEmocao(); }

// === ADIVINHE O SOM ===
let indiceSom = 0, acertouSom = false;
const listaSons = [
    { nome: "Cachorro", som: "Au au au!", opcoes: ["Cachorro", "Gato", "Vaca"] },
    { nome: "Gato", som: "Miauuu!", opcoes: ["Cachorro", "Gato", "Cavalo"] },
    { nome: "Vaca", som: "Muuuuu!", opcoes: ["Vaca", "Ovelha", "Cavalo"] },
    { nome: "Cavalo", som: "IIIIII rrri!", opcoes: ["Cavalo", "Cachorro", "Gato"] },
    { nome: "Galinha", som: "Cocoricó!", opcoes: ["Galinha", "Pato", "Vaca"] }
];
function iniciarSons() { indiceSom = 0; acertouSom = false; carregarSom(); }
function carregarSom() {
    const elFeed = document.getElementById("feedback-som");
    const elProx = document.getElementById("botao-prox-som");
    const elOpcoes = document.getElementById("opcoes-som");
    
    if (elFeed) { elFeed.className = "feedback-jogo"; elFeed.textContent = ""; }
    if (elProx) elProx.classList.add("escondido");
    acertouSom = false;
    
    if (elOpcoes) {
        elOpcoes.innerHTML = "";
        const atual = listaSons[indiceSom];
        atual.opcoes.sort(() => Math.random() - 0.5).forEach(op => {
            const btn = document.createElement("button");
            btn.className = "botao-opcao-som";
            btn.textContent = op;
            btn.onclick = () => verificarSom(op);
            elOpcoes.appendChild(btn);
        });
    }
}
function tocarSom() {
    const fala = new SpeechSynthesisUtterance(listaSons[indiceSom].som);
    fala.lang = "pt-BR"; fala.rate = 0.9; speechSynthesis.speak(fala);
}
function verificarSom(escolha) {
    if (acertouSom) return;
    const certo = listaSons[indiceSom].nome;
    const elFeed = document.getElementById("feedback-som");
    const elProx = document.getElementById("botao-prox-som");
    
    if (escolha === certo) {
        if (elFeed) { elFeed.textContent = "✅ Parabéns! É o " + certo + "!"; elFeed.className = "feedback-jogo feedback-certo"; }
        acertouSom = true; elProx?.classList.remove("escondido");
    } else {
        if (elFeed) { elFeed.textContent = "💜 Quase! Tente de novo."; elFeed.className = "feedback-jogo feedback-errado"; }
    }
}
function proximoSom() { indiceSom = (indiceSom + 1) % listaSons.length; carregarSom(); }

// === MONTAR PERSONAGEM ===
let generoAtual = "feminino";
let avatarSelecionado = {
    cabelo: "cabelo-longo",
    roupa: "roupa-blusa",
    calca: "calca-azul",
    sapato: "sapato-branco"
};
const perfilIdeal = {
    feminino: {
        cabelo: "cabelo-longo",
        roupa: "roupa-blusa",
        calca: "calca-azul",
        sapato: "sapato-branco"
    },
    masculino: {
        cabelo: "cabelo-curto",
        roupa: "roupa-camiseta",
        calca: "calca-verde",
        sapato: "sapato-azul"
    }
};
const opcoesPersonagem = {
    feminino: {
        cabelo: [
            { nome: "Longo", valor: "cabelo-longo" },
            { nome: "Curto", valor: "cabelo-curto" }
        ],
        roupa: [
            { nome: "Blusa clara", valor: "roupa-blusa" },
            { nome: "Camiseta", valor: "roupa-camiseta" }
        ],
        calca: [
            { nome: "Calça azul", valor: "calca-azul" },
            { nome: "Calça verde", valor: "calca-verde" }
        ],
        sapato: [
            { nome: "Tênis branco", valor: "sapato-branco" },
            { nome: "Tênis azul", valor: "sapato-azul" }
        ]
    },
    masculino: {
        cabelo: [
            { nome: "Curto", valor: "cabelo-curto" },
            { nome: "Longo", valor: "cabelo-longo" }
        ],
        roupa: [
            { nome: "Camiseta", valor: "roupa-camiseta" },
            { nome: "Blusa", valor: "roupa-blusa" }
        ],
        calca: [
            { nome: "Short verde", valor: "calca-verde" },
            { nome: "Calça azul", valor: "calca-azul" }
        ],
        sapato: [
            { nome: "Tênis azul", valor: "sapato-azul" },
            { nome: "Tênis branco", valor: "sapato-branco" }
        ]
    }
};

function iniciarRosto() {
    generoAtual = "feminino";
    avatarSelecionado = { ...perfilIdeal.feminino };
    atualizarGeneroAvatar();
    renderizarOpcoesPersonagem();
    atualizarPercentualRosto();
    document.getElementById("feedback-rosto").textContent = "Escolha o gênero e monte o personagem com as opções abaixo.";
    document.getElementById("feedback-rosto").className = "feedback-jogo";
    document.getElementById("botao-prox-rosto")?.classList.add("escondido");
    document.getElementById("botao-verificar-rosto")?.classList.remove("escondido");
}

function atualizarGeneroAvatar() {
    const avatar = document.querySelector(".avatar-builder");
    if (!avatar) return;
    avatar.classList.remove("avatar-genero-feminino", "avatar-genero-masculino");
    avatar.classList.add(`avatar-genero-${generoAtual}`);

    const cabelo = document.querySelector(".cabelo-personagem");
    const roupa = document.querySelector(".roupa-personagem");
    const calca = document.querySelector(".calca-personagem");
    const sapato = document.querySelector(".sapato-personagem");

    if (cabelo) {
        cabelo.className = `cabelo-personagem ${avatarSelecionado.cabelo} ${generoAtual === "feminino" ? "cabelo-escuro" : "cabelo-marron"}`;
    }
    if (roupa) roupa.className = `roupa-personagem ${avatarSelecionado.roupa}`;
    if (calca) calca.className = `calca-personagem ${avatarSelecionado.calca}`;
    if (sapato) sapato.className = `sapato-personagem ${avatarSelecionado.sapato}`;
}

function renderizarOpcoesPersonagem() {
    const container = document.getElementById("opcoes-personagem");
    if (!container) return;
    container.innerHTML = "";

    Object.entries(opcoesPersonagem[generoAtual]).forEach(([categoria, opcoes]) => {
        const bloco = document.createElement("div");
        bloco.className = "grupo-opcao-personagem";

        const titulo = document.createElement("span");
        titulo.className = "titulo-opcao-personagem";
        titulo.textContent = categoria === "cabelo" ? "Cabelo" : categoria === "roupa" ? "Roupa" : categoria === "calca" ? "Calça" : "Sapato";
        bloco.appendChild(titulo);

        const lista = document.createElement("div");
        lista.className = "lista-opcoes-personagem";

        opcoes.forEach(opcao => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `botao-selecao ${avatarSelecionado[categoria] === opcao.valor ? "ativo" : ""}`;
            btn.textContent = opcao.nome;
            btn.onclick = () => {
                avatarSelecionado[categoria] = opcao.valor;
                atualizarGeneroAvatar();
                renderizarOpcoesPersonagem();
                atualizarPercentualRosto();
            };
            lista.appendChild(btn);
        });

        bloco.appendChild(lista);
        container.appendChild(bloco);
    });
}

function atualizarPercentualRosto() {
    const total = Object.keys(perfilIdeal[generoAtual]).length;
    let acertos = 0;
    Object.entries(perfilIdeal[generoAtual]).forEach(([categoria, valorIdeal]) => {
        if (avatarSelecionado[categoria] === valorIdeal) acertos++;
    });
    const percentual = Math.round((acertos / total) * 100);
    const el = document.getElementById("percentual-rosto");
    if (el) el.textContent = `${percentual}%`;
}

function verificarMontagemRosto() {
    const total = Object.keys(perfilIdeal[generoAtual]).length;
    let acertos = 0;
    Object.entries(perfilIdeal[generoAtual]).forEach(([categoria, valorIdeal]) => {
        if (avatarSelecionado[categoria] === valorIdeal) acertos++;
    });
    const percentual = Math.round((acertos / total) * 100);
    const elFeed = document.getElementById("feedback-rosto");
    const elVer = document.getElementById("botao-verificar-rosto");
    const elProx = document.getElementById("botao-prox-rosto");

    if (elFeed) {
        elFeed.textContent = `Você montou ${percentual}% do personagem!`;
        elFeed.className = percentual >= 75 ? "feedback-jogo feedback-certo" : "feedback-jogo feedback-errado";
    }
    if (elVer) elVer.classList.add("escondido");
    if (elProx) elProx.classList.remove("escondido");
    const elPercentual = document.getElementById("percentual-rosto");
    if (elPercentual) elPercentual.textContent = `${percentual}%`;
}

function proximaRosto() {
    generoAtual = generoAtual === "feminino" ? "masculino" : "feminino";
    avatarSelecionado = { ...perfilIdeal[generoAtual] };
    document.getElementById("botao-verificar-rosto")?.classList.remove("escondido");
    document.getElementById("botao-prox-rosto")?.classList.add("escondido");
    atualizarGeneroAvatar();
    renderizarOpcoesPersonagem();
    atualizarPercentualRosto();
    document.getElementById("feedback-rosto").textContent = "Agora escolha as peças para o personagem e veja o resultado.";
    document.getElementById("feedback-rosto").className = "feedback-jogo";
}

const botoesGenero = document.querySelectorAll(".botao-genero");
botoesGenero.forEach(btn => {
    btn.onclick = () => {
        generoAtual = btn.dataset.genero;
        avatarSelecionado = { ...perfilIdeal[generoAtual] };
        document.querySelectorAll(".botao-genero").forEach(b => b.classList.toggle("ativo", b === btn));
        atualizarGeneroAvatar();
        renderizarOpcoesPersonagem();
        atualizarPercentualRosto();
    };
});

// === JOGO DOS ANIMAIS ===
let indiceAnimal = 0;
let animalAcertou = false;
const listaAnimais = [
    { nome: "Leão", emoji: "🦁", dica: "É o rei da selva!" },
    { nome: "Elefante", emoji: "🐘", dica: "Tem o maior tronco do mundo!" },
    { nome: "Girafa", emoji: "🦒", dica: "Tem pescoço muito alto!" },
    { nome: "Tigre", emoji: "🐯", dica: "Tem listras bonitas!" }
];
function iniciarAnimais() {
    indiceAnimal = 0; animalAcertou = false;
    carregarAnimal();
}
function carregarAnimal() {
    const atual = listaAnimais[indiceAnimal];
    const elImagem = document.getElementById("imagem-animal");
    const elFeed = document.getElementById("feedback-animal");
    const elProx = document.getElementById("botao-prox-animal");
    const elOpcoes = document.getElementById("opcoes-animais");

    if (elImagem) elImagem.textContent = atual.emoji;
    if (elFeed) { elFeed.textContent = "Qual animal é esse?"; elFeed.className = "feedback-jogo"; }
    if (elProx) elProx.classList.add("escondido");
    animalAcertou = false;

    if (elOpcoes) {
        elOpcoes.innerHTML = "";
        const opcoes = [...listaAnimais.map(item => item.nome)].sort(() => Math.random() - 0.5);
        opcoes.forEach(op => {
            const btn = document.createElement("button");
            btn.className = "botao-animal";
            btn.textContent = op;
            btn.onclick = () => verificarAnimal(op);
            elOpcoes.appendChild(btn);
        });
    }
}
function verificarAnimal(escolha) {
    if (animalAcertou) return;
    const certo = listaAnimais[indiceAnimal].nome;
    const elFeed = document.getElementById("feedback-animal");
    const elProx = document.getElementById("botao-prox-animal");

    if (escolha === certo) {
        if (elFeed) { elFeed.textContent = "✅ Correto! " + listaAnimais[indiceAnimal].dica; elFeed.className = "feedback-jogo feedback-certo"; }
        animalAcertou = true; elProx?.classList.remove("escondido");
    } else {
        if (elFeed) { elFeed.textContent = "💜 Quase! Tente outra vez."; elFeed.className = "feedback-jogo feedback-errado"; }
    }
}
function proximoAnimal() {
    indiceAnimal = (indiceAnimal + 1) % listaAnimais.length;
    carregarAnimal();
}

// === JOGO DA MEMÓRIA — TEMAS INFANTIS E RODADAS DINÂMICAS ✅ ===
const temasMemoria = [
    { nome: "Animais", fundo: "#6e7dfc", borda: "#fbd38d", card: "#f5ebff", icones: ["🐶","🐱","🐰","🐻","🦊","🐼","🐵","🐮"] },
    { nome: "Doces", fundo: "#ff9ec9", borda: "#ffd46b", card: "#fff0f7", icones: ["🍩","🍦","🍰","🍪","🍭","🍓","🍬","🥨"] },
    { nome: "Natureza", fundo: "#7ec9bb", borda: "#f7dc7d", card: "#ecfff7", icones: ["🌼","🌳","🌞","🌈","🦋","🍀","🌿","🌱"] },
    { nome: "Espaço", fundo: "#5f7de9", borda: "#ffd166", card: "#edf2ff", icones: ["🚀","🌙","⭐","☄️","🪐","✨","🌍","👽"] },
    { nome: "Diversão", fundo: "#ffb570", borda: "#ff7ba9", card: "#fff7df", icones: ["⚽","🎈","🎨","🎵","🎲","🎯","🏀","🎳"] }
];
let temaAtualMem = -1;
let cartasViradas = [];
let paresEncontrados = 0;
let bloqueadoMemoria = false;
const totalParesMemoria = 8;

function iniciarMemoria() {
    temaAtualMem = (temaAtualMem + 1) % temasMemoria.length;
    paresEncontrados = 0;
    cartasViradas = [];
    bloqueadoMemoria = false;

    const tema = temasMemoria[temaAtualMem];
    const elNome = document.getElementById("nome-tema-memoria");
    const elCont = document.getElementById("contador-pares");
    const elGrade = document.getElementById("grade-memoria");

    if (elNome) elNome.textContent = tema.nome;
    if (elCont) elCont.textContent = `${paresEncontrados}`;
    if (!elGrade) return;

    elGrade.style.setProperty("--tema-fundo", tema.fundo);
    elGrade.style.setProperty("--tema-borda", tema.borda);
    elGrade.style.setProperty("--tema-cartas", tema.card);

    let cartas = [...tema.icones.slice(0, totalParesMemoria), ...tema.icones.slice(0, totalParesMemoria)];
    cartas.sort(() => Math.random() - 0.5);

    elGrade.innerHTML = "";
    cartas.forEach((icone, indice) => {
        const carta = document.createElement("div");
        carta.className = "carta-memoria";
        carta.dataset.icone = icone;
        carta.dataset.indice = indice;
        carta.onclick = () => virarCartaMemoria(carta);
        elGrade.appendChild(carta);
    });
}

function virarCartaMemoria(el) {
    if (bloqueadoMemoria) return;
    if (el.classList.contains("virada") || el.classList.contains("encontrada")) return;
    if (cartasViradas.length >= 2) return;

    el.classList.add("virada");
    el.textContent = el.dataset.icone;
    cartasViradas.push(el);

    if (cartasViradas.length === 2) {
        bloqueadoMemoria = true;
        verificarParMemoria();
    }
}

function mostrarModalVitoriaMemoria() {
    const modal = document.getElementById("modal-vitoria-memoria");
    if (!modal) return;
    modal.classList.remove("escondido");
}

function fecharModalVitoriaMemoria() {
    const modal = document.getElementById("modal-vitoria-memoria");
    if (modal) modal.classList.add("escondido");
    iniciarMemoria();
}

function verificarParMemoria() {
    const [carta1, carta2] = cartasViradas;

    if (carta1.dataset.icone === carta2.dataset.icone) {
        setTimeout(() => {
            carta1.classList.add("encontrada");
            carta2.classList.add("encontrada");
            paresEncontrados++;

            const elCont = document.getElementById("contador-pares");
            if (elCont) elCont.textContent = `${paresEncontrados}`;

            if (paresEncontrados === totalParesMemoria) {
                setTimeout(() => {
                    mostrarModalVitoriaMemoria();
                }, 500);
            }

            cartasViradas = [];
            bloqueadoMemoria = false;
        }, 600);
    } else {
        setTimeout(() => {
            carta1.classList.remove("virada");
            carta2.classList.remove("virada");
            carta1.textContent = "";
            carta2.textContent = "";
            cartasViradas = [];
            bloqueadoMemoria = false;
        }, 1000);
    }
}

function reiniciarMemoria() {
    temaAtualMem = -1;
    iniciarMemoria();
}

// =============================================
// DEMAIS TELAS
// =============================================
function abrirConfiguracoes() {
    renderizarConfiguracoes();
    document.getElementById("tela-principal")?.classList.add("escondido");
    document.getElementById("tela-config")?.classList.remove("escondido");
}
function voltarPrincipal() {
    ["tela-calendario", "tela-kids", "tela-config", "tela-admin"].forEach(id => {
        document.getElementById(id)?.classList.add("escondido");
    });

    if (usuarioLogado && Number(usuarioLogado.is_admin) === 1) {
        abrirPainelAdmin();
        return;
    }

    document.getElementById("tela-principal")?.classList.remove("escondido");
}
function mostrarAjudaReal() {
    document.getElementById("modal-ajuda")?.classList.remove("escondido");
}
function fecharModalAjuda() {
    document.getElementById("modal-ajuda")?.classList.add("escondido");
}
function sairDaConta() {
    usuarioLogado = null;
    localStorage.removeItem("usuario_logado");
    document.body.classList.remove("tela-principal", "tema-azul", "tema-rosa", "tema-lavanda", "tema-mint", "tema-pessego");
    document.body.classList.add("tela-inicio");
    ["tela-principal", "tela-calendario", "tela-kids", "tela-config", "tela-admin"].forEach(id => {
        document.getElementById(id)?.classList.add("escondido");
    });
    document.getElementById("bloco-aba-acesso")?.classList.remove("escondido");
    document.getElementById("bloco-form-acesso")?.classList.remove("escondido");
    mostrarAba("entrar");
}
function carregarSalvo() {
    const ultimo = localStorage.getItem("ultimo_email");
    if (ultimo && document.getElementById("login-email")) {
        document.getElementById("login-email").value = ultimo;
        if (document.getElementById("manter-conectado")) {
            document.getElementById("manter-conectado").checked = true;
        }
    }
}
document.addEventListener("DOMContentLoaded", carregarSalvo);