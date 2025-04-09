let allArticles = [];

document.addEventListener('DOMContentLoaded', () => {
    const userLang = navigator.language || navigator.userLanguage;
    const defaultLang = userLang.startsWith('es') ? 'es' : 'en';
    loadLanguage(defaultLang);
    highlightActiveButton(defaultLang);

    document.getElementById('btn-es').addEventListener('click', () => {
        loadLanguage('es');
        highlightActiveButton('es');
    });

    document.getElementById('btn-en').addEventListener('click', () => {
        loadLanguage('en');
        highlightActiveButton('en');
    });

    fetch("data/articles.json")
        .then(res => res.json())
        .then(data => {
            allArticles = data;
            renderArticles(data);
            setupSearch(); // ← activamos búsqueda dinámica
        });
});

function loadLanguage(lang) {
    fetch(`js/lang/${lang}.json`)
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('[data-lang]').forEach(el => {
                const key = el.getAttribute('data-lang');
                if (data[key]) el.textContent = data[key];
            });
            document.getElementById('search').placeholder = data.search_placeholder;
        });
}

function highlightActiveButton(lang) {
    document.querySelectorAll('.lang-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderArticles(articles) {
    const container = document.getElementById("articles-container");

    // Si ya hay artículos, solo actualiza visibilidad
    const cards = container.querySelectorAll(".article-card");

    if (cards.length === allArticles.length) {
        allArticles.forEach((article, i) => {
            const normalizedTitle = normalizeText(article.title);
            const shouldShow = articles.includes(article);
            cards[i].style.display = shouldShow ? "flex" : "none";
        });
        return;
    }

    // Primer render completo (cuando aún no hay cards en el DOM)
    container.innerHTML = "";

    articles.forEach(article => {
        const card = document.createElement("div");
        card.className = "article-card";

        if (article.image) {
            const img = document.createElement("img");
            img.src = article.image;
            img.alt = article.title;
            card.appendChild(img);
        }

        const title = document.createElement("h2");
        title.textContent = article.title;
        card.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = article.description;
        card.appendChild(desc);

        const link = document.createElement("a");
        link.href = `articles/${article.slug}.html`;
        link.textContent = "Leer más";
        card.appendChild(link);

        container.appendChild(card);
    });
}


function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD") // elimina acentos
        .replace(/[\u0300-\u036f]/g, "");
}

function setupSearch() {
    const input = document.getElementById("search");

    input.addEventListener("input", () => {
        const searchTerm = normalizeText(input.value.trim());
        if (searchTerm === "") {
            renderArticles(allArticles);
            return;
        }

        const filtered = allArticles.filter(article =>
            normalizeText(article.title).includes(searchTerm)
        );

        renderArticles(filtered);
    });
}
