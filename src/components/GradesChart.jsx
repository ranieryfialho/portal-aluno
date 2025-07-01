// --- NOVO GRÁFICO DE LINHA (COPIE TUDO ABAIXO) ---

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Componente para a caixinha que aparece ao passar o mouse
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-xl">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-sm" style={{ color: '#4f46e5' }}>
                    {`Nota: ${payload[0].value.toFixed(1)}`}
                </p>
            </div>
        );
    }
    return null;
};

// O componente do gráfico em si
const GradesChart = ({ data, subjectFullNames }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-gray-500 py-4">Não há dados de notas para exibir o gráfico.</p>;
    }
    
    const getFullSubjectName = (shortName) => subjectFullNames[shortName] || shortName;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 120 }}
            >
                {/* Define um gradiente para a cor de preenchimento */}
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                
                {/* Linhas de grade no fundo do gráfico */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                
                {/* Eixo X (nomes das matérias) */}
                <XAxis 
                    dataKey="disciplina" 
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    interval={0}
                    tick={{ fontSize: 12, fill: '#374151' }}
                    tickFormatter={getFullSubjectName}
                />
                
                {/* Eixo Y (notas de 0 a 10) */}
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#374151' }} />
                
                {/* Caixinha de informação ao passar o mouse */}
                <Tooltip content={<CustomTooltip />} />
                
                {/* A linha e a área preenchida do gráfico */}
                <Area 
                    type="monotone" // Deixa a linha com curvas suaves
                    dataKey="nota" 
                    stroke="#4f46e5" // Cor da linha
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorUv)" // Usa o gradiente definido acima
                    dot={{ r: 6, stroke: '#4f46e5', fill: '#fff', strokeWidth: 2 }} // Bolinhas nos pontos
                    activeDot={{ r: 8, fill: '#4f46e5' }} // Bolinha maior ao passar o mouse
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
