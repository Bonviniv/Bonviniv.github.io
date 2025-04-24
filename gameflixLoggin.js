import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCU9Qg49gLZTjwkdKXCuDGNFfHT-r3TNbw",
    authDomain: "forca-a842a.firebaseapp.com",
    databaseURL: "https://forca-a842a-default-rtdb.firebaseio.com",
    projectId: "forca-a842a",
    storageBucket: "forca-a842a.firebasestorage.app",
    messagingSenderId: "193655210620",
    appId: "1:193655210620:web:d9e031a1bf40c757927ff9",
    measurementId: "G-G9WJMEKCFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// Add initialization status check
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.email);
    } else {
        console.log('No user signed in');
    }
});

// Add error handling for initialization
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Auth state: User is signed in', user.uid);
    } else {
        console.log('Auth state: No user signed in');
    }
}, (error) => {
    console.error('Auth state error:', error);
});

// Password visibility toggle
document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Form switching
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

// Register
document.getElementById('registerButton').addEventListener('click', async () => {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('registerError');
    const successElement = document.getElementById('registerSuccess');

    console.log('Registration attempt:', { name, email }); // Log registration data

    errorElement.style.display = 'none';
    successElement.style.display = 'none';

    if (!name || !email || !password || !confirmPassword) {
        console.log('Missing fields:', { name, email, password: !!password, confirmPassword: !!confirmPassword });
        errorElement.textContent = 'Preencha todos os campos';
        errorElement.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        console.log('Password mismatch');
        errorElement.textContent = 'As senhas não coincidem';
        errorElement.style.display = 'block';
        return;
    }

    try {
        console.log('Attempting to create user with Firebase...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User created successfully:', user.uid);

        console.log('Attempting to save user data to database...');
        await set(ref(database, `usuarios/${user.uid}`), {
            nome: name,
            email: email,
            vitorias: 0,
            ultimoAcesso: serverTimestamp(),
            strik: 0
        });
        console.log('User data saved successfully');

        successElement.textContent = 'Conta criada com sucesso!';
        successElement.style.display = 'block';
        
        setTimeout(() => {
            window.location.href = 'gameflix.html';
        }, 2000);
    } catch (error) {
        console.error('Registration error:', error.code, error.message, error);
        let message = 'Erro ao criar conta';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Este email já está em uso';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/weak-password':
                message = 'A senha deve ter pelo menos 6 caracteres';
                break;
            case 'auth/configuration-not-found':
                message = 'Erro de configuração do Firebase. Por favor, tente novamente mais tarde.';
                break;
            default:
                message = `Erro ao criar conta: ${error.code}`;
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
});

// Login
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorElement = document.getElementById('loginError');

    errorElement.style.display = 'none';

    if (!email || !password) {
        errorElement.textContent = 'Preencha todos os campos';
        errorElement.style.display = 'block';
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'gameflix.html';
    } catch (error) {
        let message = 'Erro ao fazer login';
        if (error.code === 'auth/user-not-found') {
            message = 'Usuário não encontrado';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Senha incorreta';
        } else if (error.code === 'auth/invalid-credential') {
            message = 'Credenciais inválidas';
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
});

// Initialize Google Auth Provider
// Remove this line since it's already declared at the top
// const googleProvider = new GoogleAuthProvider();

// Keep the event listener
document.getElementById('googleSignIn').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Save user data to database if it's a new user
        await set(ref(database, `usuarios/${user.uid}`), {
            nome: user.displayName,
            email: user.email,
            vitorias: 0,
            ultimoAcesso: serverTimestamp(),
            strik: 0
        });

        window.location.href = 'gameflix.html';
    } catch (error) {
        console.error('Google sign in error:', error);
        const errorElement = document.getElementById('loginError');
        errorElement.textContent = 'Erro ao fazer login com Google';
        errorElement.style.display = 'block';
    }
});