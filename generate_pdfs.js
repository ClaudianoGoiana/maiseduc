const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const marked = require('marked');

async function generatePdfs() {
    // Only process .md files in root directory
    const files = fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.md') && fs.statSync(path.join(__dirname, file)).isFile());

    console.log(`Found ${files.length} markdown file(s) in root directory.`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    for (const file of files) {
        const pdfFilename = file.replace(/\.md$/, '.pdf');
        const pdfPath = path.join(__dirname, pdfFilename);

        // Deixar as que já existem intactas
        if (fs.existsSync(pdfPath)) {
            console.log(`[PULAR] ${pdfFilename} já existe. Mantendo versão existente.`);
            continue;
        }

        console.log(`[GERANDO] ${file} -> ${pdfFilename}...`);
        const mdContent = fs.readFileSync(path.join(__dirname, file), 'utf8');
        const htmlBody = marked.parse(mdContent);

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="utf-8">
                <title>${file.replace(/\.md$/, '')}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 20mm 15mm 20mm 15mm;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        line-height: 1.6;
                        font-size: 11pt;
                        margin: 0;
                        padding: 0;
                    }
                    h1 {
                        color: #0f172a;
                        font-size: 20pt;
                        border-bottom: 2px solid #3b82f6;
                        padding-bottom: 8px;
                        margin-top: 0;
                        page-break-after: avoid;
                    }
                    h2 {
                        color: #1e3a8a;
                        font-size: 15pt;
                        border-bottom: 1px solid #e2e8f0;
                        padding-bottom: 6px;
                        margin-top: 24px;
                        page-break-after: avoid;
                    }
                    h3 {
                        color: #1d4ed8;
                        font-size: 12pt;
                        margin-top: 18px;
                        page-break-after: avoid;
                    }
                    p, ul, ol {
                        margin-bottom: 12px;
                    }
                    li {
                        margin-bottom: 4px;
                    }
                    code {
                        font-family: Consolas, Monaco, "Courier New", monospace;
                        background: #f1f5f9;
                        color: #0f172a;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 9.5pt;
                    }
                    pre {
                        background: #0f172a;
                        color: #f8fafc;
                        padding: 12px 16px;
                        border-radius: 6px;
                        overflow-x: auto;
                        font-size: 9pt;
                        page-break-inside: avoid;
                    }
                    pre code {
                        background: transparent;
                        color: inherit;
                        padding: 0;
                    }
                    blockquote {
                        border-left: 4px solid #3b82f6;
                        background: #f0fdf4;
                        margin: 16px 0;
                        padding: 10px 16px;
                        color: #334155;
                        page-break-inside: avoid;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 16px 0;
                        font-size: 10pt;
                        page-break-inside: avoid;
                    }
                    th, td {
                        border: 1px solid #cbd5e1;
                        padding: 8px 10px;
                        text-align: left;
                    }
                    th {
                        background-color: #f1f5f9;
                        color: #0f172a;
                        font-weight: 600;
                    }
                    tr:nth-child(even) {
                        background-color: #f8fafc;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin: 12px auto;
                    }
                    hr {
                        border: none;
                        border-top: 1px solid #e2e8f0;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                ${htmlBody}
            </body>
            </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });
        console.log(`[CONCLUÍDO] ${pdfFilename} gerado com sucesso.`);
    }

    await browser.close();
    console.log('\nTodos os documentos da raiz foram processados com sucesso!');
}

generatePdfs().catch(err => {
    console.error('Erro ao gerar PDFs:', err);
    process.exit(1);
});

