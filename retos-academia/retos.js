const etapasTotales = [
    "Esculpido",
    "Retopología",
    "UVs + Bake",
    "Texturizado",
    "Animación",
    "Motor Unity"
];

const retos = [];
let indexActualParaSumar = null;

function toggleNav() {
    const side = document.getElementById("mySidenav");
    const main = document.getElementById("main");
    const toggle = document.getElementById("menuToggle");
    if (!side || !main || !toggle) return;
    const isOpen = side.classList.contains("abierta");
    side.classList.toggle("abierta", !isOpen);
    toggle.setAttribute("aria-expanded", !isOpen);
    main.style.marginLeft = (!isOpen && window.innerWidth > 768) ? "220px" : "0";
}

function mostrarSeccion(nombre) {
    document.querySelectorAll('.seccion').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`seccion-${nombre}`)?.classList.remove('hidden');
    document.querySelectorAll('.sidenav button').forEach(link => {
        link.classList.toggle('activo', link.getAttribute('data-seccion') === nombre);
    });
}

function formatearTiempo(minTotal) {
    const horas = Math.floor(minTotal / 60).toString().padStart(2, "0");
    const minutos = (minTotal % 60).toString().padStart(2, "0");
    return `${horas}:${minutos}`;
}

function actualizarDuracion(index, campo, valor, tipo) {
    valor = parseInt(valor);
    if (isNaN(valor)) return;

    const actual = retos[index][campo];
    let horas = Math.floor(actual / 60);
    let minutos = actual % 60;

    if (tipo === "horas") horas = Math.max(0, Math.min(99, valor));
    if (tipo === "minutos") minutos = Math.max(0, Math.min(59, valor));

    retos[index][campo] = horas * 60 + minutos;
}

function filtrarNumeros(input) {
    input.value = input.value.replace(/\D/g, "");
}

function normalizarDosDigitos(input) {
    let val = parseInt(input.value);
    if (isNaN(val)) {
        input.value = "00";
        return;
    }

    if (input.dataset.tipo === "horas") {
        val = Math.max(0, Math.min(99, val));
    }

    if (input.dataset.tipo === "minutos") {
        val = Math.max(0, Math.min(59, val));
    }

    input.value = val.toString().padStart(2, "0");
}

function renderRetos() {
    const cuerpo = document.getElementById("tabla-cuerpo-retos");
    cuerpo.innerHTML = "";

    retos.forEach((reto, i) => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${retos.length - i}</td>
            <td><input type="text" value="${reto.nombre}" oninput="actualizarDato(${i}, 'nombre', this.value)" /></td>
            <td>
                <select onchange="actualizarDato(${i}, 'etapa', this.value)" onfocus="renderOpcionesEtapas(this, ${i})">
                    <option disabled value="">⮟</option>
                </select>
            </td>
            <td>
              <div class="tiempo-input">
                <input type="text" maxlength="2" inputmode="numeric" data-tipo="horas"
                       value="${Math.floor(reto.tiempoEstimado / 60).toString().padStart(2, '0')}"
                       oninput="filtrarNumeros(this)" 
                       onblur="normalizarDosDigitos(this); actualizarDuracion(${i}, 'tiempoEstimado', this.value, 'horas')" />:
                <input type="text" maxlength="2" inputmode="numeric" data-tipo="minutos"
                       value="${(reto.tiempoEstimado % 60).toString().padStart(2, '0')}"
                       oninput="filtrarNumeros(this)" 
                       onblur="normalizarDosDigitos(this); actualizarDuracion(${i}, 'tiempoEstimado', this.value, 'minutos')" />
              </div>
            </td>
            <td>
              <div class="tiempo-input">
                <span>${formatearTiempo(reto.tiempoReal)}</span>
                <button class="btn-sumar-tiempo" onclick="abrirModal(${i})" aria-label="Sumar tiempo real">
                    <i data-lucide="plus"></i>
                </button>
              </div>
            </td>
            <td><input type="date" value="${reto.fechaInicio}" onchange="actualizarDato(${i}, 'fechaInicio', this.value)" /></td>
            <td><input type="date" value="${reto.fechaFin}" onchange="actualizarDato(${i}, 'fechaFin', this.value)" /></td>
            <td><input type="number" value="${reto.puntos}" onchange="actualizarDato(${i}, 'puntos', this.value)" /></td>
            <td>
                <div style="display: flex; gap: 6px; justify-content: center;">
                    <i data-lucide="${reto.insignia || 'lock'}"></i>
                </div>
            </td>
            <td>
                <button class="btn-eliminar" onclick="eliminarReto(${i})" ${retos.length === 1 ? 'disabled' : ''}>
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;

        cuerpo.appendChild(fila);
    });

    lucide.createIcons();
    document.querySelectorAll("select").forEach((select, index) => renderOpcionesEtapas(select, index));
}

function abrirModal(index) {
    indexActualParaSumar = index;
    document.getElementById("inputHoras").value = "00";
    document.getElementById("inputMinutos").value = "00";
    document.getElementById("modal-tiempo").classList.remove("hidden");
}

function cerrarModal(event) {
    if (event && event.target.id !== "modal-tiempo") return;
    document.getElementById("modal-tiempo").classList.add("hidden");
    indexActualParaSumar = null;
}

function confirmarSumaTiempo() {
    if (indexActualParaSumar === null) return;

    const h = parseInt(document.getElementById("inputHoras").value) || 0;
    const m = parseInt(document.getElementById("inputMinutos").value) || 0;
    const total = h * 60 + m;

    if (total > 0) {
        retos[indexActualParaSumar].tiempoReal += total;
        renderRetos();
    }

    cerrarModal({ target: { id: "modal-tiempo" } });
}

function agregarReto() {
    retos.unshift({
        nombre: "",
        etapa: "",
        tiempoEstimado: 0,
        tiempoReal: 0,
        fechaInicio: "",
        fechaFin: "",
        puntos: 0,
        insignia: ""
    });
    renderRetos();
}

function eliminarReto(i) {
    if (retos.length <= 1) return;
    retos.splice(i, 1);
    renderRetos();
}

function actualizarDato(i, campo, valor) {
    retos[i][campo] = valor;

    if (campo === "etapa") renderRetos();

    if (campo === "nombre") {
        retos[i].etapa = "";
        const fila = document.querySelectorAll("#tabla-cuerpo-retos tr")[i];
        const select = fila.querySelector("select");
        if (select) renderOpcionesEtapas(select, i);
    }
}

function renderOpcionesEtapas(select, index) {
    const nombre = retos[index].nombre.trim();
    if (!nombre) {
        select.innerHTML = '<option disabled selected value="">⛔ Escribe un nombre</option>';
        select.disabled = true;
        return;
    }

    select.disabled = false;
    const usadas = retos
        .filter((r, i) => i !== index && r.nombre.trim() === nombre)
        .map(r => r.etapa);

    const etapaActual = retos[index].etapa;
    select.innerHTML = '<option disabled value="">▼ Elegir etapa</option>';

    etapasTotales.forEach(etapa => {
        if (!usadas.includes(etapa) || etapa === etapaActual) {
            const opt = document.createElement("option");
            opt.value = etapa;
            opt.textContent = etapa;
            select.appendChild(opt);
        }
    });

    select.value = etapaActual || "";
}

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    mostrarSeccion('retos');
    document.querySelector('[data-seccion="retos"]')?.classList.add('activo');
    agregarReto();
});
