// ==========================================================================
// 1. CARREGAR E EXIBIR AVISOS OFICIAIS DO FIRESTORE
// ==========================================================================
const listaAvisosContainer = document.getElementById('lista-avisos');

db.collection('avisos').orderBy('data', 'desc')
    .onSnapshot((snapshot) => {
        if (!listaAvisosContainer) return;
        listaAvisosContainer.innerHTML = '';

        if (snapshot.empty) {
            listaAvisosContainer.innerHTML = '<p style="color: #64748b;">Nenhum aviso importante publicado ainda.</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const aviso = doc.data();
            const div = document.createElement('div');
            div.className = 'item-aviso';
            div.innerHTML = `
                <div class="aviso-corpo">
                    <h4><i class="fa-solid fa-triangle-exclamation"></i> ${aviso.titulo}</h4>
                    <p>${aviso.texto}</p>
                </div>
            `;
            listaAvisosContainer.appendChild(div);
        });
    });

// ==========================================================================
// 2. PUBLICAR NOVO AVISO (BLOQUEADO PARA MEMBROS)
// ==========================================================================
function adicionarAviso() {
    const tituloInput = document.getElementById('aviso-titulo');
    const textoInput = document.getElementById('aviso-texto');
    const cargoSalvo = localStorage.getItem('userRole') || 'membro';

    if (cargoSalvo !== 'pastor') {
        alert("Acesso negado! Apenas Pastores e Líderes Oficiais podem emitir avisos gerais.");
        return;
    }

    const titulo = tituloInput.value.trim();
    const texto = textoInput.value.trim();

    if (titulo === '' || texto === '') {
        alert("Preencha o título e o texto do comunicado!");
        return;
    }

    db.collection('avisos').add({
        titulo: titulo,
        texto: texto,
        data: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        tituloInput.value = '';
        textoInput.value = '';
        alert("Aviso oficial emitido com sucesso!");
    })
    .catch((erro) => {
        alert("Erro ao publicar: " + erro.message);
    });
}

// ==========================================================================
// 3. COPIAR CHAVE PIX AUTOMATICAMENTE
// ==========================================================================
function copiarPix() {
    const chaveTexto = document.getElementById('chave-pix-texto').innerText;
    
    // Executa a cópia para a área de transferência do celular ou PC
    navigator.clipboard.writeText(chaveTexto)
        .then(() => {
            alert("Chave PIX copiada! Abra o app do seu banco e cole na opção 'Copiar e Colar'.");
        })
        .catch((erro) => {
            alert("Erro ao copiar chave: " + erro);
        });
}