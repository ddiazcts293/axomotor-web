let vehicles = [];
let selectedVehicle = null;

export function init(extraData, dataStore) {
    // Ejemplo inicial de datos (puedes cargar de API en el futuro)
    vehicles = [
        { id: 1, matricula: "ABC123", marca: "Toyota", modelo: "Corolla", anio: 2020, estado: "Activo", enUso: "Sí", fechaRegistro: "2023-05-12", numRegistro: "REG-001" }
    ];

    renderVehicles();
    setupEventHandlers();
}

function renderVehicles() {
    const tbody = document.getElementById("vehiclesTableBody");
    tbody.innerHTML = "";
    vehicles.forEach(v => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${v.matricula}</td>
            <td>${v.marca} ${v.modelo} ${v.anio}</td>
            <td>${v.estado}</td>
            <td>${v.enUso}</td>
            <td>${v.fechaRegistro}</td>
            <td>
                <button class="infoBtn" data-id="${v.id}">ℹ️</button>
                <button class="editBtn" data-id="${v.id}">✏️</button>
                <button class="deleteBtn" data-id="${v.id}">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    attachRowEvents();
}

function setupEventHandlers() {
    document.getElementById("btnAddVehicle").onclick = () => toggleModal("modalAdd", true);
    document.getElementById("cancelAdd").onclick = () => toggleModal("modalAdd", false);
    document.getElementById("cancelEdit").onclick = () => toggleModal("modalEdit", false);
    document.getElementById("closeInfo").onclick = () => toggleModal("modalInfo", false);
    document.getElementById("cancelDelete").onclick = () => toggleModal("modalDelete", false);

    // Registrar nuevo vehículo
    document.getElementById("formAddVehicle").onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newVehicle = {
            id: Date.now(),
            clase: formData.get("clase"),
            marca: formData.get("marca"),
            modelo: formData.get("modelo"),
            anio: formData.get("anio"),
            matricula: formData.get("matricula"),
            numRegistro: formData.get("numRegistro"),
            estado: "Activo",
            enUso: "No",
            fechaRegistro: new Date().toISOString().split("T")[0]
        };
        vehicles.push(newVehicle);
        renderVehicles();
        toggleModal("modalAdd", false);
    };

    // Editar vehículo
    document.getElementById("formEditVehicle").onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        selectedVehicle.estado = formData.get("estado");
        selectedVehicle.matricula = formData.get("matricula");
        selectedVehicle.numRegistro = formData.get("numRegistro");
        renderVehicles();
        toggleModal("modalEdit", false);
    };

    document.getElementById("confirmDelete").onclick = () => {
        vehicles = vehicles.filter(v => v.id !== selectedVehicle.id);
        renderVehicles();
        toggleModal("modalDelete", false);
    };
}

function attachRowEvents() {
    document.querySelectorAll(".infoBtn").forEach(btn => btn.onclick = () => showInfo(btn.dataset.id));
    document.querySelectorAll(".editBtn").forEach(btn => btn.onclick = () => showEdit(btn.dataset.id));
    document.querySelectorAll(".deleteBtn").forEach(btn => btn.onclick = () => showDelete(btn.dataset.id));
}

function showInfo(id) {
    selectedVehicle = vehicles.find(v => v.id == id);
    const container = document.getElementById("vehicleDetails");
    container.innerHTML = `
        <p><b>Matrícula:</b> ${selectedVehicle.matricula}</p>
        <p><b>Número Registro:</b> ${selectedVehicle.numRegistro}</p>
        <p><b>Estado:</b> ${selectedVehicle.estado}</p>
        <p><b>En uso:</b> ${selectedVehicle.enUso}</p>
        <p><b>Marca:</b> ${selectedVehicle.marca}</p>
        <p><b>Modelo:</b> ${selectedVehicle.modelo}</p>
        <p><b>Clase:</b> ${selectedVehicle.clase || "N/A"}</p>
        <p><b>Año:</b> ${selectedVehicle.anio}</p>
    `;
    // eventos del dispositivo (ejemplo vacío)
    document.getElementById("eventsTableBody").innerHTML = `
        <tr><td colspan="6">Sin eventos registrados</td></tr>
    `;
    toggleModal("modalInfo", true);
}

function showEdit(id) {
    selectedVehicle = vehicles.find(v => v.id == id);
    const form = document.getElementById("formEditVehicle");
    form.estado.value = selectedVehicle.estado;
    form.matricula.value = selectedVehicle.matricula;
    form.numRegistro.value = selectedVehicle.numRegistro;
    toggleModal("modalEdit", true);
}

function showDelete(id) {
    selectedVehicle = vehicles.find(v => v.id == id);
    toggleModal("modalDelete", true);
}

function toggleModal(id, show) {
    document.getElementById(id).classList.toggle("hidden", !show);
}

export function cleanUp() {
    console.log('Finalizando página de vehículos');
}
