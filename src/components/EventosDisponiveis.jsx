import React, { useMemo } from 'react';
import { PartyPopper } from 'lucide-react';
import EventoCard from './EventoCard.jsx';

const EventosDisponiveis = ({ allEvents, myRegistrations, student, db }) => {
    
    const availableEvents = useMemo(() => {
        const registeredEventIds = new Set(myRegistrations.map(reg => reg.eventId));
        return allEvents.filter(event => !registeredEventIds.has(event.id));
    }, [allEvents, myRegistrations]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Eventos Disponíveis para Inscrição</h2>
            {availableEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableEvents.map(event => (
                        <EventoCard 
                            key={event.id}
                            event={event}
                            student={student}
                            db={db}
                            isRegistered={false}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                     <PartyPopper className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Nenhum novo evento disponível no momento.</p>
                </div>
            )}
        </div>
    );
};

export default EventosDisponiveis;