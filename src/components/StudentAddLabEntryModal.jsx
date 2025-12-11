import { useState, useEffect } from 'react';
import { Check, Clock, Calendar, AlertCircle, Repeat, X, MessageCircle, BadgeDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvailableTimeSlotsForDate, hasAvailableSlots, getWeekdayName } from '../libs/labScheduleConfig';

const activityOptions = [
  "Digitação", "Currículo", "Hora Livre", "Segunda Chamada de Prova", "Reposição de Aula", "Reforço de Aula"
];

const moduleOptions = [
  "ICN", "WORD", "EXCEL", "POWERPOINT", "ADM", "POWERBI", "PHOTOSHOP", "ILLUSTRATOR"
];

const conditionalActivities = [
  "Segunda Chamada de Prova", "Reposição de Aula", "Reforço de Aula"
];

const paidActivities = [
  "Segunda Chamada de Prova", "Reposição de Aula"
];

function StudentAddLabEntryModal({ isOpen, onClose, onSave, selectedDate, student }) {
  const [activity, setActivity] = useState(activityOptions[0]);
  const [subject, setSubject] = useState(moduleOptions[0]);
  const [observation, setObservation] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  
  // Novos estados para a lógica de pagamento/atestado
  const [hasCertificate, setHasCertificate] = useState(false);
  
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  const [modalDate, setModalDate] = useState(selectedDate);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [weekdayName, setWeekdayName] = useState('');
  const [hasSlots, setHasSlots] = useState(true);

  // Verifica se é uma atividade especial (paga)
  const isPaidActivity = paidActivities.includes(activity);

  useEffect(() => {
    if (isOpen) {
      setModalDate(selectedDate);
      setRepeatWeekly(false);
      setRepeatWeeks(1);
      setSelectedTimes([]);
      setActivity(activityOptions[0]);
      setObservation('');
      setHasCertificate(false); // Resetar ao abrir
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    if (modalDate) {
      const slots = getAvailableTimeSlotsForDate(modalDate);
      const dayName = getWeekdayName(modalDate);
      const hasSlotsAvailable = hasAvailableSlots(modalDate);
      
      setAvailableTimeSlots(slots);
      setWeekdayName(dayName);
      setHasSlots(hasSlotsAvailable);
      
      // Limpa horários se mudar a data e eles não existirem mais
      setSelectedTimes(prev => prev.filter(t => slots.includes(t)));
    }
  }, [modalDate]);

  const handleTimeChange = (time) => {
    setSelectedTimes(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleWhatsAppRedirect = () => {
    let number = "";
    let message = "";

    if (hasCertificate) {
      // Coordenação
      number = "558592979509";
      message = `Olá Coordenação, sou o aluno ${student?.name} (Matrícula: ${student?.code}). Estou agendando uma ${activity} para o dia ${formatDate(modalDate)} e gostaria de enviar meu atestado/declaração.`;
    } else {
      // Financeiro
      number = "558594235095";
      message = `Olá Financeiro, sou o aluno ${student?.name} (Matrícula: ${student?.code}). Estou agendando uma ${activity} para o dia ${formatDate(modalDate)} e gostaria de regularizar o pagamento.`;
    }

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedTimes.length) {
      toast.error("Selecione pelo menos um horário.");
      return;
    }

    // Define o status: 'pending' para atividades pagas, 'approved' (ou null/undefined) para as demais
    const status = isPaidActivity ? 'pending' : 'approved';

    const entryData = {
      studentCode: student?.code || "ERRO",
      studentName: student?.name || "Aluno",
      studentClassName: student?.className || "Turma do Aluno",
      activity,
      subject: conditionalActivities.includes(activity) ? subject : null,
      isJustified: hasCertificate ? 'Sim' : 'Não',
      observation: observation + (isPaidActivity ? ` [Comprovante: ${hasCertificate ? 'Sim' : 'Não'}]` : ''),
      timeSlot: selectedTimes.sort(),
      isNewStudent: false,
      isDone: false,
      status: status
    };

    onSave(entryData, repeatWeekly ? repeatWeeks : 1, modalDate);
    
    // Feedback visual extra para atividades pagas
    if (isPaidActivity) {
      toast(t => (
        <div className="flex flex-col gap-2">
          <span>Agendamento pendente criado! Regularize sua situação.</span>
          <button 
            onClick={() => { toast.dismiss(t.id); handleWhatsAppRedirect(); }}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold"
          >
            Falar no WhatsApp
          </button>
        </div>
      ), { duration: 6000 });
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-scale-up">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
            <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Agendar Laboratório</h2>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-blue-600"/> Data Desejada
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={modalDate}
              onChange={(e) => setModalDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center px-4 py-2 bg-white rounded-lg border text-blue-800 font-medium">
              {weekdayName} - {formatDate(modalDate)}
            </div>
          </div>
        </div>

        {!hasSlots ? (
           <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 mb-4">
             <AlertCircle size={20}/>
             <span>Não há atendimento neste dia. Selecione outra data.</span>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Seleção de Horários */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16}/> Selecione os Horários
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availableTimeSlots.map(time => (
                  <label key={time} className={`
                    flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all
                    ${selectedTimes.includes(time) 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}
                  `}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedTimes.includes(time)}
                      onChange={() => handleTimeChange(time)}
                    />
                    <span className="text-sm font-semibold">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Atividade e Módulo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">O que vai fazer?</label>
                <select 
                  value={activity} 
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {activityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              
              {conditionalActivities.includes(activity) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qual matéria?</label>
                  <select 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {moduleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* --- SEÇÃO DE AVISO E PAGAMENTO (Condicional) --- */}
            {isPaidActivity && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <BadgeDollarSign className="text-orange-600 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-orange-800 text-sm">Atenção: Serviço Cobrado</h4>
                    <p className="text-orange-700 text-xs mt-1">
                      Esta atividade exige pagamento caso você não possua atestado ou declaração.
                    </p>
                  </div>
                </div>

                {/* Toggle / Checkbox */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                  <input 
                    type="checkbox" 
                    id="hasCert"
                    checked={hasCertificate}
                    onChange={(e) => setHasCertificate(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="hasCert" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Tenho atestado médico ou declaração
                  </label>
                </div>

                {/* Botão de Ação WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppRedirect}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-white transition-colors shadow-sm
                    ${hasCertificate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                  `}
                >
                  <MessageCircle size={18} />
                  {hasCertificate 
                    ? "Enviar Documento (Coordenação)" 
                    : "Regularizar Pagamento (Financeiro)"
                  }
                </button>
              </div>
            )}
            {/* ---------------------------------- */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observação (Opcional)</label>
              <textarea
                rows="2"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ex: Preciso de ajuda no exercício 3..."
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Repetição */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input 
                  type="checkbox" 
                  id="repeatStudent"
                  checked={repeatWeekly} 
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded" 
                />
                <label htmlFor="repeatStudent" className="text-sm text-gray-700 flex items-center gap-1 cursor-pointer">
                  <Repeat size={14}/> Repetir nas próximas semanas?
                </label>
                
                {repeatWeekly && (
                  <select 
                    value={repeatWeeks} 
                    onChange={(e) => setRepeatWeeks(Number(e.target.value))}
                    className="ml-auto p-1 border rounded text-sm"
                  >
                    {[2,3,4].map(n => <option key={n} value={n}>{n} semanas</option>)}
                  </select>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md transition-transform active:scale-95 flex items-center gap-2"
              >
                <Check size={18}/> Confirmar Agendamento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default StudentAddLabEntryModal;