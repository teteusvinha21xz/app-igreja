// ==========================================================================
// 1. VERIFICAÇÃO DE SEGURANÇA E CONTROLE DE SESSÃO
// ==========================================================================
auth.onAuthStateChanged((user) => {
    if (!user) {
        // Se não há usuário logado no Firebase, expulsa para a tela de login
        window.location.href = 'index.html';
    } else {
        // Se estiver logado, exibe o e-mail do irmão no topo do painel
        const statusEmail = document.getElementById('user-display-email');
        if (statusEmail) statusEmail.innerText = user.email;
    }
});

// Botão de Sair (Logoff)
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
// 2. CONTROLADOR DE ABAS (Troca de telas)
// ==========================================================================
function mudarAba(nomeAba) {
    const secoes = document.querySelectorAll('.conteudo-aba');
    secoes.forEach(aba => aba.style.display = 'none');

    const botoes = document.querySelectorAll('.aba-btn');
    botoes.forEach(btn => btn.classList.remove('ativa'));

    document.getElementById('aba-' + nomeAba).style.display = 'block';
    document.getElementById('btn-' + nomeAba).classList.add('ativa');
}

// ==========================================================================
// 3. LÓGICA DO CHAT EM TEMPO REAL (FIRESTORE)
// ==========================================================================
const janelaChat = document.getElementById('janela-chat');
const inputMsg = document.getElementById('input-msg');
const btnEnviarMsg = document.getElementById('btn-enviar-msg');

// Escuta as mensagens do banco de dados continuamente
db.collection('mensagens').orderBy('data', 'asc')
    .onSnapshot((snapshot) => {
        if (!janelaChat) return;
        janelaChat.innerHTML = ''; // Limpa o chat para atualizar
        
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
        
        janelaChat.scrollTop = janelaChat.scrollHeight; // Rola para o fim
    });

// Função para enviar mensagem no Mural
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
    .then(() => {
        inputMsg.value = '';
    })
    .catch((erro) => {
        alert("Erro ao enviar mensagem: " + erro.message);
    });
}

if (btnEnviarMsg) btnEnviarMsg.addEventListener('click', enviarMensagem);
if (inputMsg) {
    inputMsg.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') enviarMensagem();
    });
}

// ==========================================================================
// 4. LÓGICA DA AGENDA EM TEMPO REAL (FIRESTORE)
// ==========================================================================
const listaEventosContainer = document.querySelector('.lista-eventos');

// Escuta os cultos e ensaios salvos no Firestore
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

// Função para criar evento (Apenas Pastor)
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
        alert("Preencha todos os campos do evento!");
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
    .then(() => {
        nomeInput.value = '';
        dataInput.value = '';
        alert("Culto/Ensaio publicado com sucesso!");
    })
    .catch((erro) => {
        alert("Erro ao salvar agenda: " + erro.message);
    });
}

// ==========================================================================
// 5. ABA LOUVORES (Temporário para desenvolvimento)
// ==========================================================================
function adicionarLouvor() { 
    alert("Perfeito! Agenda e Chat concluídos. Louvores será a nossa próxima integração!"); 
}