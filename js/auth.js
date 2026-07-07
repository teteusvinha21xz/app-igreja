document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    localStorage.setItem('userRole', role);
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                        auth.createUserWithEmailAndPassword(email, password)
                            .then((userCredential) => {
                                alert("Conta registrada com sucesso no portal AD Vila Iolanda!");
                                localStorage.setItem('userRole', role);
                                window.location.href = 'dashboard.html';
                            })
                            .catch((erroCriar) => {
                                if (erroCriar.code === 'auth/email-already-in-use') {
                                    alert("Este e-mail já está cadastrado. Verifique a senha digitada!");
                                } else {
                                    alert("Erro ao processar acesso: " + erroCriar.message);
                                }
                            });
                    } else {
                        alert("Erro ao acessar: " + error.message);
                    }
                });
        });
    }
});