import AxoMotorWebAPI from '/services/axomotor.js';

let modalAddIncident, modalViewIncident, modalEditIncident;
let tbody;

// Opciones válidas según la API
const INCIDENT_CODES = [
  "engineFailure", "flatTire", "brakeIssues", "overheating", "batteryFailure",
  "oilLeak", "fuelLeak", "steeringFailure", "transmissionIssue", "accident",
  "trafficJam", "roadBlocked", "routeDeviation", "gpsSignalLost", "unauthorizedStop",
  "delayedDelivery", "wrongDelivery", "loadShifted", "packageDamaged",
  "driverReportedSickness", "driverError", "driverViolation", "driverUnavailable",
  "fatigueReported", "inusualBehavior", "theftAttempt", "cargoTheft",
  "vehicleStolen", "tamperingDetected", "panicButtonActivated", "unknownIssue",
  "weatherDelay", "customsDelay", "fuelShortage", "checkpointIssue",
  "deviceFailure", "abnormalActivity"
];

const INCIDENT_TYPES = ["mechanical", "route", "cargo", "driver", "security", "other"];
const INCIDENT_STATUSES = ["open", "inRevision", "closed", "discarded"];
const INCIDENT_PRIORITIES = ["low", "medium", "high"];

// 📌 Diccionarios de traducción
const INCIDENT_CODES_ES = {
  engineFailure: "Falla de motor",
  flatTire: "Llanta ponchada",
  brakeIssues: "Problemas de frenos",
  overheating: "Sobrecalentamiento",
  batteryFailure: "Falla de batería",
  oilLeak: "Fuga de aceite",
  fuelLeak: "Fuga de combustible",
  steeringFailure: "Falla en dirección",
  transmissionIssue: "Problema de transmisión",
  accident: "Accidente",
  trafficJam: "Congestión vial",
  roadBlocked: "Camino bloqueado",
  routeDeviation: "Desviación de ruta",
  gpsSignalLost: "Señal GPS perdida",
  unauthorizedStop: "Parada no autorizada",
  delayedDelivery: "Entrega retrasada",
  wrongDelivery: "Entrega incorrecta",
  loadShifted: "Carga desplazada",
  packageDamaged: "Paquete dañado",
  driverReportedSickness: "Conductor enfermo",
  driverError: "Error del conductor",
  driverViolation: "Infracción del conductor",
  driverUnavailable: "Conductor no disponible",
  fatigueReported: "Fatiga reportada",
  inusualBehavior: "Comportamiento inusual",
  theftAttempt: "Intento de robo",
  cargoTheft: "Robo de carga",
  vehicleStolen: "Vehículo robado",
  tamperingDetected: "Manipulación detectada",
  panicButtonActivated: "Botón de pánico activado",
  unknownIssue: "Problema desconocido",
  weatherDelay: "Retraso por clima",
  customsDelay: "Retraso en aduanas",
  fuelShortage: "Escasez de combustible",
  checkpointIssue: "Problema en punto de control",
  deviceFailure: "Falla de dispositivo",
  abnormalActivity: "Actividad anormal"
};

const INCIDENT_TYPES_ES = {
  mechanical: "Mecánico",
  route: "Ruta",
  cargo: "Carga",
  driver: "Conductor",
  security: "Seguridad",
  other: "Otro"
};

const INCIDENT_STATUSES_ES = {
  open: "Abierto",
  inRevision: "En revisión",
  closed: "Cerrado",
  discarded: "Descartado"
};

const INCIDENT_PRIORITIES_ES = {
  low: "Baja",
  medium: "Media",
  high: "Alta"
};

// 📌 Función para traducir
function translateIncident(field, value) {
  switch (field) {
    case "code": return INCIDENT_CODES_ES[value] || value;
    case "type": return INCIDENT_TYPES_ES[value] || value;
    case "status": return INCIDENT_STATUSES_ES[value] || value;
    case "priority": return INCIDENT_PRIORITIES_ES[value] || value;
    default: return value || "N/A";
  }
}



export async function init() {
  modalAddIncident = document.getElementById("modalAddIncident");
  modalViewIncident = document.getElementById("modalViewIncident");
  modalEditIncident = document.getElementById("modalEditIncident");
  tbody = document.querySelector("#incidentsTable tbody");

  document.getElementById("btnAddIncident").onclick = () => openModal(modalAddIncident);

  // Vincular formulario
  document.getElementById("formAddIncident").onsubmit = async (e) => {
    e.preventDefault();
    await registrarIncidente();

  document.querySelectorAll(".btn-secondary").forEach(btn => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal");
    if (modal) closeModal(modal);
  });
});

  };

  populateFilters(); // llenar selects de filtros

  await loadTrips();
  await loadIncidents();
  setupSorting();
}

// ---- Poblar Filtros ----
function populateFilters() {
  fillSelect("filterCode", INCIDENT_CODES, "Incidente (todos)", "code");
  fillSelect("filterType", INCIDENT_TYPES, "Tipo (todos)", "type");
  fillSelect("filterStatus", INCIDENT_STATUSES, "Estado (todos)", "status");
  fillSelect("filterPriority", INCIDENT_PRIORITIES, "Prioridad (todas)", "priority");
  fillSelect("incidentCode", INCIDENT_CODES, "Selecciona un código", "code");
}

function fillSelect(selectId, options, defaultText, field) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">${defaultText}</option>` +
    options.map(o => `<option value="${o}">${translateIncident(field, o)}</option>`).join("");
}

// Cargar viajes activos en combobox
async function loadTrips() {
  const trips = await AxoMotorWebAPI.getAllTrips();
  const tripSelect = document.getElementById("tripSelect");
  tripSelect.innerHTML = trips.map(t => `<option value="${t.tripId}">${t.details || t.tripId}</option>`).join("");
}
// 📌 Modificación en loadIncidents
async function loadIncidents() {
  tbody.innerHTML = "";
  const incidents = await AxoMotorWebAPI.getAllIncidents();

  incidents.forEach(i => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${translateIncident("code", i.code)}</td>
      <td>${translateIncident("type", i.type)}</td>
      <td>${translateIncident("priority", i.priority)}</td>
      <td>${translateIncident("status", i.status)}</td>
      <td>${i.registeredBy?.fullName || "N/A"}</td>
      <td>${formatDate(i.registrationDate)}</td>
      <td>${formatDate(i.revisionDate)}</td>
      <td>
        <button class="btn-small btn-view"><i class="fas fa-eye"></i></button>
        <button class="btn-small btn-edit"><i class="fas fa-edit"></i></button>
        <button class="btn-small btn-delete"><i class="fas fa-trash-alt"></i></button>
      </td>
    `;

    tr.querySelector(".btn-view").onclick = () => viewIncident(i);
    tr.querySelector(".btn-edit").onclick = () => editIncident(i);
    tr.querySelector(".btn-delete").onclick = async () => {
      if (confirm("¿Eliminar incidente?")) {
        await AxoMotorWebAPI.deleteIncident(i.incidentId);
        await loadIncidents();
      }
    };

    tbody.appendChild(tr);
  });
}

// 📌 También actualizar la vista de detalles
async function viewIncident(incident) {
  const fullIncident = await AxoMotorWebAPI.getIncidentById(incident.incidentId);
  const details = document.getElementById("incidentDetails");

  details.innerHTML = `
    <li><strong>Incidente:</strong> ${translateIncident("code", fullIncident.code)}</li>
    <li><strong>Tipo:</strong> ${translateIncident("type", fullIncident.type)}</li>
    <li><strong>Prioridad:</strong> ${translateIncident("priority", fullIncident.priority)}</li>
    <li><strong>Estado:</strong> ${translateIncident("status", fullIncident.status)}</li>
    <li><strong>Viaje:</strong> ${fullIncident.tripId}</li>
    <li><strong>Descripción:</strong> ${fullIncident.description}</li>
    <li><strong>Comentarios:</strong> ${fullIncident.comments || "N/A"}</li>
    <li><strong>Registrado por:</strong> ${fullIncident.registeredBy?.fullName || "N/A"}</li>
    <li><strong>Fecha de registro:</strong> ${formatDate(fullIncident.registrationDate)}</li>
    <li><strong>Última revisión:</strong> ${formatDate(fullIncident.revisionDate)}</li>
    <li><strong>Revisado por:</strong> ${fullIncident.revisedBy?.fullName || "N/A"}</li>
    <li><strong>Cerrado por:</strong> ${fullIncident.closedBy?.fullName || "N/A"}</li>
  `;
  openModal(modalViewIncident);
}

// Registrar incidente
async function registrarIncidente() {
  const tripId = document.getElementById('tripSelect').value;
  const code = document.getElementById('incidentCode').value;
  const description = document.getElementById('incidentDescription').value;
  const relatedIncidentId = document.getElementById('relatedIncident').value || null;

  const pictures = []; // luego puedes implementar carga de imágenes

  try {
    await AxoMotorWebAPI.createIncident({
      tripId,
      code,
      description,
      relatedIncidentId,
      pictures
    });

    alert('<i class="fas fa-check-circle"></i> Incidente registrado correctamente');
    closeModal(modalAddIncident);
    await loadIncidents();
  } catch (error) {
    alert('<i class="fas fa-times-circle"></i> Error al registrar incidente: ' + error.message);
  }
}

// Editar incidente
function editIncident(incident) {
  document.getElementById("editStatus").value = incident.status;
  document.getElementById("editPriority").value = incident.priority;
  document.getElementById("editComments").value = incident.comments || "";

  document.getElementById("formEditIncident").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await AxoMotorWebAPI.updateIncident(incident.incidentId, {
        status: document.getElementById("editStatus").value,
        priority: document.getElementById("editPriority").value,
        comments: document.getElementById("editComments").value,
        picturesToAdd: [],
        picturesToDelete: []
      });

      alert('<i class="fas fa-check-circle"></i> Incidente actualizado');
      closeModal(modalEditIncident);
      await loadIncidents();
    } catch (err) {
      alert('<i class="fas fa-times-circle"></i> Error actualizando incidente: ' + err.message);
    }
  };

  openModal(modalEditIncident);
}

// Ordenar tabla
function setupSorting() {
  document.querySelectorAll("#incidentsTable thead th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.sort((a, b) => a.cells[th.cellIndex].innerText.localeCompare(b.cells[th.cellIndex].innerText));
      tbody.innerHTML = "";
      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

// Helpers
function openModal(modal) { modal.classList.remove("hidden"); }
function closeModal(modal) { modal.classList.add("hidden"); }
function formatDate(date) { return date ? new Date(date).toLocaleString() : "N/A"; }