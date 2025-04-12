let currentLang = localStorage.getItem("preferredLang") || "en";
let currentArticle = null;
let currentSlug = null;

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentSlug = urlParams.get("slug");
    currentLang = urlParams.get("lang") || currentLang;

    await loadArticle(currentLang);
    setupLanguageButtons();
    setupBackButton();
});

async function loadArticle(lang) {
    try {
        const res = await fetch(`${PATHS.DATA}articles-${lang}.json`);
        if (!res.ok) throw new Error(`No se pudo cargar articles-${lang}.json`);

        const data = await res.json();
        currentArticle = data[currentSlug];

        const container = document.getElementById("article-content");
        if (!container) return;

        if (!currentArticle) {
            container.innerHTML = "<h1>Artículo no encontrado</h1>";
            return;
        }

        const html = currentArticle.html || "<p>Contenido no disponible.</p>";
        document.title = sanitizeText(currentArticle.titulo || "Sin título");
        container.innerHTML = "";

        // ⛔️ Ya no renderizamos el título aquí

        const contentWrapper = document.createElement("div");
        contentWrapper.innerHTML = sanitizeHTML(html);
        container.appendChild(contentWrapper);
    } catch (err) {
        console.error("[Error al cargar artículo dinámico]", err);
        const container = document.getElementById("article-content");
        if (container) container.innerHTML = "<h1>Error al cargar el artículo</h1>";
    }
}

function sanitizeText(text) {
    return String(text).replace(/[<>]/g, "");
}

function sanitizeHTML(html) {
    const allowedTags = ["b", "i", "em", "strong", "p", "ul", "ol", "li", "br", "a", "code", "pre", "h1", "h2", "h3"];
    const temp = document.createElement("div");
    temp.innerHTML = html;

    const elements = temp.querySelectorAll("*");
    elements.forEach(el => {
        if (!allowedTags.includes(el.tagName.toLowerCase())) {
            el.replaceWith(...el.childNodes);
        } else {
            [...el.attributes].forEach(attr => {
                if (!["href", "target", "rel"].includes(attr.name)) {
                    el.removeAttribute(attr.name);
                }
                if (attr.name === "href" && el.href.startsWith("javascript:")) {
                    el.removeAttribute("href");
                }
            });
        }
    });

    return temp.innerHTML;
}

function setupLanguageButtons() {
    const supportedLangs = ["es", "en", "pt-br"];

    supportedLangs.forEach(lang => {
        const btn = document.getElementById(`btn-${lang}`);
        if (btn) {
            btn.addEventListener("click", async () => {
                currentLang = lang;
                localStorage.setItem("preferredLang", lang);
                const newURL = new URL(window.location.href);
                newURL.searchParams.set("lang", lang);
                history.replaceState(null, "", newURL.toString());
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
            window.location.href = PATHS.ROOT + "index.html?lang=" + currentLang;
        });
    }
}
