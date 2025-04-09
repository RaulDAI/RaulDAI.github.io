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
