import AxoMotorWebAPI from '../../services/axomotor.js';
let vehicles = [];
let selectedVehicle = null;

export async function init(extraData, dataStore) {
    // Ejemplo inicial de datos (puedes cargar de API en el futuro)
    try {
        const response = await AxoMotorWebAPI.getAllVehicles();
        console.log("Vehículos desde la API:", response);
        if (response) {
            console.table(response.result);
            vehicles = response.result.map(v => ({
            id: v.id,
            matricula: v.plateNumber,
            marca: v.brand,
            modelo: v.model,
            clase: v.class || "N/A",
            anio: v.year,
            estado: v.status || "Activo",
            enUso: v.inUse ? "Sí" : "No",
            fechaRegistro: v.registrationDate?.split("T")[0] || "Sin fecha",
            numRegistro: v.registrationNumber
            }));
            renderVehicles();
        } else {
            alert("Error al obtener vehículos: " + (response.message || "Respuesta inesperada"));
        }

        } catch (error) {
        console.error(error);
        alert("No se pudieron cargar los vehículos desde la API");
    }


    renderVehicles();
    setupEventHandlers();
}

function renderVehicles() {
    console.log("Vehículos renderizados:", vehicles);
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
    document.getElementById("formAddVehicle").onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newVehicle = {
            plateNumber: formData.get("matricula"),
            registrationNumber: formData.get("numRegistro"),
            brand: formData.get("marca"),
            model: formData.get("modelo"),
            class: formData.get("clase"),
            year: parseInt(formData.get("anio"))
        };

        try {
            const response = await AxoMotorWebAPI.createVehicle(newVehicle);
            console.log("Respuesta de la API:", response);

            if (response.code === 'success') {
                alert("Vehículo registrado exitosamente");
                // Recargar lista después del registro (en el futuro)
                toggleModal("modalAdd", false);
                e.target.reset();
            } else {
                alert("Error al registrar vehículo: " + (response.message || "Respuesta inesperada"));
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión al registrar vehículo");
        }

    };

    // Editar vehículo
    document.getElementById("formEditVehicle").onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const updatedData = {
            plateNumber: formData.get("matricula"),
            registrationNumber: formData.get("numRegistro"),
            status: formData.get("estado")
        };

        try {
            const response = await AxoMotorWebAPI.updateVehicle(selectedVehicle.id, updatedData);
            console.log("Respuesta al actualizar:", response);

            // Actualiza los datos locales por si renderizamos de nuevo
            selectedVehicle.matricula = updatedData.plateNumber;
            selectedVehicle.numRegistro = updatedData.registrationNumber;
            selectedVehicle.estado = updatedData.status;

            renderVehicles();
            toggleModal("modalEdit", false);
        } catch (error) {
            console.error(error);
            alert("Error al actualizar el vehículo");
        }
    };


    document.getElementById("confirmDelete").onclick = async () => {
        try {
            const response = await AxoMotorWebAPI.deleteVehicle(selectedVehicle.id);
            console.log("Respuesta al eliminar:", response);

            vehicles = vehicles.filter(v => v.id !== selectedVehicle.id);
            renderVehicles();
            toggleModal("modalDelete", false);
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el vehículo.");
        }
    };

}

function attachRowEvents() {
    document.querySelectorAll(".infoBtn").forEach(btn => btn.onclick = () => showInfo(btn.dataset.id));
    document.querySelectorAll(".editBtn").forEach(btn => btn.onclick = () => showEdit(btn.dataset.id));
    document.querySelectorAll(".deleteBtn").forEach(btn => btn.onclick = () => showDelete(btn.dataset.id));
}

async function showInfo(id) {
    selectedVehicle = vehicles.find(v => v.id == parseInt(id));
    if (!selectedVehicle) {
        console.error("No se encontró el vehículo con id:", id);
        return;
    }

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

    const eventsTbody = document.getElementById("eventsTableBody");
    eventsTbody.innerHTML = `<tr><td colspan="6">Cargando eventos...</td></tr>`;

    try {
        const response = await AxoMotorWebAPI.getVehicleEvents(selectedVehicle.id);
        console.log("Eventos del vehículo:", response);
        if (response.code === "success" && Array.isArray(response.result.items)) {
            const eventos = response.result.items;
            if (eventos.length === 0) {
                eventsTbody.innerHTML = `<tr><td colspan="6">Sin eventos registrados</td></tr>`;
            } else {
                eventsTbody.innerHTML = "";
                eventos.forEach(event => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${event.name || "Sin nombre"}</td>
                        <td>${event.type || "-"}</td>
                        <td>${event.severity || "-"}</td>
                        <td>${event.timestamp?.replace("T", " ").slice(0, 16) || "-"}</td>
                        <td>${event.createdAt?.replace("T", " ").slice(0, 16) || "-"}</td>
                        <td>${event.updatedAt?.replace("T", " ").slice(0, 16) || "-"}</td>
                    `;
                    eventsTbody.appendChild(row);
                });
            }
        } else {
            eventsTbody.innerHTML = `<tr><td colspan="6">Error al obtener eventos</td></tr>`;
        }

    } catch (error) {
        console.error(error);
        eventsTbody.innerHTML = `<tr><td colspan="6">Error de conexión</td></tr>`;
    }

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
