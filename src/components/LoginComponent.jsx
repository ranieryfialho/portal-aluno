import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Footer from './Footer';

const LoginComponent = ({ setStudent, setNotification, db }) => {
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

export default LoginComponent;