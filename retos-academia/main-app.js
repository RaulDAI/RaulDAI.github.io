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
    const enlaces = document.querySelectorAll('.sidenav button');
    enlaces.forEach(link => {
        const seccion = link.getAttribute('data-seccion');
        link.classList.toggle('activo', seccion === nombre);
    });
}

function agregarReto() {
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
            <button class="btn-eliminar" onclick="eliminarReto(this)">
                <i data-lucide="trash-2"></i>
            </button>
        </td>
    `;

    cuerpo.prepend(nuevaFila);
    lucide.createIcons();
    actualizarNumeracion();
}


function eliminarReto(boton) {
    const fila = boton.closest("tr");
    fila.remove();

    // Reenumerar filas
    const filas = document.querySelectorAll("#tabla-cuerpo-retos tr");
    filas.forEach((tr, i) => {
        const numeroCelda = tr.querySelector("td:first-child");
        if (numeroCelda) numeroCelda.textContent = i + 1;
    });
}

function actualizarNumeracion() {
    const filas = document.querySelectorAll('#tabla-cuerpo-retos tr');
    let total = filas.length;

    filas.forEach((fila, index) => {
        const celdaNumero = fila.querySelector('td');
        if (celdaNumero) {
            celdaNumero.textContent = total - index; // orden invertido: más nuevo arriba
        }
    });
}

