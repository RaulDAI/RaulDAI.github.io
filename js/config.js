const path = window.location.pathname;
const prefix = path.includes("/articles/") ? "../" : "";

const PATHS = {
    IMG: prefix + "assets/img/",
    LANG: prefix + "js/lang/",
    DATA: prefix + "output/data/",   // ✅ la única línea que cambió
    CSS: prefix + "css/",
    ARTICLES: prefix + "articles/",
    ROOT: prefix
};
