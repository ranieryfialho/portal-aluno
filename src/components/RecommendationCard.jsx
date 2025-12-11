// src/components/RecommendationCard.jsx

import React, { useState, useEffect } from 'react';
import { Youtube, LoaderCircle, ImageOff } from 'lucide-react';
import { fetchStudyMaterials } from '../services/googleSearch';

// A props 'subjectFullName' foi removida pois não é mais necessária aqui
const RecommendationCard = ({ subject }) => { 
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchedQuery, setSearchedQuery] = useState(null);

    useEffect(() => {
        const getMaterials = async () => {
            setIsLoading(true);

            // CORREÇÃO: Agora desestruturamos o objeto retornado pela função
            const { results, searchedQuery } = await fetchStudyMaterials(subject.disciplina);
            
            setRecommendations(results); // Armazenamos apenas a lista de resultados
            setSearchedQuery(searchedQuery);
            setIsLoading(false);
        };
        getMaterials();
    }, [subject.disciplina]); // A dependência subjectFullName foi removida

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                    <LoaderCircle size={18} className="animate-spin" />
                    Buscando os melhores vídeos para você...
                </div>
            );
        }

        if (!recommendations || recommendations.length === 0) {
            return (
                <p className="text-gray-600">
                    Não encontramos um vídeo específico para este tópico, mas que tal pesquisar por 
                    <a 
                        href={`http://googleusercontent.com/youtube.com/5/results?search_query=${encodeURIComponent(searchedQuery)}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-700 hover:underline ml-1"
                    >
                        {searchedQuery} no YouTube
                    </a>?
                </p>
            );
        }

        return (
            <ul className="space-y-4">
                {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-4">
                        <a href={rec.link} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                            {rec.thumbnail ? (
                                <img src={rec.thumbnail} alt={`Thumbnail para ${rec.title}`} className="w-32 h-20 object-cover rounded-md bg-gray-200 hover:scale-105 transition-transform" />
                            ) : (
                                <div className="w-32 h-20 rounded-md bg-gray-200 flex items-center justify-center">
                                    <ImageOff className="text-gray-400" />
                                </div>
                            )}
                        </a>
                        <div>
                            <a href={rec.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                                {rec.title}
                            </a>
                            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                                <Youtube size={16} className="text-red-500" />
                                <span>YouTube</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-4 transition-opacity duration-300">
            <h3 className="font-bold text-amber-800">{subject.disciplina} - {subject.nota}</h3>
            <p className="text-amber-700 mt-1 mb-3">
                Ótima oportunidade para aprofundar seus conhecimentos! Confira estes vídeos:
            </p>
            {renderContent()}
        </div>
    );
};

export default RecommendationCard;