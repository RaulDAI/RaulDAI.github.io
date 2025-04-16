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

    const enlaces = document.querySelectorAll('.sidenav button');
    enlaces.forEach(link => {
        const seccion = link.getAttribute('data-seccion');
        link.classList.toggle('activo', seccion === nombre);
    });
}

function agregarReto(esInicial = false) {
    const cuerpo = document.getElementById("tabla-cuerpo-retos");
    const nuevaFila = document.createElement("tr");

    nuevaFila.innerHTML = `
        <td></td>
        <td><input type="text" placeholder="Nombre del reto" /></td>
        <td>
            <select>
                <option>Esculpido</option>
                <option>Retopología</option>
                <option>UVs + Bake</option>
                <option>Texturizado</option>
                <option>Animación</option>
                <option>Motor Unity</option>
            </select>
        </td>
        <td><input type="number" placeholder="Horas estimadas" /></td>
        <td><input type="number" placeholder="Horas reales" /></td>
        <td><input type="date" /></td>
        <td><input type="date" /></td>
        <td><input type="number" placeholder="Puntos" /></td>
        <td>
            <div style="display: flex; gap: 6px; justify-content: center;">
                <i data-lucide="medal"></i>
                <i data-lucide="sun"></i>
                <i data-lucide="lock"></i>
            </div>
        </td>
        <td>
            <button class="btn-eliminar" onclick="eliminarReto(this)" ${esInicial ? "disabled" : ""}>
                <i data-lucide="trash-2"></i>
            </button>
        </td>
    `;

    cuerpo.prepend(nuevaFila);
    lucide.createIcons();
    actualizarNumeracion();
}


function eliminarReto(boton) {
    const cuerpo = document.getElementById("tabla-cuerpo-retos");
    const filas = cuerpo.querySelectorAll("tr");
    if (filas.length <= 1) return;

    const fila = boton.closest("tr");
    fila.remove();

    actualizarNumeracion();
    actualizarBotonesEliminar();
}

function actualizarNumeracion() {
    const filas = document.querySelectorAll('#tabla-cuerpo-retos tr');
    let total = filas.length;

    filas.forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td');
        if (celdaNumero) {
            celdaNumero.textContent = total - index;
        }
    });
}

function actualizarBotonesEliminar() {
    const filas = document.querySelectorAll('#tabla-cuerpo-retos tr');
    const botones = document.querySelectorAll('.btn-eliminar');

    botones.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    });

    if (filas.length === 1) {
        const unicoBtn = filas[0].querySelector('.btn-eliminar');
        if (unicoBtn) {
            unicoBtn.disabled = true;
            unicoBtn.style.opacity = "0.3";
            unicoBtn.style.cursor = "default";
        }
    }
}

// ✅ Asegura que haya al menos una fila al cargar
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    mostrarSeccion('retos');
    document.querySelector('[data-seccion="retos"]').classList.add('activo');
});
