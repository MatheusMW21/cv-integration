const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

function buildHTML(cv) {
    const { personal, heading, experience, projects, skills, education, languages } = cv;

    const experienceHTML = experience.map(exp => `
        <div class="entry">
            <div class="entry-header">
                <span class="bold">${exp.company}</span>
                <span>${exp.period}</span>
            </div>
            <div class="entry-sub">
                <span>${exp.role}</span>
                <span>${exp.location}</span>
            </div>
            <ul>${exp.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        </div>
    `).join('');

    const projectsHTML = projects.map(proj => `
        <div class="entry">
            <div class="entry-header">
                <span><span class="bold">${proj.name}</span> | <span class="tech">${proj.tech.join(', ')}</span></span>
            </div>
            <ul>${proj.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
        </div>
    `).join('');

    const skillLabels = {
        languages: 'Linguagens',
        backend: 'Backend',
        frontend: 'Frontend',
        cloud: 'Cloud, BD e Mensageria',
        devops: 'DevOps e Ferramentas'
    };
    const skillsHTML = Object.entries(skills)
        .map(([key, items]) => `<p><strong>${skillLabels[key] || key}:</strong> ${items.join(', ')}</p>`)
        .join('');

    const educationHTML = education.map(edu => `
        <div class="entry">
            <div class="entry-header">
                <span class="bold">${edu.institution}</span>
                <span>${edu.period}</span>
            </div>
            <div class="entry-sub">
                <span>${edu.degree}</span>
                <span>${edu.location}</span>
            </div>
        </div>
    `).join('');

    const languagesHTML = languages.map(l => `
        <div class="entry-header">
            <span class="bold">${l.language}</span>
            <span>${l.level}</span>
        </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Georgia, serif;
            font-size: 10.5pt;
            color: #000;
            padding: 1.8cm 2.2cm;
            line-height: 1.45;
        }
        h1 {
            text-align: center;
            font-size: 22pt;
            margin-bottom: 5px;
        }
        .contact {
            text-align: center;
            font-size: 9.5pt;
            margin-bottom: 14px;
        }
        h2 {
            font-size: 11.5pt;
            border-bottom: 1px solid #000;
            margin: 14px 0 6px;
            padding-bottom: 2px;
        }
        .entry { margin-bottom: 8px; }
        .entry-header {
            display: flex;
            justify-content: space-between;
        }
        .entry-sub {
            display: flex;
            justify-content: space-between;
            font-style: italic;
            font-size: 10pt;
            margin-bottom: 2px;
        }
        .bold { font-weight: bold; }
        .tech { font-style: italic; font-weight: normal; }
        ul { margin: 3px 0 0 18px; }
        li { margin-bottom: 2px; font-size: 10pt; }
        .skills p { font-size: 10pt; margin-bottom: 2px; }
    </style>
</head>
<body>
    <h1>${personal.name}</h1>
    <div class="contact">
        ${personal.phone} &nbsp;&#9993;&nbsp; ${personal.email} &nbsp;&#128279;&nbsp; ${personal.linkedin} &nbsp;&#128279;&nbsp; ${personal.github}
    </div>

    <h2>Resumo Profissional</h2>
    <p>${heading.summary}</p>

    <h2>Experiências Profissionais</h2>
    ${experienceHTML}

    <h2>Projetos</h2>
    ${projectsHTML}

    <h2>Habilidades Técnicas</h2>
    <div class="skills">${skillsHTML}</div>

    <h2>Educação</h2>
    ${educationHTML}

    <h2>Idiomas</h2>
    ${languagesHTML}
</body>
</html>`;
}

async function renderCV(cv, jobName) {
    const outputDir = path.join(__dirname, 'output');
    fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `CV - Matheus Pinheiro [${jobName}].pdf`);
    const html = buildHTML(cv);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    return outputPath;
}

module.exports = { renderCV };
