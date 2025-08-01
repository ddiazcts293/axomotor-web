import './style.css';
import { chart } from 'highcharts/highcharts';

let incidents = [];
let selectedIncident = null;

export function init(extraData, dataStore) {
    console.log('Inicializando página de incidentes...');

    incidents = [
        { id: 1, incidente: "Accidente menor", tipo: "Choque", prioridad: "Alta", estado: "Abierto", registradoPor: "Juan", fechaRegistro: "2025-07-01", fechaActualizacion: "2025-07-15" }
    ];

    renderIncidents();
    setupEventHandlers();
    renderChart();
}

export function cleanUp() {
    console.log('Finalizando página de incidentes');
}

function renderIncidents() {
    const tbody = document.getElementById("incidentsTableBody");
    tbody.innerHTML = "";
    incidents.forEach(i => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i.incidente}</td>
            <td>${i.tipo}</td>
            <td>${i.prioridad}</td>
            <td>${i.estado}</td>
            <td>${i.registradoPor}</td>
            <td>${i.fechaRegistro}</td>
            <td>${i.fechaActualizacion}</td>
            <td>
                <button class="infoIncidentBtn" data-id="${i.id}">ℹ️</button>
                <button class="editIncidentBtn" data-id="${i.id}">✏️</button>
                <button class="deleteIncidentBtn" data-id="${i.id}">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    attachRowEvents();
}

function setupEventHandlers() {
    document.getElementById("btnAddIncident").onclick = () => toggleModal("modalAddIncident", true);
    document.getElementById("cancelAddIncident").onclick = () => toggleModal("modalAddIncident", false);
    document.getElementById("cancelEditIncident").onclick = () => toggleModal("modalEditIncident", false);
    document.getElementById("closeInfoIncident").onclick = () => toggleModal("modalInfoIncident", false);
    document.getElementById("cancelDeleteIncident").onclick = () => toggleModal("modalDeleteIncident", false);

    // Ordenar columnas
    document.querySelectorAll("#incidentsTable th[data-col]").forEach(th => {
        th.onclick = () => sortTable(th.dataset.col);
    });
}

function attachRowEvents() {
    document.querySelectorAll(".infoIncidentBtn").forEach(btn => btn.onclick = () => showInfoIncident(btn.dataset.id));
    document.querySelectorAll(".editIncidentBtn").forEach(btn => btn.onclick = () => showEditIncident(btn.dataset.id));
    document.querySelectorAll(".deleteIncidentBtn").forEach(btn => btn.onclick = () => showDeleteIncident(btn.dataset.id));
}

function showInfoIncident(id) {
    selectedIncident = incidents.find(i => i.id == id);
    const container = document.getElementById("incidentDetails");
    container.innerHTML = `
        <p><b>Incidente:</b> ${selectedIncident.incidente}</p>
        <p><b>Tipo:</b> ${selectedIncident.tipo}</p>
        <p><b>Prioridad:</b> ${selectedIncident.prioridad}</p>
        <p><b>Estado:</b> ${selectedIncident.estado}</p>
        <p><b>Registrado por:</b> ${selectedIncident.registradoPor}</p>
        <p><b>Fecha Registro:</b> ${selectedIncident.fechaRegistro}</p>
        <p><b>Última Actualización:</b> ${selectedIncident.fechaActualizacion}</p>
    `;
    toggleModal("modalInfoIncident", true);
}

function showEditIncident(id) {
    selectedIncident = incidents.find(i => i.id == id);
    toggleModal("modalEditIncident", true);
}

function showDeleteIncident(id) {
    selectedIncident = incidents.find(i => i.id == id);
    toggleModal("modalDeleteIncident", true);
    document.getElementById("confirmDeleteIncident").onclick = () => {
        incidents = incidents.filter(i => i.id !== selectedIncident.id);
        renderIncidents();
        toggleModal("modalDeleteIncident", false);
    };
}

function sortTable(col) {
    incidents.sort((a, b) => (a[col] > b[col]) ? 1 : -1);
    renderIncidents();
}

function toggleModal(id, show) {
    document.getElementById(id).classList.toggle("hidden", !show);
}

function renderChart() {
    chart('container', {
        chart: { type: 'spline' },
        title: { text: 'Incidencias por Mes' },
        xAxis: { categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'] },
        yAxis: { title: { text: 'Cantidad' } },
        series: [{ name: 'Incidencias', data: [3, 5, 2, 8, 7, 4, 6] }]
    });
}
