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
                renderArticles(allArticles);
                setupSearch(); // recargar búsqueda
            });
        }
    });

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

function highlightActiveButton(lang) {
    document.querySelectorAll('.lang-buttons button')
        .forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderArticles(articles) {
    const container = document.getElementById("articles-container");
    container.innerHTML = "";

    articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "article-card";
        card.style.position = "relative";

        const titleText = article.title?.[currentLang] || article.title?.['en'] || '';
        const descText = article.description?.[currentLang] || article.description?.['en'] || '';

        card.setAttribute('data-title', normalizeText(titleText));

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

        if (article.image) {
            const img = document.createElement("img");
            img.src = article.image;
            img.alt = titleText;
            img.className = "pixel-art"; // ✅ APLICAMOS RENDERING PIXELADO
            card.appendChild(img);
        }

        const title = document.createElement("h2");
        title.textContent = titleText;
        card.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = descText;
        card.appendChild(desc);

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
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
