const etapasTotales = [
    "Esculpido",
    "Retopología",
    "UVs + Bake",
    "Texturizado",
    "Animación",
    "Motor Unreal"
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

    retos.forEach((reto, index) => {
        const fila = document.createElement("tr");
        fila.dataset.id = reto.id;

        const tdNum = document.createElement("td");
        tdNum.style.textAlign = "center";
        tdNum.textContent = retos.length - index;
        fila.appendChild(tdNum); // ✅ AGREGA LA CELDA A LA FILA


        // Nombre
        const tdNombre = document.createElement("td");
        const inputNombre = document.createElement("input");
        inputNombre.type = "text";
        inputNombre.value = reto.nombre;
        inputNombre.addEventListener("input", e => actualizarCampoPorId(reto.id, "nombre", e.target.value));
        tdNombre.appendChild(inputNombre);
        fila.appendChild(tdNombre);

        // Etapa
        const tdEtapa = document.createElement("td");
        const selectEtapa = document.createElement("select");
        selectEtapa.addEventListener("change", e => actualizarCampoPorId(reto.id, "etapa", e.target.value));
        tdEtapa.appendChild(selectEtapa);
        fila.appendChild(tdEtapa);

        // Tiempo Estimado
        const tdTEstimado = document.createElement("td");
        const divTiempo = document.createElement("div");
        divTiempo.className = "tiempo-input";

        const inputHoras = document.createElement("input");
        inputHoras.type = "text";
        inputHoras.maxLength = 2;
        inputHoras.inputMode = "numeric";
        inputHoras.dataset.tipo = "horas";
        inputHoras.value = Math.floor(reto.tiempoEstimado / 60).toString().padStart(2, '0');
        inputHoras.oninput = () => filtrarNumeros(inputHoras);
        inputHoras.onblur = () => {
            normalizarDosDigitos(inputHoras);
            actualizarDuracionPorId(reto.id, inputHoras.value, "horas");
        };

        const inputMin = document.createElement("input");
        inputMin.type = "text";
        inputMin.maxLength = 2;
        inputMin.inputMode = "numeric";
        inputMin.dataset.tipo = "minutos";
        inputMin.value = (reto.tiempoEstimado % 60).toString().padStart(2, '0');
        inputMin.oninput = () => filtrarNumeros(inputMin);
        inputMin.onblur = () => {
            normalizarDosDigitos(inputMin);
            actualizarDuracionPorId(reto.id, inputMin.value, "minutos");
        };

        const sep = document.createElement("span");
        sep.className = "separador";
        sep.textContent = ":";

        divTiempo.appendChild(inputHoras);
        divTiempo.appendChild(sep);
        divTiempo.appendChild(inputMin);
        tdTEstimado.appendChild(divTiempo);
        fila.appendChild(tdTEstimado);

        // Tiempo Real + botón sumar
        const tdTReal = document.createElement("td");
        const divReal = document.createElement("div");
        divReal.className = "tiempo-input";

        const spanTiempo = document.createElement("span");
        spanTiempo.className = "tiempo-real-match";
        spanTiempo.textContent = formatearTiempo(reto.tiempoReal);

        const btnSumar = document.createElement("button");
        btnSumar.className = "btn-sumar-tiempo";
        btnSumar.setAttribute("aria-label", "Sumar tiempo real");
        btnSumar.onclick = () => abrirModalPorId(reto.id);

        const iconPlus = document.createElement("i");
        iconPlus.setAttribute("data-lucide", "plus");
        btnSumar.appendChild(iconPlus);

        divReal.appendChild(spanTiempo);
        divReal.appendChild(btnSumar);
        tdTReal.appendChild(divReal);
        fila.appendChild(tdTReal);

        // Fecha inicio y fin
        ["fechaInicio", "fechaFin"].forEach(campo => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "date";
            input.value = reto[campo];
            input.addEventListener("change", e => actualizarCampoPorId(reto.id, campo, e.target.value));
            td.appendChild(input);
            fila.appendChild(td);
        });

        // Puntos (solo visual)
        const tdPuntos = document.createElement("td");
        tdPuntos.className = "celda-puntos";
        const spanPts = document.createElement("span");
        spanPts.className = "valor-puntos";
        spanPts.textContent = reto.puntos.toString().padStart(1, '0');
        const labelMoneda = document.createElement("span");
        labelMoneda.className = "moneda-label";
        labelMoneda.textContent = "DES";
        tdPuntos.appendChild(spanPts);
        tdPuntos.appendChild(labelMoneda);
        fila.appendChild(tdPuntos);

        // Insignias
        const tdInsignia = document.createElement("td");
        tdInsignia.className = "celda-insignia";
        ["crown", "trophy", "skull"].forEach(icono => {
            const iTag = document.createElement("i");
            iTag.setAttribute("data-lucide", icono);
            tdInsignia.appendChild(iTag);
        });
        fila.appendChild(tdInsignia);

        // Botón eliminar
        const tdEliminar = document.createElement("td");
        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn-eliminar";
        btnEliminar.disabled = retos.length === 1;
        btnEliminar.onclick = () => eliminarRetoPorId(reto.id);
        const iconTrash = document.createElement("i");
        iconTrash.setAttribute("data-lucide", "trash-2");
        btnEliminar.appendChild(iconTrash);
        tdEliminar.appendChild(btnEliminar);
        fila.appendChild(tdEliminar);

        cuerpo.appendChild(fila);
    });

    lucide.createIcons();
    document.querySelectorAll("select").forEach((select, index) => {
        const id = select.closest("tr")?.dataset.id;
        if (id) renderOpcionesEtapasPorId(select, id);
    });
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

    cerrarModal({target: {id: "modal-tiempo"}});
}

function agregarReto() {
    const nuevo = {
        id: crypto.randomUUID(), // genera ID único localmente (igual que Supabase UUID)
        nombre: "",
        etapa: "",
        tiempoEstimado: 0,
        tiempoReal: 0,
        fechaInicio: "",
        fechaFin: "",
        puntos: 0,
        insignia: ""
    };
    retos.unshift(nuevo);
    renderRetos();
}


function renderOpcionesEtapas(select, index) {
    const nombre = retos[index].nombre.trim();
    if (!nombre) {
        select.innerHTML = '<option disabled selected value="">⛔ Nombre?</option>';
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

function actualizarCampoPorId(id, campo, valor) {
    const reto = retos.find(r => r.id === id);
    if (!reto) return;

    reto[campo] = valor;

    if (campo === "etapa") {
        renderRetos();
    }

    if (campo === "nombre") {
        const nombreAnterior = reto.nombre;
        reto.nombre = valor;

        // Solo borramos la etapa si el nuevo nombre es distinto y hay riesgo de duplicado
        const yaExisteMismoNombreYEtapa = retos.some(r =>
            r !== reto && r.nombre.trim() === valor.trim() && r.etapa === reto.etapa
        );

        if (yaExisteMismoNombreYEtapa) {
            reto.etapa = "";
        }

        const fila = document.querySelector(`tr[data-id="${id}"]`);
        const select = fila?.querySelector("select");
        if (select) {
            renderOpcionesEtapasPorId(select, id);
        }
    }


    if (campo === "fechaInicio" || campo === "fechaFin") {
        const f1 = reto.fechaInicio;
        const f2 = reto.fechaFin;

        if (f1 && f2 && f2 < f1) {
            reto.fechaFin = ""; // ❌ limpia automáticamente si está mal
            renderRetos(); // 🔁 fuerza la actualización visual
        }
    }
}


function actualizarDuracionPorId(id, valor, tipo) {
    const reto = retos.find(r => r.id === id);
    if (!reto) return;
    let actual = reto.tiempoEstimado;
    let horas = Math.floor(actual / 60);
    let minutos = actual % 60;
    valor = parseInt(valor);
    if (isNaN(valor)) return;
    if (tipo === "horas") horas = Math.max(0, Math.min(99, valor));
    if (tipo === "minutos") minutos = Math.max(0, Math.min(59, valor));
    reto.tiempoEstimado = horas * 60 + minutos;
}

function eliminarRetoPorId(id) {
    if (retos.length <= 1) return;
    const index = retos.findIndex(r => r.id === id);
    if (index !== -1) {
        retos.splice(index, 1);
        renderRetos();
    }
}

function abrirModalPorId(id) {
    indexActualParaSumar = retos.findIndex(r => r.id === id);
    document.getElementById("inputHoras").value = "00";
    document.getElementById("inputMinutos").value = "00";
    document.getElementById("modal-tiempo").classList.remove("hidden");
}

function renderOpcionesEtapasPorId(select, id) {
    const index = retos.findIndex(r => r.id === id);
    if (index === -1) return;
    renderOpcionesEtapas(select, index);
}

function descargarRetos() {
    const data = JSON.stringify(retos, null, 2);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "retos-academia.des";
    a.click();

    URL.revokeObjectURL(url);
}


function importarRetos(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error("Formato inválido");

            // Limpiar y reemplazar los retos existentes
            retos.length = 0;
            data.forEach(d => {
                retos.push({
                    id: d.id || crypto.randomUUID(),
                    nombre: d.nombre || "",
                    etapa: d.etapa || "",
                    tiempoEstimado: d.tiempoEstimado || 0,
                    tiempoReal: d.tiempoReal || 0,
                    fechaInicio: d.fechaInicio || "",
                    fechaFin: d.fechaFin || "",
                    puntos: d.puntos || 0,
                    insignia: d.insignia || ""
                });
            });

            renderRetos();
        } catch (err) {
            alert("Archivo inválido. Asegúrate de cargar un .des válido.");
        }
    };
    reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    mostrarSeccion("retos");
    document.querySelector('[data-seccion="retos"]')?.classList.add("activo");

    agregarReto();

    document.querySelector(".btn-mas")?.addEventListener("click", agregarReto);

    document.querySelectorAll(".nav-btn").forEach(btn =>
        btn.addEventListener("click", () => mostrarSeccion(btn.dataset.seccion))
    );

    document.getElementById("menuToggle")?.addEventListener("click", toggleNav);
});
