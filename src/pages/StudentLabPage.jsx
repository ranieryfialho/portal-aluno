import { useState, useEffect } from "react";
import { 
  collection, query, where, onSnapshot, orderBy, 
  writeBatch, doc, deleteDoc, serverTimestamp 
} from "firebase/firestore";
import toast from "react-hot-toast";
import { Calendar, Clock, PlusCircle, Trash2, BookOpen, ArrowLeft, MonitorPlay } from "lucide-react";
import StudentAddLabEntryModal from "../components/StudentAddLabEntryModal";
import HorariosAtendimento from "../components/HorariosAtendimento";
import Footer from "../components/Footer";

function StudentLabPage({ student, setView, db }) {
  const [myEntries, setMyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (!student?.code) {
        setLoading(false);
        return;
    }

    const q = query(
      collection(db, "labEntries"),
      where("studentCode", "==", student.code),
      orderBy("entryDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyEntries(data);
      setLoading(false);
    }, (error) => {
        console.error("Erro ao buscar agendamentos:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [student, db]);

  const handleAddEntry = async (entryData, repeatWeeks, entryDate) => {
    try {
      const batch = writeBatch(db);
      const initialDate = new Date(entryDate + "T12:00:00");

      for (let i = 0; i < repeatWeeks; i++) {
        const targetDate = new Date(initialDate);
        targetDate.setDate(targetDate.getDate() + i * 7);
        const dateString = targetDate.toISOString().split("T")[0];

        const newEntry = {
          ...entryData,
          entryDate: dateString,
          createdAt: serverTimestamp(),
          createdByUid: student.id || "portal-aluno",
          createdByName: student.name
        };

        const docRef = doc(collection(db, "labEntries"));
        batch.set(docRef, newEntry);
      }

      await batch.commit();
      toast.success("Agendamento realizado com sucesso!");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error("Erro ao salvar o agendamento.");
    }
  };

  const handleCancelEntry = async (id) => {
    if (confirm("Deseja realmente cancelar este agendamento?")) {
        try {
            await deleteDoc(doc(db, "labEntries", id));
            toast.success("Agendamento cancelado.");
        } catch (error) {
            toast.error("Erro ao cancelar.");
        }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString("pt-BR", { 
        weekday: 'short', day: '2-digit', month: 'long' 
    });
  };

  const futureEntries = myEntries.filter(e => e.entryDate >= todayDate).sort((a,b) => a.entryDate.localeCompare(b.entryDate));
  const pastEntries = myEntries.filter(e => e.entryDate < todayDate);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 md:p-8">
      <main className="flex-grow max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8">
            <button onClick={() => setView('home')} className="flex items-center gap-2 text-blue-600 hover:underline font-semibold">
                <ArrowLeft size={18} />
                Voltar
            </button>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Laboratório de Apoio</h1>
            <p className="text-gray-600 mt-1">Gerencie seus horários de reforço e estudo.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg active:scale-95 w-full md:w-auto justify-center"
          >
            <PlusCircle size={24} />
            Novo Agendamento
          </button>
        </div>

        <div className="mb-8">
            <HorariosAtendimento />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600"/> Próximos Agendamentos
        </h2>
        
        {loading ? (
            <p className="text-gray-500 py-8 text-center">Carregando...</p>
        ) : futureEntries.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border-2 border-dashed border-gray-200 mb-8">
                <div className="flex justify-center mb-3">
                    <MonitorPlay size={48} className="text-gray-300"/>
                </div>
                <p className="text-gray-500 text-lg">Você não tem agendamentos futuros.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-blue-600 font-semibold mt-2 hover:underline">
                    Clique aqui para agendar
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {futureEntries.map(entry => (
                    <div key={entry.id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition relative group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 text-gray-800 font-bold text-lg capitalize">
                                <Calendar size={18} className="text-blue-500"/>
                                {formatDate(entry.entryDate)}
                            </div>
                            <button 
                                onClick={() => handleCancelEntry(entry.id)}
                                className="text-gray-400 hover:text-red-500 p-1 rounded transition"
                                title="Cancelar agendamento"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                            {entry.timeSlot?.map(time => (
                                <span key={time} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100 flex items-center gap-1">
                                    <Clock size={10}/> {time}
                                </span>
                            ))}
                        </div>

                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-gray-700 font-medium flex items-center gap-2 text-sm">
                                <BookOpen size={14} className="text-gray-400"/>
                                {entry.activity} {entry.subject ? `• ${entry.subject}` : ''}
                            </p>
                            {entry.observation && (
                                <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">Obs: {entry.observation}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {pastEntries.length > 0 && (
            <div className="mt-8 border-t pt-6">
                <details className="group">
                    <summary className="cursor-pointer list-none flex items-center gap-2 font-semibold text-gray-500 hover:text-gray-700 select-none">
                        <span className="group-open:rotate-90 transition-transform">▶</span> Ver Histórico Passado
                    </summary>
                    <div className="mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
                        {pastEntries.slice(0, 5).map(entry => (
                            <div key={entry.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-gray-50 text-sm">
                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                                    <span className="font-medium text-gray-700 capitalize">{formatDate(entry.entryDate)}</span>
                                    <span className="text-gray-500">{entry.activity}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${entry.isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {entry.isDone ? "Realizado" : "Pendente/Falta"}
                                </span>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        )}

        <StudentAddLabEntryModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleAddEntry}
            selectedDate={todayDate}
            student={student}
        />
      </main>
      <Footer />
    </div>
  );
}

export default StudentLabPage;