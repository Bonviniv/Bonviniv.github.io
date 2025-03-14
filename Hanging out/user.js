// Carregar nome do usuário ao abrir a página
window.onload = function() {
    carregarNomeUsuario();
    adicionarListeners();
};

// Função para carregar o nome do usuário
function carregarNomeUsuario() {
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    if (nomeUsuario) {
        document.getElementById('usuario-exibido').textContent = nomeUsuario;
    }
}

function mudarNomePainel() {
    const nomeBtn = document.getElementById('nome-btn');
    if (nomeBtn) {
        nomeBtn.addEventListener('click', () => {
            const form = document.getElementById('form-container');
            if (form) {
                form.style.display = 'block';
                nomeBtn.style.display = 'none';
            } else {
                console.error('erro com btn mudar nome');
            }
        });
    }
}

function salvarNomeUsuario() {
    const btnInst = document.getElementById('salvar-btn');
    const nomeBtn = document.getElementById('nome-btn');
    const formPainel = document.getElementById('form-container');
    if (btnInst) {
        btnInst.addEventListener('click', () => {
            const nome = document.getElementById('nome-usuario').value;
            console.log('nome-usuario :' + nome);
            if (nome) {
                localStorage.setItem('nomeUsuario', nome);
                document.getElementById('usuario-exibido').textContent = nome;
                document.getElementById('nome-usuario').value = ''; // Limpa o campo de entrada
                formPainel.style.display = 'none';
                nomeBtn.style.display = 'block';
            } else {
                formPainel.style.display = 'none';
                nomeBtn.style.display = 'block';
            }
        });
    }
}

function mostrarInstrucoes() {
    const btnVoltar = document.getElementById('fechar-instrucoes-btn');
    const btnInst = document.getElementById('instrucoes-btn');
    const imageLinks = document.getElementById('ImagensLink');
    if (btnInst) {
        btnInst.addEventListener('click', () => {
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('voltar-btn').style.display = 'none';
           
            document.getElementById('instrucoes-painel').style.display = 'block';
            document.getElementById('instrucoes-btn').style.display = 'none';
            btnVoltar.style.display = 'block';
            imageLinks.style.display = 'none';

            // Verificar se é desktop
            if (window.innerWidth > 1024) {
                console.log('desktop');
            }
        });
    }
}

function fecharInstrucoes() {
    const btnVoltar = document.getElementById('fechar-instrucoes-btn');
    const btnInst = document.getElementById('fechar-instrucoes-btn');
    const imageLinks = document.getElementById('ImagensLink');
    if (btnInst) {
        btnInst.addEventListener('click', () => {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('voltar-btn').style.display = 'block';
            document.getElementById('instrucoes-painel').style.display = 'none';
            document.getElementById('instrucoes-btn').style.display = 'block';
            btnVoltar.style.display = 'none';
            imageLinks.style.display = 'flex';
        });
    }
}

function voltarHanging() {
    const btnInst = document.getElementById('voltar-btn');
    if (btnInst) {
        btnInst.addEventListener('click', () => {
            btnInst.style.display = 'none';
            window.location.href = 'hanging.html';
        });
    }
}

// Função para adicionar listeners aos botões
function adicionarListeners() {
    voltarHanging();
    salvarNomeUsuario();
    mostrarInstrucoes();
    fecharInstrucoes();
    mudarNomePainel();
}