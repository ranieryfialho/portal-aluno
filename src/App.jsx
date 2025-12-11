import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'; 

import LoginComponent from './components/LoginComponent.jsx';
import Notification from './components/Notification.jsx';
import { LoaderCircle } from 'lucide-react';
import HomePage from './components/HomePage.jsx';
import DesempenhoPage from './components/DesempenhoPage.jsx';
import EventosPage from './pages/EventosPage.jsx';
import StudentLabPage from './pages/StudentLabPage.jsx'; // Importe a nova página

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
const auth = getAuth(app);

export default function App() {
    const [student, setStudent] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [view, setView] = useState('home');

    useEffect(() => {
        const savedStudentData = localStorage.getItem('studentData');
        if (savedStudentData) {
            setStudent(JSON.parse(savedStudentData));
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthReady(true);
            } else {
                signInAnonymously(auth).then(() => setIsAuthReady(true)).catch(console.error);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!student) {
            setView('home');
        }
    }, [student]);


    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <LoaderCircle className="w-10 h-10 text-blue-600 animate-spin" />
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
                <>
                    {view === 'home' && <HomePage student={student} setStudent={setStudent} setView={setView} db={db} />}
                    {view === 'performance' && <DesempenhoPage student={student} setView={setView} db={db} />}
                    {view === 'events' && <EventosPage student={student} setView={setView} db={db} />}
                    {/* Renderiza a página do laboratório */}
                    {view === 'laboratorio' && <StudentLabPage student={student} setView={setView} db={db} />}
                </>
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