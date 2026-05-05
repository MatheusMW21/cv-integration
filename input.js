const fs = require('fs');
const cv = require('./cv.json');


function loadInputs(jobPath) {
    try {
        const jobDescription = fs.readFileSync(jobPath, 'utf-8');

        return {
            cv, jobDescription
        };
    } catch (error) {
        console.error("Erro ao carregar inputs:", error.message);
        process.exit(1);
    }
}

module.exports = { loadInputs }