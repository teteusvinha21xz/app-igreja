// CARREGAR PERFIL EXISTENTE
auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection('perfis').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const dados = doc.data();
                    document.getElementById('perfil-nome').value = dados.nome || "";
                    document.getElementById('perfil-nascimento').value = dados.nascimento || "";
                    document.getElementById('perfil-whats').value = dados.whatsapp || "";
                }
            });
    }
});

// SALVAR PERFIL
function salvarPerfil() {
    const user = auth.currentUser;
    if (!user) return;

    const nome = document.getElementById('perfil-nome').value.trim();
    const nascimento = document.getElementById('perfil-nascimento').value;
    const whats = document.getElementById('perfil-whats').value.trim();

    if (nome === "" || nascimento === "") {
        alert("Por favor, preencha seu nome e data de nascimento!");
        return;
    }

    const mesNascimento = nascimento.split('-')[1];

    db.collection('perfis').doc(user.uid).set({
        nome: nome,
        nascimento: nascimento,
        whatsapp: whats,
        mes: mesNascimento,
        email: user.email,
        uid: user.uid
    })
    .then(() => { 
        alert("Perfil atualizado com sucesso!");
    })
    .catch((erro) => { alert("Erro ao salvar: " + erro.message); });
}

// FILTRAR ANIVERSARIANTES DO MÊS
function carregarAniversariantes() {
    const listaContainer = document.getElementById('lista-aniversariantes');
    if (!listaContainer) return;

    const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');

    db.collection('perfis').where('mes', '==', mesAtual)
        .onSnapshot((snapshot) => {
            listaContainer.innerHTML = '';
            if (snapshot.empty) {
                listaContainer.innerHTML = '<p style="color: #64748b;">Nenhum aniversariante este mês.</p>';
                return;
            }
            snapshot.forEach((doc) => {
                const p = doc.data();
                const dia = p.nascimento.split('-')[2];
                const mes = p.nascimento.split('-')[1];
                const div = document.createElement('div');
                div.className = 'item-aniversario';
                div.innerHTML = `
                    <div class="niver-info">
                        <span class="niver-data">${dia}/${mes}</span>
                        <strong>${p.nome}</strong>
                    </div>
                    <a href="https://wa.me/55${p.whatsapp.replace(/\D/g,'')}" target="_blank" class="btn-parabenizar">
                        <i class="fa-brands fa-whatsapp"></i> Parabéns
                    </a>
                `;
                listaContainer.appendChild(div);
            });
        });
}
carregarAniversariantes();