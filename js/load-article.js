let currentLang = localStorage.getItem("preferredLang") || "en";
let currentArticle = null;
let currentSlug = null;

document.addEventListener("DOMContentLoaded", async () => {
    currentSlug = window.location.pathname.split("/").pop().replace(".html", "");

    await loadArticle(currentLang);
    setupLanguageButtons();
    setupBackButton();
});

async function loadArticle(lang) {
    try {
        const res = await fetch("../data/articles-content.json");
        if (!res.ok) throw new Error("No se pudo cargar el contenido del artículo");

        const data = await res.json();
        currentArticle = data[currentSlug];

        if (!currentArticle) {
            document.getElementById("article-content").innerHTML = "<h1>Artículo no encontrado</h1>";
            return;
        }

        const title = currentArticle.title?.[lang] || currentArticle.title?.["en"];
        const content = currentArticle.content?.[lang] || currentArticle.content?.["en"];

        document.title = title;
        document.getElementById("article-content").innerHTML = `
            <h1>${title}</h1>
            ${content}
        `;
    } catch (err) {
        console.error("[Error al cargar artículo dinámico]", err);
        document.getElementById("article-content").innerHTML = "<h1>Error al cargar el artículo</h1>";
    }
}

function setupLanguageButtons() {
    const supportedLangs = ["es", "en", "pt-br"];

    supportedLangs.forEach(lang => {
        const btn = document.getElementById(`btn-${lang}`);
        if (btn) {
            btn.addEventListener("click", async () => {
                currentLang = lang;
                localStorage.setItem("preferredLang", lang);
                await loadArticle(lang);
                highlightActiveButton(lang);
            });
        }
    });

    highlightActiveButton(currentLang);
}

function highlightActiveButton(lang) {
    const buttons = document.querySelectorAll(".lang-buttons button");
    buttons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add("active");
}

function setupBackButton() {
    const backBtn = document.getElementById("btn-home");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = `../index.html?lang=${currentLang}`;
        });
    }
}
