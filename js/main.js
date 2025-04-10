let allArticles = [];
let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
    const supportedLangs = ['es', 'en', 'pt-br'];

    // 1. Detectar idioma desde URL, localStorage o navegador
    const urlParams = new URLSearchParams(window.location.search);
    const langFromURL = urlParams.get('lang');
    const langFromStorage = localStorage.getItem('preferredLang');
    const browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
    const matchedLang = supportedLangs.find(lang => browserLang.startsWith(lang));

    currentLang = langFromURL || langFromStorage || matchedLang || 'en';
    localStorage.setItem('preferredLang', currentLang); // Persistir

    // 2. Aplicar idioma inicial
    loadLanguage(currentLang);
    highlightActiveButton(currentLang);

    // 3. Activar botones de idioma
    supportedLangs.forEach(lang => {
        const btn = document.getElementById(`btn-${lang}`);
        if (btn) {
            btn.addEventListener('click', () => {
                currentLang = lang;
                localStorage.setItem('preferredLang', lang);
                loadLanguage(lang);
                highlightActiveButton(lang);
                renderArticles(allArticles);
            });
        }
    });

    // 4. Cargar artículos
    fetch("data/articles.json")
        .then(res => {
            if (!res.ok) throw new Error("Error al cargar articles.json");
            return res.json();
        })
        .then(data => {
            allArticles = data;
            renderArticles(allArticles);
            setupSearch();
        })
        .catch(err => console.error("[Error al cargar artículos]", err));
});

// Cargar traducciones desde JSON
function loadLanguage(lang) {
    fetch(`js/lang/${lang}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`Archivo de idioma ${lang}.json no encontrado`);
            return res.json();
        })
        .then(data => {
            document.querySelectorAll('[data-lang]').forEach(el => {
                const key = el.getAttribute('data-lang');
                if (data[key]) el.textContent = data[key];
            });

            const searchInput = document.getElementById('search');
            if (searchInput) searchInput.placeholder = data.search_placeholder;
        })
        .catch(err => console.error("[Error de idioma]", err));
}

// Estilo activo en botón de idioma
function highlightActiveButton(lang) {
    document.querySelectorAll('.lang-buttons button')
        .forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Renderizar tarjetas de artículos
function renderArticles(articles) {
    const container = document.getElementById("articles-container");
    container.innerHTML = "";

    articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.style.position = "relative";

        // Enlace de fondo (toda la tarjeta)
        const cardLink = document.createElement("a");
        const isExternal = article.slug.startsWith("http");
        const href = isExternal ? article.slug : `articles/${article.slug}.html`;
        cardLink.href = href;
        cardLink.className = "card-link";

        if (isExternal) {
            cardLink.target = "_blank";
            cardLink.rel = "noopener noreferrer";
        }

        card.appendChild(cardLink);

        // Imagen
        if (article.image) {
            const img = document.createElement("img");
            img.src = article.image;
            img.alt = article.title?.[currentLang] || article.title?.['en'] || '';
            card.appendChild(img);
        }

        // Título
        const title = document.createElement("h2");
        title.textContent = article.title?.[currentLang] || article.title?.['en'] || '';
        card.appendChild(title);

        // Descripción
        const desc = document.createElement("p");
        desc.textContent = article.description?.[currentLang] || article.description?.['en'] || '';
        card.appendChild(desc);

        // Leer más
        const readMore = document.createElement("a");
        readMore.href = href;
        readMore.className = "read-more-link";
        readMore.textContent = currentLang === 'es' ? "Leer más"
            : currentLang === 'pt-br' ? "Ler mais"
                : "Read more";

        if (isExternal) {
            readMore.target = "_blank";
            readMore.rel = "noopener noreferrer";
        }

        card.appendChild(readMore);
        container.appendChild(card);
    });
}

// Normalizar texto para búsquedas
function normalizeText(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Buscar por título
function setupSearch() {
    const input = document.getElementById("search");
    if (!input) return;

    input.addEventListener("input", () => {
        const searchTerm = normalizeText(input.value.trim());
        if (searchTerm === "") {
            renderArticles(allArticles);
            return;
        }

        const filtered = allArticles.filter(article =>
            normalizeText(article.title?.[currentLang] || "").includes(searchTerm)
        );

        renderArticles(filtered);
    });
}
