import React, { useState, useMemo } from 'react';
import { ArrowLeft, Maximize2 } from 'lucide-react';
import GradesChart from './GradesChart';
import SubGradesModal from './SubGradesModal';
import Footer from './Footer';
import RecommendationCard from './RecommendationCard';
import MeusEventos from './MeusEventos'; 

const DesempenhoPage = ({ student, setView, db }) => {
    const [selectedSubGrades, setSelectedSubGrades] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            let subGradesData = null;

            if (value && typeof value === 'object') {
                finalNota = value.finalGrade || 'N/D';
                subGradesData = value.subGrades || null;
            } else if (typeof value === 'string' || typeof value === 'number') {
                finalNota = value;
            }

            return { id: key, disciplina: key, nota: finalNota, subGrades: subGradesData };
        }) : [];

        list.sort((a, b) => {
            const indexA = subjectOrder.indexOf(a.disciplina);
            const indexB = subjectOrder.indexOf(b.disciplina);
            if (indexA === -1) return 1; if (indexB === -1) return -1;
            return indexA - indexB;
        });
        return list;
    }, [student.grades]);

    const subjectsForImprovement = useMemo(() => {
        return gradesList.filter(grade => {
            const numericGrade = parseFloat(grade.nota);
            return !isNaN(numericGrade) && numericGrade <= 8;
        });
    }, [gradesList]);

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
                <div className="max-w-7xl mx-auto">
                    <header className="flex justify-between items-center mb-8">
                        <button onClick={() => setView('home')} className="flex items-center gap-2 text-blue-600 hover:underline">
                            <ArrowLeft size={18} />
                            Voltar
                        </button>
                    </header>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Meu Desempenho Acadêmico</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">

                        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 lg:mb-0">
                            <h2 className="text-xl font-semibold mb-6 text-gray-700">O seu Boletim</h2>
                            <div className="overflow-x-auto">
                                {gradesList.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disciplina</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nota Final</th>
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

                        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 lg:mb-0">
                            <h2 className="text-xl font-semibold mb-6 text-gray-700">Desempenho Geral</h2>
                            <GradesChart data={chartData} subjectFullNames={subjectFullNames} />
                        </div>


                        {subjectsForImprovement.length > 0 && (
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                                <h2 className="text-xl font-semibold mb-6 text-gray-700">Sugestões para aprimorar seus estudos</h2>
                                {subjectsForImprovement.map(subject => (
                                    <RecommendationCard
                                        key={subject.id}
                                        subject={subject}
                                        subjectFullName={subjectFullNames[subject.disciplina] || subject.disciplina}
                                    />
                                ))}
                            </div>
                        )}
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

export default DesempenhoPage;