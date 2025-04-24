import { auth, database } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export async function registrarUsuario(nome, email, senha) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        await set(ref(database, `usuarios/${user.uid}`), {
            nome: nome,
            email: email,
            vitorias: 0,
            ultimoAcesso: serverTimestamp(),
            strik: 0
        });

        return user;
    } catch (error) {
        throw error;
    }
}

export async function fazerLogin(email, senha) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        await set(ref(database, `usuarios/${user.uid}/ultimoAcesso`), serverTimestamp());
        return user;
    } catch (error) {
        throw error;
    }
}

export function verificarAutenticacao() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
}

export const fazerLogout = async () => {
    try {
        await signOut(auth);
        console.log('Logout successful');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};
