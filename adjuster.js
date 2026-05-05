const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callClaude(cv, jobDescription) {
    const systemPrompt = `Você é um especialista em recrutamento e seleção (Tech Recruiter).
Sua tarefa é atuar como um editor cirúrgico para otimizar um Currículo (JSON) para uma Vaga específica (Texto).

REGRAS CRÍTICAS DE OUTPUT:
1. Responda EXCLUSIVAMENTE com um objeto JSON.
2. Não invente experiências profissionais, cursos ou formações que não existam no CV original.
3. Não altere campos imutáveis: company, role, period, location, nome de projetos, tech stack, education e languages.
4. Não mencione o nome da empresa da vaga em nenhum campo. O currículo deve ser genérico e profissional.
5. Melhore o campo 'heading.summary' para alinhar com a vaga.
6. Ajuste os arrays 'bullets' dentro de 'experience' e 'projects' usando palavras-chave da vaga, mantendo a verdade histórica.
7. Reordene os itens dentro de cada categoria de 'skills' para priorizar as mais relevantes à vaga.
8. Mantenha a ESTRUTURA IDÊNTICA: se o array 'experience' tem 4 itens, seu JSON de retorno DEVE ter 4 itens na mesma ordem.

ESTRUTURA DE RETORNO ESPERADA:
{
  "heading": { "summary": "Texto otimizado" },
  "skills": { "languages": [], "backend": [], "frontend": [], "cloud": [], "devops": [] },
  "experience": [ { "bullets": [] }, {}, { "bullets": [] } ],
  "projects": [ { "bullets": [] } ]
}
Se um item do array não precisar de ajuste, retorne {} naquela posição.`;

    try {
        const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: `CV: ${JSON.stringify(cv)}\n\nVaga: ${jobDescription}`
            }],
            output_config: {
                format: {
                    type: 'json_schema',
                    schema: {
                        type: 'object',
                        properties: {
                            heading: {
                                type: 'object',
                                properties: { summary: { type: 'string' } },
                                additionalProperties: false
                            },
                            skills: {
                                type: 'object',
                                properties: {
                                    languages: { type: 'array', items: { type: 'string' } },
                                    backend:   { type: 'array', items: { type: 'string' } },
                                    frontend:  { type: 'array', items: { type: 'string' } },
                                    cloud:     { type: 'array', items: { type: 'string' } },
                                    devops:    { type: 'array', items: { type: 'string' } }
                                },
                                additionalProperties: false
                            },
                            experience: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: { bullets: { type: 'array', items: { type: 'string' } } },
                                    additionalProperties: false
                                }
                            },
                            projects: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: { bullets: { type: 'array', items: { type: 'string' } } },
                                    additionalProperties: false
                                }
                            }
                        },
                        additionalProperties: false
                    }
                }
            }
        });

        return JSON.parse(response.content[0].text);
    } catch (error) {
        console.error("Erro na comunicação com Claude:", error.message);
        throw error;
    }
}

function mergeCV(original, changes) {
    if (!changes) return original;

    return {
        ...original,
        heading: {
            ...original.heading,
            ...(changes.heading || {})
        },
        skills: {
            ...original.skills,
            ...(changes.skills || {})
        },
        experience: original.experience.map((exp, i) => ({
            ...exp,
            ...(changes.experience?.[i] || {})
        })),
        projects: (original.projects || []).map((proj, i) => ({
            ...proj,
            ...(changes.projects?.[i] || {})
        }))
    };
}

async function optimizeCv({ cv, jobDescription }) {
    const changes = await callClaude(cv, jobDescription);
    return mergeCV(cv, changes);
}

module.exports = { optimizeCv };