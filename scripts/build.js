// scripts/build.js

const fs = require("fs");
const path = require("path");
const marked = require("marked");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const langs = ["es", "en"]; // idiomas que vamos a procesar

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Función para extraer metadatos del bloque <!-- ... -->
function extractMetadata(content) {
    const metaMatch = content.match(/<!--([\s\S]*?)-->/);
    const metadata = {};
    if (metaMatch) {
        const lines = metaMatch[1].trim().split('\n');
        for (const line of lines) {
            const [key, ...rest] = line.split(":");
            metadata[key.trim()] = rest.join(":").trim().replace(/^\[|\]$/g, "").split(",").map(x => x.trim());
            if (metadata[key.trim()].length === 1) metadata[key.trim()] = metadata[key.trim()][0]; // simplifica
        }
    }
    return metadata;
}

// Procesar todos los idiomas
const fullData = {}; // { es: { slug: { titulo, html, ... } }, en: { ... } }

langs.forEach(lang => {
    const dir = path.join(__dirname, "../content", lang);
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"));

    fullData[lang] = {};

    files.forEach(file => {
        const raw = fs.readFileSync(path.join(dir, file), "utf8");
        const metadata = extractMetadata(raw);
        const html = purify.sanitize(marked.parse(raw));

        if (metadata.slug) {
            fullData[lang][metadata.slug] = {
                ...metadata,
                html
            };
        }
    });
});

// Salvar JSON final
const outPath = path.join(__dirname, "../output/data");
fs.mkdirSync(outPath, { recursive: true });

Object.entries(fullData).forEach(([lang, data]) => {
    fs.writeFileSync(path.join(outPath, `articles-${lang}.json`), JSON.stringify(data, null, 2), "utf8");
});

console.log("✅ Artículos procesados y JSONs generados");
