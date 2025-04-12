let allArticles = [];
let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
    const supportedLangs = ['es', 'en', 'pt-br'];
    const urlParams = new URLSearchParams(window.location.search);

    const langFromURL = urlParams.get('lang');
    const langFromStorage = localStorage.getItem('preferredLang');
    const browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
    const matchedLang = supportedLangs.find(lang => browserLang.startsWith(lang));

    currentLang = langFromURL || langFromStorage || matchedLang || 'en';
    localStorage.setItem('preferredLang', currentLang);

    loadLanguage(currentLang);
    highlightActiveButton(currentLang);

    supportedLangs.forEach(lang => {
        const btn = document.getElementById(`btn-${lang}`);
        if (btn) {
            btn.addEventListener('click', () => {
                currentLang = lang;
                localStorage.setItem('preferredLang', lang);
                loadLanguage(lang);
                highlightActiveButton(lang);
                fetchAndRenderArticles();
            });
        }
    });

    fetchAndRenderArticles();
});

function fetchAndRenderArticles() {
    fetch(`${PATHS.DATA}articles-${currentLang}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`Error al cargar articles-${currentLang}.json`);
            return res.json();
        })
        .then(data => {
            allArticles = Object.entries(data).map(([slug, meta]) => ({
                slug,
                titulo: { [currentLang]: meta.titulo },
                descripcion: { [currentLang]: meta.descripcion },
                imagen: meta.imagen,
                fecha: meta.fecha,
                tags: meta.tags,
                autor: meta.autor,
                html: meta.html
            }));
            renderArticles(allArticles);
            setupSearch();
        })
        .catch(err => {
            console.error("[Error al cargar artículos]", err);
            const container = document.getElementById("articles-container");
            if (container) {
                container.innerHTML = `<p class="error-msg">Error al cargar los artículos.</p>`;
            }
        });
}

function loadLanguage(lang) {
    fetch(PATHS.LANG + lang + ".json")
        .then(res => {
            if (!res.ok) throw new Error(`Archivo de idioma ${lang}.json no encontrado`);
            return res.json();
        })
        .then(data => {
            document.querySelectorAll('[data-lang]').forEach(el => {
                const key = el.getAttribute('data-lang');
                el.textContent = data[key] || `[[${key}]]`;
            });

            const searchInput = document.getElementById('search');
            if (searchInput) searchInput.placeholder = data.search_placeholder || 'Search...';
        })
        .catch(err => {
            console.error("[Error de idioma]", err);
            const searchInput = document.getElementById('search');
            if (searchInput) searchInput.placeholder = 'Search...';
        });
}

function highlightActiveButton(lang) {
    document.querySelectorAll('.lang-buttons button')
        .forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderArticles(articles) {
    const container = document.getElementById("articles-container");
    if (!container) return;

    container.innerHTML = "";

    articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.style.position = "relative";

        const safeTitle = sanitizeText(article.titulo?.[currentLang] || article.titulo?.['en'] || '');
        const safeDesc = sanitizeText(article.descripcion?.[currentLang] || article.descripcion?.['en'] || '');
        const image = article.imagen || "placeholder.png";

        card.setAttribute('data-title', normalizeText(safeTitle));
        card.setAttribute('data-desc', normalizeText(safeDesc));

        const cardLink = document.createElement("a");
        const isExternal = article.slug.startsWith("http");
        const href = isExternal
            ? article.slug
            : `${PATHS.ARTICLES}article.html?slug=${article.slug}&lang=${currentLang}`;
        cardLink.href = href;
        cardLink.className = "card-link";

        if (isExternal) {
            cardLink.target = "_blank";
            cardLink.rel = "noopener noreferrer";
        }

        card.appendChild(cardLink);

        if (image) {
            const img = document.createElement("img");
            img.src = PATHS.IMG + image;
            img.alt = safeTitle;
            img.className = "pixel-art";
            card.appendChild(img);
        }

        const title = document.createElement("h2");
        title.textContent = safeTitle;
        card.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = safeDesc;
        card.appendChild(desc);

        const readMore = document.createElement("a");
        readMore.href = href;
        readMore.className = "read-more-link";

        const readMoreTexts = {
            "es": "Leer más",
            "pt-br": "Ler mais",
            "en": "Read more"
        };
        readMore.textContent = readMoreTexts[currentLang] || "Read more";

        if (isExternal) {
            readMore.target = "_blank";
            readMore.rel = "noopener noreferrer";
        }

        card.appendChild(readMore);
        container.appendChild(card);
    });
}

function setupSearch() {
    const input = document.getElementById("search");
    if (!input) return;

    const urlParams = new URLSearchParams(window.location.search);
    const reset = urlParams.get("reset");
    const wasReloaded = performance.getEntriesByType("navigation")[0]?.type === "reload";

    if (reset === "1" || wasReloaded) {
        sessionStorage.removeItem("lastSearchTerm");
        input.value = "";
        filterArticles("");
    } else {
        const savedSearch = sessionStorage.getItem("lastSearchTerm");
        if (savedSearch) {
            input.value = savedSearch;
            filterArticles(savedSearch);
        }
    }

    input.addEventListener("input", () => {
        const searchTerm = input.value.trim();
        sessionStorage.setItem("lastSearchTerm", searchTerm);
        filterArticles(searchTerm);
    });

    document.body.classList.remove("loading");
}

function normalizeText(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function sanitizeText(text) {
    return String(text).replace(/[<>]/g, "");
}

function filterArticles(searchText) {
    const lowerText = normalizeText(searchText);
    const cards = document.querySelectorAll('.article-card');

    cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const matches = title.includes(lowerText);
        card.classList.toggle('hidden', !matches);
    });
}

