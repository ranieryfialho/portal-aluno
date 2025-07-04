import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Importe o getFirestore aqui
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import Notification from './components/Notification';
import LoginComponent from './components/LoginComponent';
import Dashboard from './components/Dashboard';

// --- Configuração do Firebase ---
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// --- Inicialização do Firebase ---
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Erro ao inicializar o Firebase. Verifique a sua configuração.", error);
}

// --- Componente Principal da Aplicação ---
export default function App() {
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [student, setStudent] = useState(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!auth) {
            setIsAuthReady(true);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Falha no login anônimo:", error);
                    setNotification({ type: 'error', message: 'Falha ao conectar com o serviço.' })
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const handleCloseNotification = () => {
        setNotification(null);
    };

    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="text-xl font-semibold text-gray-600">A carregar...</div>
            </div>
        );
    }

    return (
        <div className="antialiased text-gray-800">
            <Notification
                message={notification?.message}
                type={notification?.type}
                onClose={handleCloseNotification}
            />
            {student ? (
                <Dashboard student={student} setStudent={setStudent} />
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