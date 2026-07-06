// Configuração oficial do Firebase - AD Vila Iolanda
const firebaseConfig = {
    apiKey: "AIzaSyArnU0ORyMb8nWtYzX_rXExwN_9gXyACGw",
    authDomain: "ad-vila-iolanda.firebaseapp.com",
    projectId: "ad-vila-iolanda",
    storageBucket: "ad-vila-iolanda.firebasestorage.app",
    messagingSenderId: "485020412650",
    appId: "1:485020412650:web:bc45177de70bcaac668593",
    measurementId: "G-D03CEFTBJN"
};

// Inicializa o Firebase no modo de compatibilidade para rodar direto no navegador
firebase.initializeApp(firebaseConfig);

// Atalhos globais para usarmos nos outros códigos do aplicativo
const auth = firebase.auth();
const db = firebase.firestore();