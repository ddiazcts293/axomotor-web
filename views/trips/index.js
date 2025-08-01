import './style.css';
import GeoJSON from 'ol/format/GeoJSON';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Link from 'ol/interaction/Link';
import {Style, Stroke} from 'ol/style';

let trips = [];
let selectedTrip = null;
let map = null;

export function init(extraData, dataStore) {
    console.log('Inicializando página de viajes...');

    // Inicializar mapa
    map = new Map({
        target: 'map',
        layers: [
            new TileLayer({ source: new OSM() }),
        ],
        view: new View({
            center: [0, 0],
            zoom: 2
        })
    });

    map.addLayer(
        new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: './data/route.json',
            }),
            style: new Style({
                stroke: new Stroke({ color: 'red', width: 4 })
            })
        })
    );

    map.addInteraction(new Link());

    // Datos iniciales de prueba
    trips = [
        { id: 1, origen: "CDMX", destino: "Guadalajara", conductor: "Juan Pérez", estado: "Planeado" }
    ];

    renderTrips();
    setupEventHandlers();
}

export function cleanUp() {
    console.log('Finalizando página de viajes');
    if (map) {
        map.setTarget(null);
        map = null;
    }
}

function renderTrips() {
    const tbody = document.getElementById("tripsTableBody");
    tbody.innerHTML = "";
    trips.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.origen}</td>
            <td>${t.destino}</td>
            <td>${t.conductor}</td>
            <td>${t.estado}</td>
            <td>
                <button class="infoTripBtn" data-id="${t.id}">ℹ️</button>
                <button class="editTripBtn" data-id="${t.id}">✏️</button>
                <button class="deleteTripBtn" data-id="${t.id}">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    attachRowEvents();
}

function setupEventHandlers() {
    document.getElementById("btnAddTrip").onclick = () => toggleModal("modalAddTrip", true);
    document.getElementById("cancelAddTrip").onclick = () => toggleModal("modalAddTrip", false);
    document.getElementById("cancelEditTrip").onclick = () => toggleModal("modalEditTrip", false);
    document.getElementById("closeInfoTrip").onclick = () => toggleModal("modalInfoTrip", false);
    document.getElementById("cancelAddPlace").onclick = () => toggleModal("modalAddPlace", false);
    document.getElementById("cancelDeleteTrip").onclick = () => toggleModal("modalDeleteTrip", false);

    document.getElementById("btnToggleMap").onclick = () => {
        document.getElementById("tripsTableContainer").classList.toggle("hidden");
    };
}

function attachRowEvents() {
    document.querySelectorAll(".infoTripBtn").forEach(btn => btn.onclick = () => showInfoTrip(btn.dataset.id));
    document.querySelectorAll(".editTripBtn").forEach(btn => btn.onclick = () => showEditTrip(btn.dataset.id));
    document.querySelectorAll(".deleteTripBtn").forEach(btn => btn.onclick = () => showDeleteTrip(btn.dataset.id));
}

function showInfoTrip(id) {
    selectedTrip = trips.find(t => t.id == id);
    const container = document.getElementById("tripDetails");
    container.innerHTML = `
        <p><b>Conductor:</b> ${selectedTrip.conductor}</p>
        <p><b>Vehículo:</b> Toyota Corolla</p>
        <p><b>Estado:</b> ${selectedTrip.estado}</p>
        <p><b>Origen:</b> ${selectedTrip.origen}</p>
        <p><b>Destino:</b> ${selectedTrip.destino}</p>
        <p><b>Distancia Recorrida:</b> 0 km (demo)</p>
    `;
    document.getElementById("tripStopsInfo").innerHTML = `<tr><td colspan="8">Sin paradas registradas</td></tr>`;
    toggleModal("modalInfoTrip", true);
}

function showEditTrip(id) {
    selectedTrip = trips.find(t => t.id == id);
    toggleModal("modalEditTrip", true);
}

function showDeleteTrip(id) {
    selectedTrip = trips.find(t => t.id == id);
    toggleModal("modalDeleteTrip", true);
    document.getElementById("confirmDeleteTrip").onclick = () => {
        trips = trips.filter(t => t.id !== selectedTrip.id);
        renderTrips();
        toggleModal("modalDeleteTrip", false);
    };
}

function toggleModal(id, show) {
    document.getElementById(id).classList.toggle("hidden", !show);
}
