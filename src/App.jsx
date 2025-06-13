import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Code } from 'lucide-react';

// --- Configuração do Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyANMr7iik2i8ANNqXZFVg_Q_2U64qT2LpU",
  authDomain: "boletim-escolar-app.firebaseapp.com",
  projectId: "boletim-escolar-app",
  storageBucket: "boletim-escolar-app.appspot.com",
  messagingSenderId: "629925665935",
  appId: "1:629925665935:web:ac8ad56de85161f649e4fa"
};

const classesCollectionPath = 'classes';

// --- Inicialização do Firebase ---
let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (error) {
    console.error("Erro ao inicializar o Firebase. Verifique a sua configuração.", error);
}

// --- Componente de Rodapé ---
function Footer() {
  return (
    <footer className="w-full mt-auto py-6 text-center">
      <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
        <Code size={16} className="text-gray-500" />
        <span>Desenvolvido por</span>
        <a 
          href="https://github.com/ranieryfialho/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Raniery Fialho
        </a>
      </p>
    </footer>
  );
}

// --- Componente de Notificação ---
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const baseStyle = "p-4 rounded-md my-4 text-white flex justify-between items-center shadow-lg";
    const styles = {
        error: "bg-red-500",
        success: "bg-green-500",
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-5 right-5 z-50 animate-fade-in-down ${baseStyle} ${styles[type]}`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold text-xl">&times;</button>
        </div>
    );
};

// --- Componente de Login ---
const LoginComponent = ({ setStudent, setNotification }) => {
    const [studentCode, setStudentCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const trimmedCode = studentCode.trim();
        if (!trimmedCode) {
            setNotification({ type: 'error', message: 'Por favor, insira o seu código.' });
            return;
        }
        setIsLoading(true);
        const codeAsNumber = parseInt(trimmedCode, 10);

        if (isNaN(codeAsNumber)) {
            setNotification({ type: 'error', message: 'O código deve conter apenas números.' });
            setIsLoading(false);
            return;
        }

        try {
            const classesRef = collection(db, classesCollectionPath);
            const classesSnapshot = await getDocs(classesRef);
            let foundStudent = null;
            for (const classDoc of classesSnapshot.docs) {
                const classData = classDoc.data();
                if (classData.students && Array.isArray(classData.students)) {
                    const studentFromArray = classData.students.find(student => student.code === codeAsNumber);
                    if (studentFromArray) {
                        foundStudent = studentFromArray;
                        break;
                    }
                }
            }

            if (foundStudent) {
                setNotification({ type: 'success', message: 'Login realizado com sucesso!' });
                setStudent({ id: foundStudent.code, ...foundStudent });
            } else {
                setNotification({ type: 'error', message: 'Código de aluno não encontrado.' });
                setStudent(null);
            }
        } catch (error) {
            console.error("Erro ao fazer login: ", error);
            setNotification({ type: 'error', message: 'Ocorreu um erro ao tentar fazer login.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Portal do Aluno</h1>
                    <p className="text-gray-500 mt-2">Consulte as suas notas e frequência</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label htmlFor="studentCode" className="block text-sm font-medium text-gray-700 mb-1">Seu Código de Aluno</label>
                        <input id="studentCode" type="text" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Digite o seu código aqui" required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors duration-300">
                        {isLoading ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

// --- Componente do Painel de Controlo (com Nomes Completos dos Módulos) ---
const Dashboard = ({ student, setStudent }) => {
    
    const subjectOrder = ["ICN", "OFFA", "ADM", "PWB", "TRI", "CMV"];

    const subjectFullNames = {
        "ICN": "ICN - INTERNET E COMPUTAÇÃO EM NUVEM",
        "OFFA": "OFFA - OFFICE APLICADO",
        "ADM": "ADM - ASSISTENTE ADMINISTRATIVO",
        "PWB": "PWB - POWERBI",
        "TRI": "TRI - TRATAMENTO DE IMAGENS COM PHOTOSHOP",
        "CMV": "CMV - COMUNICAÇÃO VISUAL COM ILLUSTRATOR"
    };

    const gradesList = student.grades ? Object.entries(student.grades).map(([key, value]) => {
        let finalNota = 'N/D';
        let frequencia = 'N/A';

        if (value && typeof value === 'object') {
            finalNota = value.finalGrade || 'N/D';
            frequencia = value.attendance || 'N/A';
        } 
        else if (typeof value === 'string' || typeof value === 'number') {
            finalNota = value;
        }

        return {
            id: key,
            disciplina: key,
            nota: finalNota,
            frequencia: frequencia
        };
    }) : [];

    gradesList.sort((a, b) => {
        const indexA = subjectOrder.indexOf(a.disciplina);
        const indexB = subjectOrder.indexOf(b.disciplina);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
            <main className="flex-grow">
                <div className="max-w-4xl mx-auto">
                    <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Bem-vindo(a), <span className="text-blue-600">{student.name.split(' ')[0]}</span>!</h1>
                        <button onClick={() => setStudent(null)} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                            Sair
                        </button>
                    </header>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-6 text-gray-700">O seu Boletim</h2>
                        <div className="overflow-x-auto">
                            {gradesList.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nota Final</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Frequência (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {gradesList.map((grade) => {
                                            const isNumericGrade = !isNaN(parseFloat(grade.nota));
                                            const gradeColorClass = isNumericGrade
                                                ? parseFloat(grade.nota) >= 7
                                                    ? 'text-green-800 bg-green-100 font-bold'
                                                    : 'text-red-800 bg-red-100 font-bold'
                                                : 'text-gray-600';

                                            return (
                                                <tr key={grade.id} className="hover:bg-gray-50">
                                                    {/* 2. Usamos o mapa para exibir o nome completo */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {subjectFullNames[grade.disciplina] || grade.disciplina}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${gradeColorClass}`}>
                                                        {grade.nota}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">{grade.frequencia}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-gray-500 py-8">Ainda não há notas lançadas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};


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
                    console.error("Falha no login anónimo:", error);
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
                <LoginComponent setStudent={setStudent} setNotification={setNotification} />
            )}
        </div>
    );
}