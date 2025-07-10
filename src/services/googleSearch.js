const subjectTopics = {
    "ICN": ["Usabilidade de internet", "Como mandar email profissionalmente", "Google Documentos para iniciantes", "Google Planilhas tutorial", "Google Apresentações curso completo"],
    "OFFA": ["Microsoft Word tutorial completo", "Microsoft Excel para iniciantes", "Microsoft PowerPoint dicas essenciais"],
    "ADM": ["O que é Pensamento Estratégico", "Como fazer uma Matriz SWOT", "Técnicas de Atendimento ao Cliente", "Noções de Recursos Humanos (RH)", "Desenvolvimento de competências profissionais", "Estilos de Liderança", "O que é avaliação DISC", "Noções de Departamento Pessoal (DP)", "Exames periódicos no trabalho", "Como calcular férias", "Cálculo de rescisão trabalhista", "O que são rendimentos e descontos", "Gestão de impostos para pequenas empresas", "Contas a pagar e receber", "Como fazer um fluxo de caixa"],
    "PWB": ["Power BI para iniciantes", "Curso completo de Power BI", "Como criar dashboards no Power BI", "Tratamento de dados no Power BI", "Funções DAX Power BI"],
    "TRI": ["Photoshop para iniciantes", "Curso completo de Photoshop", "Como fazer recortes no Photoshop", "Tratamento de imagem no Photoshop", "Efeitos e filtros no Photoshop"],
    "CMV": ["Illustrator para iniciantes", "Curso completo de Illustrator", "Como criar um logotipo no Illustrator", "Ferramenta caneta Illustrator", "Vetorização de imagens no Illustrator"]
};

const subjectFullNamesForSearch = {
    "ICN": "Informática",
    "OFFA": "Pacote Office",
    "ADM": "Administração",
    "PWB": "PowerBI",
    "TRI": "Photoshop",
    "CMV": "Illustrator"
};

const getRandomItems = (arr, num) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
};

export async function fetchStudyMaterials(subjectName) {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const searchEngineId = import.meta.env.VITE_Google_Search_ENGINE_ID;

    const topics = subjectTopics[subjectName];
    const subjectForQuery = subjectFullNamesForSearch[subjectName] || subjectName;

    if (!topics) {
        return { results: [], searchedQuery: null };
    }

    const randomTopic = getRandomItems(topics, 1)[0];
    const query = `tutorial ${randomTopic} ${subjectForQuery} -game -jogo`;
    const searchedQueryForFallback = `${randomTopic} em ${subjectForQuery}`;

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=2&lr=lang_pt`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('A API do Google retornou um erro.');
        
        const data = await response.json();
        const results = data.items?.map(item => ({
            title: item.title,
            link: item.link,
            thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || null,
        })) || [];
        
        return { results, searchedQuery: searchedQueryForFallback };

    } catch (error) {
        console.error("Erro ao buscar recomendações:", error);
        return { results: [], searchedQuery: searchedQueryForFallback };
    }
}