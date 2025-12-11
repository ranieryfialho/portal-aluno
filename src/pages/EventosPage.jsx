import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import MeusEventos from "../components/MeusEventos.jsx";
import EventosDisponiveis from "../components/EventosDisponiveis.jsx";
import Footer from "../components/Footer.jsx";

const EventosPage = ({ student, setView, db }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventsQuery = query(collection(db, "events"), orderBy("date", "asc"));

    const unsubscribeEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const upcomingEvents = eventsData.filter(
          (event) => new Date(event.date + "T00:00:00") >= today
        );
        setAllEvents(upcomingEvents);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar eventos: ", error);
        setLoading(false);
      }
    );

    const registrationsQuery = query(
      collection(db, "event_registrations"),
      where("studentCode", "==", student.code)
    );

    const unsubscribeRegs = onSnapshot(
      registrationsQuery,
      (snapshot) => {
        const regsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyRegistrations(regsData);
      },
      (error) => {
        console.error("Erro ao buscar inscrições: ", error);
      }
    );

    return () => {
      unsubscribeEvents();
      unsubscribeRegs();
    };
  }, [student, db]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <main className="flex-grow max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-2 text-blue-600 hover:underline font-semibold"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
        </header>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10">
          Mural de Eventos
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoaderCircle className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <div className="space-y-12">
            <EventosDisponiveis
              allEvents={allEvents}
              myRegistrations={myRegistrations}
              student={student}
              db={db}
            />
            <MeusEventos
              myRegistrations={myRegistrations}
              allEvents={allEvents}
              db={db}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventosPage;
