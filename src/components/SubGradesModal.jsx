import React from 'react';
import { X } from 'lucide-react';

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

export default SubGradesModal;