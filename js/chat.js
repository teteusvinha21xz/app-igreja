// ==========================================================================
// 1. SEGURANÇA E CONTROLE DE SESSÃO
// ==========================================================================
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        const statusEmail = document.getElementById('user-display-email');
        if (statusEmail) statusEmail.innerText = user.email;
    }
});

const btnSair = document.getElementById('btn-sair');
if (btnSair) {
    btnSair.addEventListener('click', () => {
        auth.signOut().then(() => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    });
}

// ==========================================================================
// 2. CONTROLADOR DE ABAS E MENU LATERAL RETRÁTIL (3 LISTRAS)
// ==========================================================================
function toggleMenu() {
    const menu = document.getElementById('menu-lateral');
    if (menu) {
        menu.classList.toggle('aberto');
    }
}

function mudarAba(nomeAba) {
    // Esconde todas as seções de conteúdo
    const secoes = document.querySelectorAll('.conteudo-aba');
    secoes.forEach(aba => aba.style.display = 'none');

    // Remove o estado ativo de todos os botões do menu
    const botoes = document.querySelectorAll('.aba-btn');
    botoes.forEach(btn => btn.classList.remove('ativa'));

    // Mostra a seção desejada e ativa o botão correspondente
    document.getElementById('aba-' + nomeAba).style.display = 'block';
    document.getElementById('btn-' + nomeAba).classList.add('ativa');

    // Fecha o menu lateral automaticamente após o clique (ideal para telemóveis)
    const menu = document.getElementById('menu-lateral');
    if (menu) {
        menu.classList.remove('aberto');
    }
}

// ==========================================================================
// 3. MURAL DE RECADOS / CHAT EM TEMPO REAL
// ==========================================================================
const janelaChat = document.getElementById('janela-chat');
const inputMsg = document.getElementById('input-msg');
const btnEnviarMsg = document.getElementById('btn-enviar-msg');

db.collection('mensagens').orderBy('data', 'asc')
    .onSnapshot((snapshot) => {
        if (!janelaChat) return;
        janelaChat.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const dados = doc.data();
            const div = document.createElement('div');
            const usuarioAtual = auth.currentUser ? auth.currentUser.email : '';
            
            if (dados.usuario === usuarioAtual) {
                div.className = 'mensagem minha';
                div.innerHTML = `<span class="msg-autor">Você:</span><p class="msg-texto">${dados.texto}</p>`;
            } else {
                div.className = 'mensagem';
                const classeCargo = dados.cargo === 'pastor' ? 'pastor-cor' : '';
                div.innerHTML = `<span class="msg-autor ${classeCargo}">${dados.nome}:</span><p class="msg-texto">${dados.texto}</p>`;
            }
            janelaChat.appendChild(div);
        });
        janelaChat.scrollTop = janelaChat.scrollHeight;
    });

function enviarMensagem() {
    const texto = inputMsg.value.trim();
    if (texto === '') return;

    const usuarioLogado = auth.currentUser;
    const cargoSalvo = localStorage.getItem('userRole') || 'membro';

    if (!usuarioLogado) return;

    let nomeExibicao = usuarioLogado.email.split('@')[0];
    if (cargoSalvo === 'pastor') nomeExibicao = "Pastor " + nomeExibicao;

    db.collection('mensagens').add({
        texto: texto,
        usuario: usuarioLogado.email,
        nome: nomeExibicao,
        cargo: cargoSalvo,
        data: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => { inputMsg.value = ''; })
    .catch((erro) => { alert("Erro ao enviar: " + erro.message); });
}

if (btnEnviarMsg) btnEnviarMsg.addEventListener('click', enviarMensagem);
if (inputMsg) { inputMsg.addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagem(); }); }

// ==========================================================================
// 4. LÓGICA DA AGENDA EM TEMPO REAL
// ==========================================================================
const listaEventosContainer = document.querySelector('.lista-eventos');
db.collection('agenda').orderBy('ordemData', 'asc')
    .onSnapshot((snapshot) => {
        if (!listaEventosContainer) return;
        listaEventosContainer.innerHTML = ''; 

        snapshot.forEach((doc) => {
            const evento = doc.data();
            const div = document.createElement('div');
            div.className = 'item-evento';
            const classeBadge = evento.tipo === 'ensaio' ? 'badge-data gold' : 'badge-data';

            div.innerHTML = `
                <div class="evento-info">
                    <span class="${classeBadge}">${evento.diaHora}</span>
                    <p><strong>${evento.nome}</strong></p>
                    <small>${evento.detalhes}</small>
                </div>
            `;
            listaEventosContainer.appendChild(div);
        });
    });

function adicionarEvento() {
    const nomeInput = document.getElementById('evento-nome');
    const dataInput = document.getElementById('evento-data');
    if (!nomeInput || !dataInput) return;

    const nome = nomeInput.value.trim();
    const diaHora = dataInput.value.trim();
    const cargoSalvo = localStorage.getItem('userRole') || 'membro';

    if (cargoSalvo !== 'pastor') {
        alert("Acesso negado! Apenas Pastores ou Líderes podem alterar a agenda da igreja.");
        return;
    }

    if (nome === '' || diaHora === '') {
        alert("Preencha todos os campos!");
        return;
    }

    const tipo = nome.toLowerCase().includes('ensaio') ? 'ensaio' : 'culto';
    const detalhes = tipo === 'ensaio' ? 'Ministério de Música • Templo' : 'Geral • Templo Sede';

    db.collection('agenda').add({
        nome: nome,
        diaHora: diaHora,
        tipo: tipo,
        detalhes: detalhes,
        ordemData: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => { nomeInput.value = ''; dataInput.value = ''; alert("Culto/Ensaio publicado!"); })
    .catch((erro) => { alert("Erro ao salvar: " + erro.message); });
}

function adicionarLouvor() { alert("Louvores integrados em breve!"); }