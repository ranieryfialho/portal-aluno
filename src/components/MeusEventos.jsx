import React from 'react';
import { PartyPopper } from 'lucide-react';
import EventoCard from './EventoCard.jsx';

const MeusEventos = ({ myRegistrations, allEvents }) => {
    const eventsMap = new Map(allEvents.map(event => [event.id, event]));

    const enrichedRegistrations = myRegistrations.map(inscricao => {
        const fullEvent = eventsMap.get(inscricao.eventId);
        return {
            ...fullEvent,
            ...inscricao,
            id: inscricao.id,
        };
    }).sort((a, b) => {
        const dateA = new Date(a.date || a.eventDate);
        const dateB = new Date(b.date || b.eventDate);
        return dateA - dateB;
    });

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Meus Eventos Inscritos</h2>
             {enrichedRegistrations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrichedRegistrations.map(inscricaoCompleta => (
                        <EventoCard 
                            key={inscricaoCompleta.id}
                            event={inscricaoCompleta}
                            isRegistered={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                     <PartyPopper className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Você ainda não se inscreveu em nenhum evento.</p>
                </div>
            )}
        </div>
    );
};

export default MeusEventos;