const path = window.location.pathname;

// Solo si incluye "/articles/" usamos "../", si no, usamos ""
const prefix = path.includes("/articles/") ? "../" : "";

const PATHS = {
    IMG: prefix + "assets/img/",
    LANG: prefix + "js/lang/",
    DATA: prefix + "data/",
    CSS: prefix + "css/",
    ARTICLES: prefix + "articles/",
    ROOT: prefix
};
