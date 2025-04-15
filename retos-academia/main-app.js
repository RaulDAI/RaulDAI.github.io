function toggleNav() {
    const side = document.getElementById("mySidenav");
    const main = document.getElementById("main");
    const toggle = document.getElementById("menuToggle");

    if (!side || !main || !toggle) return;

    const isOpen = side.classList.contains("abierta");

    if (isOpen) {
        side.classList.remove("abierta");
        toggle.setAttribute("aria-expanded", "false");
        main.style.marginLeft = "0";
    } else {
        side.classList.add("abierta");
        toggle.setAttribute("aria-expanded", "true");

        if (window.innerWidth > 768) {
            main.style.marginLeft = "220px";
        } else {
            main.style.marginLeft = "0";
        }
    }
}

function mostrarSeccion(nombre) {
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(sec => sec.classList.add('hidden'));

    const target = document.getElementById(`seccion-${nombre}`);
    if (target) {
        target.classList.remove('hidden');
    }

    // ✅ Marca como activo el botón correcto
    const enlaces = document.querySelectorAll('.sidenav a');
    enlaces.forEach(link => {
        const seccion = link.getAttribute('data-seccion');
        link.classList.toggle('activo', seccion === nombre);
    });
}
