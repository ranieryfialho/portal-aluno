import React from 'react';
import { ArrowRight, BarChart3, CalendarDays } from 'lucide-react';
import Footer from './Footer.jsx';

const HomePage = ({ student, setStudent, setView }) => {

    const handleLogout = () => {
        localStorage.removeItem('studentData');
        setStudent(null);
    };

    const getDisplayName = (fullName) => {
        if (typeof fullName !== 'string') return '';
        const socialNameMatch = fullName.match(/\(([^)]+)\)/);
        if (socialNameMatch && socialNameMatch[1]) {
            return socialNameMatch[1].trim().split(' ')[0];
        }
        return fullName.split(' ')[0];
    };

    const displayName = getDisplayName(student.name);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto">
                    <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Bem-vindo(a), <span className="text-blue-600">{displayName}</span>!
                        </h1>
                        <button 
                            onClick={handleLogout} 
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Sair
                        </button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div 
                            onClick={() => setView('performance')} 
                            className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <BarChart3 className="text-blue-600" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Desempenho Acadêmico</h2>
                                </div>
                                <p className="text-gray-600">
                                    Acesse seu boletim detalhado, veja gráficos de performance e receba sugestões de estudo personalizadas.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center justify-end text-blue-600 font-semibold group-hover:underline">
                                Acessar Desempenho
                                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
                            </div>
                        </div>

                        <div 
                            onClick={() => setView('events')}
                            className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <CalendarDays className="text-green-600" size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Mural de Eventos</h2>
                                </div>
                                <p className="text-gray-600">
                                    Veja os eventos disponíveis para inscrição e gerencie os eventos em que você já se cadastrou.
                                </p>
                            </div>
                            <div className="mt-6 flex items-center justify-end text-green-600 font-semibold group-hover:underline">
                                Acessar Eventos
                                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;