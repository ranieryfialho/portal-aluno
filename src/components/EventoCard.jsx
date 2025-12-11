import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle,
} from "lucide-react";

const EventoCard = ({ event, isRegistered }) => {
  const { name, date, startTime, endTime, lab, responsible, imageUrl } = event;

  const formatTime = (start, end) => {
    if (!start) return "Horário a definir";
    if (end) return `${start} - ${end}`;
    return start;
  };

  const displayTime = formatTime(startTime, endTime);

  const formatDate = (dateString) => {
    if (!dateString) return "Data não definida";
    const dateObj = new Date(dateString + "T00:00:00");
    return dateObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
          <Calendar size={48} className="text-blue-300" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 mb-3">{name}</h3>
        <div className="space-y-2 text-gray-600 text-sm mb-4 flex-grow">
          <p className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" /> {formatDate(date)}
          </p>
          <p className="flex items-center gap-2">
            <Clock size={14} className="text-green-500" /> {displayTime}
          </p>
          {lab && (
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-red-500" /> {lab}
            </p>
          )}
          {responsible && (
            <p className="flex items-center gap-2">
              <User size={14} className="text-purple-500" /> {responsible}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          {isRegistered ? (
            <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-800 font-semibold py-2 px-4 rounded-lg">
              <CheckCircle size={16} />
              <span>Inscrição Realizada</span>
            </div>
          ) : (
            <a
              href="https://checkin-evento.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition"
            >
              <Users size={16} />
              <span>Inscrever-se</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventoCard;