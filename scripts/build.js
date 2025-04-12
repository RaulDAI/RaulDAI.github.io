// scripts/build.js

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const marked = require("marked");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const langs = ["es", "en", "pt-br"];

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const fullData = {};

langs.forEach(lang => {
    const dir = path.join(__dirname, "../content", lang);
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"));
    fullData[lang] = {};

    files.forEach(file => {
        const raw = fs.readFileSync(path.join(dir, file), "utf8");
        const { data: meta, content } = matter(raw);
        const html = purify.sanitize(marked.parse(content));

        if (meta.slug) {
            fullData[lang][meta.slug] = {
                ...meta,
                html
            };
        }
    });
});

const outPath = path.join(__dirname, "../output/data");
fs.mkdirSync(outPath, { recursive: true });

Object.entries(fullData).forEach(([lang, data]) => {
    fs.writeFileSync(path.join(outPath, `articles-${lang}.json`), JSON.stringify(data, null, 2), "utf8");
});

console.log("✅ JSONs generados con gray-matter + marked + DOMPurify");
