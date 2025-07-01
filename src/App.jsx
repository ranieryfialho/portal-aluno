import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Code, Maximize2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Configuração do Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyANMr7iik2i8ANNqXZFVg_Q_2U64qT2LpU",
    authDomain: "boletim-escolar-app.firebaseapp.com",
    projectId: "boletim-escolar-app",
    storageBucket: "boletim-escolar-app.appspot.com",
    messagingSenderId: "629925665935",
    appId: "1:629925665935:web:ac8ad56de85161f649e4fa"
};

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

        try {
            const studentsRef = collection(db, 'students');
            const q = query(studentsRef, where("code", "==", trimmedCode));
            const studentQuerySnapshot = await getDocs(q);

            if (studentQuerySnapshot.empty) {
                setNotification({ type: 'error', message: 'Código de aluno não encontrado.' });
                setIsLoading(false);
                return;
            }

            const studentDoc = studentQuerySnapshot.docs[0];
            const studentMasterData = { id: studentDoc.id, ...studentDoc.data() };

            const collectionsToSearch = ['classes', 'concludentes'];
            let studentClassData = null;

            for (const collectionName of collectionsToSearch) {
                const classCollectionRef = collection(db, collectionName);
                const classQuerySnapshot = await getDocs(classCollectionRef);

                for (const classDoc of classQuerySnapshot.docs) {
                    const classData = classDoc.data();
                    if (classData.students && Array.isArray(classData.students)) {
                        const foundStudent = classData.students.find(s => String(s.code) === trimmedCode);
                        if (foundStudent) {
                            studentClassData = foundStudent;
                            break;
                        }
                    }
                }
                if (studentClassData) {
                    break;
                }
            }

            if (studentClassData) {
                const fullStudentData = {
                    ...studentMasterData,
                    grades: studentClassData.grades || {}
                };
                setNotification({ type: 'success', message: 'Login realizado com sucesso!' });
                setStudent(fullStudentData);
            } else {
                throw new Error("Não foi possível encontrar as notas do aluno em nenhuma turma.");
            }

        } catch (error) {
            console.error("Erro ao fazer login: ", error);
            setNotification({ type: 'error', message: error.message || 'Ocorreu um erro ao tentar fazer login.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <main className="flex-grow flex items-center justify-center p-4">
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
            </main>
            <Footer />
        </div>
    );
};

// --- Componente do Modal ---
const SubGradesModal = ({ subGrades, subjectName, onClose }) => {
    if (!subGrades) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Fechar modal"
                >
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Notas - {subjectName}</h3>
                <div className="border-t border-gray-200 pt-4">
                    <ul className="space-y-2">
                        {Object.entries(subGrades).map(([name, grade]) => {
                            const isNumericGrade = !isNaN(parseFloat(grade));
                            const gradeColorClass = isNumericGrade
                                ? parseFloat(grade) >= 7
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                : 'text-gray-800';

                            return (
                                <li key={name} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                    <span className="text-gray-600">{name}</span>
                                    <span className={`font-bold ${gradeColorClass}`}>{grade}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- NOVO Componente do Gráfico ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-sm" style={{ color: '#6366F1' }}>
                    {`Nota: ${payload[0].value.toFixed(1)}`}
                </p>
            </div>
        );
    }
    return null;
};

// O componente do gráfico
const GradesChart = ({ data, subjectFullNames }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 py-4">Não há dados de notas para exibir o gráfico.</p>;
    }

    const getFullSubjectName = (shortName) => subjectFullNames[shortName] || shortName;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 120 }}
            >
                {/* Linhas de grade no fundo, de forma suave */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                {/* Eixo X (nomes das matérias) */}
                <XAxis
                    dataKey="disciplina"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12, fill: '#4B5563' }}
                    tickFormatter={getFullSubjectName}
                    stroke="#d1d5db"
                />

                {/* Eixo Y (notas de 0 a 10) */}
                <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 12, fill: '#4B5563' }}
                    stroke="#d1d5db"
                />

                {/* A caixinha de informações */}
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c7d2fe', strokeWidth: 2 }} />

                {/* A LINHA PRINCIPAL DO GRÁFICO */}
                <Line
                    type="monotone" // Curva suave
                    dataKey="nota"
                    name="Nota Final"
                    stroke="#6366F1" // Cor da linha (um anil vibrante)
                    strokeWidth={3}
                    // Ponto em cada nota
                    dot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 2 }}
                    // Ponto maior quando o mouse está em cima
                    activeDot={{ r: 8, stroke: '#6366F1', fill: '#fff', strokeWidth: 2 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};


// --- Componente do Painel de Controlo (MODIFICADO) ---
const Dashboard = ({ student, setStudent }) => {
    const [selectedSubGrades, setSelectedSubGrades] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getDisplayName = (fullName) => {
        if (typeof fullName !== 'string') return '';
        const socialNameMatch = fullName.match(/\(([^)]+)\)/);
        if (socialNameMatch && socialNameMatch[1]) {
            return socialNameMatch[1].trim().split(' ')[0];
        }
        return fullName.split(' ')[0];
    };

    const displayName = getDisplayName(student.name);
    const subjectOrder = ["ICN", "OFFA", "ADM", "PWB", "TRI", "CMV"];
    const subjectFullNames = {
        "ICN": "ICN - INTERNET E COMPUTAÇÃO EM NUVEM",
        "OFFA": "OFFA - OFFICE APLICADO",
        "ADM": "ADM - ASSISTENTE ADMINISTRATIVO",
        "PWB": "PWB - POWERBI",
        "TRI": "TRI - TRATAMENTO DE IMAGENS COM PHOTOSHOP",
        "CMV": "CMV - COMUNICAÇÃO VISUAL COM ILLUSTRATOR"
    };

    const gradesList = useMemo(() => {
        const list = student.grades ? Object.entries(student.grades).map(([key, value]) => {
            let finalNota = 'N/D';
            let frequencia = 'N/A';
            let subGradesData = null;

            if (value && typeof value === 'object') {
                finalNota = value.finalGrade || 'N/D';
                frequencia = value.attendance || 'N/A';
                subGradesData = value.subGrades || null;
            } else if (typeof value === 'string' || typeof value === 'number') {
                finalNota = value;
            }

            return { id: key, disciplina: key, nota: finalNota, frequencia: frequencia, subGrades: subGradesData };
        }) : [];

        list.sort((a, b) => {
            const indexA = subjectOrder.indexOf(a.disciplina);
            const indexB = subjectOrder.indexOf(b.disciplina);
            if (indexA === -1) return 1; if (indexB === -1) return -1;
            return indexA - indexB;
        });
        return list;
    }, [student.grades]);

    const chartData = useMemo(() => {
        return gradesList
            .map(grade => ({
                disciplina: grade.disciplina,
                nota: !isNaN(parseFloat(grade.nota)) ? parseFloat(grade.nota) : 0
            }))
            .filter(grade => grade.nota > 0 || grade.nota === 0);
    }, [gradesList]);

    const handleGradeClick = (subGrades, subjectName) => {
        if (!subGrades) return;
        setSelectedSubGrades({ grades: subGrades, name: subjectName });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSubGrades(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
            <main className="flex-grow">
                <div className="max-w-4xl mx-auto">
                    <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Bem-vindo(a), <span className="text-blue-600">{displayName}</span>!</h1>
                        <button onClick={() => setStudent(null)} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                            Sair
                        </button>
                    </header>

                    {/* --- BLOCO DO BOLETIM (AGORA EM CIMA) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8"> {/* Adicionado mb-8 para dar espaço abaixo */}
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
                                            const gradeColorClass = isNumericGrade ? (parseFloat(grade.nota) >= 7 ? 'text-green-800 bg-green-100 font-bold' : 'text-red-800 bg-red-100 font-bold') : 'text-gray-600';
                                            const hasSubGrades = grade.subGrades && Object.keys(grade.subGrades).length > 0;
                                            const clickableClass = hasSubGrades ? 'cursor-pointer hover:bg-gray-200' : '';

                                            return (
                                                <tr key={grade.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subjectFullNames[grade.disciplina] || grade.disciplina}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center transition-colors ${gradeColorClass} ${clickableClass}`} onClick={() => handleGradeClick(grade.subGrades, subjectFullNames[grade.disciplina])}>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span>{grade.nota}</span>
                                                            {hasSubGrades && <Maximize2 size={14} className="opacity-50" />}
                                                        </div>
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

                    {/* --- BLOCO DO GRÁFICO (AGORA EM BAIXO) --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-6 text-gray-700">Desempenho Geral</h2>
                        <GradesChart data={chartData} subjectFullNames={subjectFullNames} />
                    </div>

                </div>
            </main>
            <Footer />
            {isModalOpen && (
                <SubGradesModal
                    subGrades={selectedSubGrades.grades}
                    subjectName={selectedSubGrades.name}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

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