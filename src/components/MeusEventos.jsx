import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Calendar, Check, Clock, LoaderCircle, PartyPopper } from 'lucide-react';

const MeusEventos = ({ student, db }) => {
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!student || !student.name) return;

        const fetchInscricoes = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'event_registrations'),
                    where('name', '==', student.name)
                );
                
                const querySnapshot = await getDocs(q);
                const eventosData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                eventosData.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
                setInscricoes(eventosData);

            } catch (error) {
                console.error("Erro ao buscar eventos inscritos: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInscricoes();
    }, [student, db]);

    const handleCheckin = async (inscricaoId) => {
        const inscricaoRef = doc(db, 'event_registrations', inscricaoId);
        try {
            await updateDoc(inscricaoRef, {
                checkedIn: true
            });
            setInscricoes(prev => 
                prev.map(item => 
                    item.id === inscricaoId ? { ...item, checkedIn: true } : item
                )
            );
            alert('Check-in realizado com sucesso!');
        } catch (error) {
            console.error("Erro ao fazer check-in:", error);
            alert('Não foi possível fazer o check-in.');
        }
    };

    const isCheckinAvailable = (eventDate) => {
        if (!eventDate) return false;
        const hoje = new Date();
        const dataEvento = new Date(eventDate + 'T00:00:00');
        return hoje.toDateString() === dataEvento.toDateString();
    };
    
    if (loading) {
        return (
            <div className="flex items-center gap-2 text-gray-500">
                <LoaderCircle size={18} className="animate-spin" />
                Carregando seus eventos...
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Meus Eventos</h2>
            {inscricoes.length > 0 ? (
                <ul className="space-y-4">
                    {inscricoes.map(inscricao => (
                        <li key={inscricao.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{inscricao.eventName}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <Calendar size={14} />
                                        <span>{new Date(inscricao.eventDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    {inscricao.checkedIn ? (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                                            <Check size={16} /> Presença Confirmada
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => handleCheckin(inscricao.id)}
                                            disabled={!isCheckinAvailable(inscricao.eventDate)}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                        >
                                            {isCheckinAvailable(inscricao.eventDate) ? 'Fazer Check-in Agora' : 'Check-in no dia do evento'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8">
                     <PartyPopper className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Você ainda não se inscreveu em nenhum evento.</p>
                </div>
            )}
        </div>
    );
};

export default MeusEventos;