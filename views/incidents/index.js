import AxoMotorWebAPI from '/services/axomotor.js';

let incidents = [];
let uploadedPhotos = [];

const incidentCodes = [
  "engineFailure",
  "flatTire",
  "brakeIssues",
  "overheating",
  "batteryFailure",
  "oilLeak",
  "fuelLeak",
  "steeringFailure",
  "transmissionIssue",
  "accident",
  "trafficJam",
  "roadBlocked",
  "routeDeviation",
  "gpsSignalLost",
  "unauthorizedStop",
  "delayedDelivery",
  "wrongDelivery",
  "loadShifted",
  "packageDamaged",
  "driverReportedSickness",
  "driverError",
  "driverViolation",
  "driverUnavailable",
  "fatigueReported",
  "unusualBehavior",
  "theftAttempt",
  "cargoTheft",
  "vehicleStolen",
  "tamperingDetected",
  "panicButtonActivated",
  "unknownIssue",
  "weatherDelay",
  "customsDelay",
  "fuelShortage",
  "checkpointIssue",
  "deviceFailure",
  "abnormalActivity"
];

export async function initIncidents() {
  await loadIncidents();
  setupEventListeners();
}

async function loadIncidents() {
  try {
    incidents = await AxoMotorWebAPI.getAllIncidents();
    const tbody = document.querySelector('#incidentsTable tbody');
    tbody.innerHTML = '';

    incidents.forEach(inc => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${inc.code}</td>
        <td>${inc.type}</td>
        <td>${inc.priority || 'N/A'}</td>
        <td>${inc.status}</td>
        <td>${inc.registeredBy?.fullName || 'N/A'}</td>
        <td>${new Date(inc.registrationDate).toLocaleString()}</td>
        <td>${new Date(inc.revisionDate).toLocaleString()}</td>
        <td>
          <button class="btn secondary view-btn" data-id="${inc.incidentId}">👁 Ver</button>
          <button class="btn primary edit-btn" data-id="${inc.incidentId}">✏ Editar</button>
          <button class="btn danger delete-btn" data-id="${inc.incidentId}">🗑 Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    addRowEventListeners();
  } catch (err) {
    console.error('Error cargando incidentes:', err);
  }
}

function setupEventListeners() {
  document.getElementById('btnAddIncident').addEventListener('click', openIncidentModal);
  document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeAllModals));
  document.getElementById('incidentForm').addEventListener('submit', handleIncidentFormSubmit);
  document.getElementById('photoUpload').addEventListener('change', handlePhotoUpload);
}

async function openIncidentModal() {
  document.getElementById('modalTitle').textContent = 'Registrar Incidencia';

  // Limpiar form
  document.getElementById('incidentForm').reset();
  uploadedPhotos = [];
  document.getElementById('photoPreview').innerHTML = '';

  // Cargar viajes
  const tripSelect = document.getElementById('tripSelect');
  tripSelect.innerHTML = '<option value="">Cargando viajes...</option>';
  try {
    const trips = await AxoMotorWebAPI.getAllTrips();
    tripSelect.innerHTML = '<option value="">Seleccione un viaje</option>';
    trips.forEach(trip => {
      const option = document.createElement('option');
      option.value = trip.id;
      option.textContent = trip.details;
      tripSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando viajes para incidentes:", error);
    tripSelect.innerHTML = '<option disabled>Error cargando viajes</option>';
  }

  // Cargar incident codes
  const codeSelect = document.getElementById('incidentCodeSelect');
  codeSelect.innerHTML = '<option value="">Seleccione un incidente</option>';
  incidentCodes.forEach(code => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    codeSelect.appendChild(option);
  });

  // Cargar incidentes relacionados
  const relatedSelect = document.getElementById('relatedIncidentSelect');
  relatedSelect.innerHTML = '<option value="">Ninguno</option>';
  incidents.forEach(inc => {
    const option = document.createElement('option');
    option.value = inc.incidentId;
    option.textContent = `${inc.code} (${inc.incidentId})`;
    relatedSelect.appendChild(option);
  });

  openModal('incidentModal');
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
}

async function handleIncidentFormSubmit(e) {
  e.preventDefault();

  const tripId = document.getElementById('tripSelect').value;
  const code = document.getElementById('incidentCodeSelect').value;
  const description = document.getElementById('description').value.trim();
  const relatedIncidentId = document.getElementById('relatedIncidentSelect').value || null;

  if (!tripId) {
    alert('Debe seleccionar un viaje');
    return;
  }
  if (!code) {
    alert('Debe seleccionar un código de incidente');
    return;
  }

  // Fotos (no subida real aún)
  const pictures = uploadedPhotos.map(photo => ({
    fileId: photo.fileId || 'fake-file-id',
    timestamp: new Date().toISOString()
  }));

  const newIncident = {
    tripId,
    code,
    description,
    relatedIncidentId,
    pictures
  };

  try {
    await AxoMotorWebAPI.createIncident(newIncident);
    alert('Incidente registrado correctamente');
    closeAllModals();
    await loadIncidents();
  } catch (error) {
    console.error('Error registrando incidente:', error);
    alert('Error registrando incidente');
  }
}

function handlePhotoUpload(e) {
  const files = Array.from(e.target.files);
  const previewContainer = document.getElementById('photoPreview');
  previewContainer.innerHTML = '';
  uploadedPhotos = [];

  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement('img');
      img.src = ev.target.result;
      previewContainer.appendChild(img);

      uploadedPhotos.push(file);
    };
    reader.readAsDataURL(file);
  });
}

function addRowEventListeners() {
  document.querySelectorAll('.view-btn').forEach(btn =>
    btn.addEventListener('click', e => viewIncident(e.target.dataset.id))
  );
  document.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', e => editIncident(e.target.dataset.id))
  );
  document.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', e => deleteIncident(e.target.dataset.id))
  );
}

async function viewIncident(id) {
  try {
    const incident = await AxoMotorWebAPI.getIncidentById(id);
    document.getElementById('incidentDetailsInfo').innerHTML = `
      <p><strong>Incidente:</strong> ${incident.code}</p>
      <p><strong>Tipo:</strong> ${incident.type || 'N/A'}</p>
      <p><strong>Prioridad:</strong> ${incident.priority || 'N/A'}</p>
      <p><strong>Estado:</strong> ${incident.status || 'N/A'}</p>
      <p><strong>Descripción:</strong> ${incident.description || 'N/A'}</p>
      <p><strong>Comentarios:</strong> ${incident.comments || 'N/A'}</p>
      <p><strong>Registrado por:</strong> ${incident.registeredBy?.fullName || 'N/A'}</p>
      <p><strong>Fecha Registro:</strong> ${new Date(incident.registrationDate).toLocaleString()}</p>
    `;
    openModal('incidentDetailsModal');
  } catch (error) {
    console.error('Error obteniendo detalles:', error);
    alert('Error al obtener detalles del incidente');
  }
}

async function editIncident(id) {
  alert('Funcionalidad de editar aún no implementada');
}

async function deleteIncident(id) {
  if (confirm('¿Seguro que quieres eliminar este incidente?')) {
    try {
      await AxoMotorWebAPI.deleteIncident(id);
      await loadIncidents();
    } catch (err) {
      alert('Error eliminando incidente.');
      console.error(err);
    }
  }
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

// Al cargar la página inicializa
initIncidents();
