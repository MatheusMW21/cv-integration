require('dotenv').config();
const path = require('path');
const { loadInputs } = require('./input');
const { optimizeCv } = require('./adjuster');
const { renderCV } = require('./renderer');

async function main() {
    const jobPath = process.argv[2];

    if (!jobPath) {
        console.error('Uso: node index.js <caminho-para-vaga.txt>');
        process.exit(1);
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('Erro: ANTHROPIC_API_KEY não encontrada. Crie um arquivo .env com a chave.');
        process.exit(1);
    }

    console.log('Carregando CV e descrição da vaga...');
    const { cv, jobDescription } = loadInputs(jobPath);

    console.log('Otimizando CV com Claude...');
    const tailoredCV = await optimizeCv({ cv, jobDescription });

    console.log('Gerando PDF...');
    const jobName = path.basename(jobPath, path.extname(jobPath));
    const outputPath = await renderCV(tailoredCV, jobName);

    console.log(`\nPronto! CV salvo em: ${outputPath}`);
}

main();
