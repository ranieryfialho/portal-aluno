// src/App.jsx (CORRIGIDO com controle de autenticação)

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// 1. IMPORTAR AS FUNÇÕES DE AUTENTICAÇÃO
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'; 

import Dashboard from './components/Dashboard';
import LoginComponent from './components/LoginComponent';
import Notification from './components/Notification';
import { LoaderCircle } from 'lucide-react'; // Para um loading inicial

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 2. INICIAR O SERVIÇO DE AUTENTICAÇÃO

export default function App() {
    const [student, setStudent] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // 3. NOVO ESTADO PARA CONTROLAR SE A AUTENTICAÇÃO ESTÁ PRONTA
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Tenta pegar o aluno salvo no localStorage
        const savedStudentData = localStorage.getItem('studentData');
        if (savedStudentData) {
            setStudent(JSON.parse(savedStudentData));
        }

        // 4. LÓGICA DE AUTENTICAÇÃO ANÔNIMA
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Se já existe um usuário (anônimo ou não), estamos prontos
                setIsAuthReady(true);
            } else {
                // Se não há usuário, tenta fazer o login anônimo
                signInAnonymously(auth)
                    .then(() => {
                        setIsAuthReady(true);
                    })
                    .catch((error) => {
                        console.error("Erro no login anônimo:", error);
                        setNotification({ message: 'Erro de conexão. Verifique suas regras de segurança.', type: 'error' });
                    });
            }
        });

        // Limpa o listener quando o componente é desmontado
        return () => unsubscribe();
    }, []); // O array vazio [] garante que isso rode apenas uma vez

    // 5. MOSTRAR UM LOADING ENQUANTO A AUTENTICAÇÃO NÃO ESTÁ PRONTA
    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-600">Conectando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="antialiased text-gray-800">
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
            {student ? (
                <Dashboard student={student} setStudent={setStudent} db={db} />
            ) : (
                <LoginComponent 
                    setStudent={setStudent} 
                    setNotification={setNotification} 
                    db={db} 
                />
            )}
        </div>
    );
}