// views/trips/trips.js
import AxoMotorWebAPI from '/services/axomotor.js';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import LineString from 'ol/geom/LineString';
import Stroke from 'ol/style/Stroke';
import { boundingExtent } from 'ol/extent';

let trips = [];
let selectedTrip = null;
let map = null;
let vectorLayer = null;
let editingTripId = null;
let stops = []; // almacenará las paradas temporales


    export async function init(extraData, dataStore) {
        console.log('Inicializando página de viajes...');
        try {
            const response = await AxoMotorWebAPI.getAllTrips();
            trips = Array.isArray(response) ? response.map(t => ({
                id: t.tripId,
                conductor: t.driver?.fullName || "Sin asignar",
                vehiculo: t.vehicle?.details || "Sin vehículo",
                estado: t.status,
                origen: t.origin?.name || "N/A",
                destino: t.destination?.name || "N/A",
                inicio: t.origin?.dateTime?.replace("T", " ").slice(0, 16) || "N/A",
                fin: t.destination?.dateTime?.replace("T", " ").slice(0, 16) || "N/A",
                origin: t.origin,
                destination: t.destination,
                plannedStops: t.plannedStops
            })) : [];
            renderTrips();
        } catch (error) {
            console.error(error);
            alert("No se pudieron cargar los viajes desde la API");
        }

        setupEventHandlers();
        initMap();
        renderAllTripsOnMap(trips);
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
            <td>${t.vehiculo}</td>
            <td>${t.estado}</td>
            <td>
                <button class="infoBtn btn secondary" data-id="${t.id}" title="Información">
                <i class="fas fa-info-circle"></i>
                </button>
                <button class="editBtn btn primary" data-id="${t.id}" title="Editar">
                <i class="fas fa-edit"></i>
                </button>
                <button class="deleteBtn btn danger" data-id="${t.id}" title="Eliminar">
                <i class="fas fa-trash-alt"></i>
                </button>
            </td>
            `;
            tbody.appendChild(row);
        });

        attachRowEvents();
        }



        function setupEventHandlers() {
            // Botón cerrar modal de info
            const closeInfoTrip = document.getElementById("closeInfoTrip");
            if (closeInfoTrip) {
                closeInfoTrip.onclick = () => toggleModal("modalTripInfo", false);
            }

            // Botón "Nuevo Viaje"
            const btnNewTrip = document.getElementById("btnNewTrip");
            if (btnNewTrip) {
                btnNewTrip.onclick = async () => {
                    toggleModal("modalCreateTrip", true);

                    await fillSelect(document.getElementById("driverId"), AxoMotorWebAPI.getAllDrivers2, "fullName", "id");
                    await fillSelect(document.getElementById("vehicleId"), AxoMotorWebAPI.getAllVehicles2, "details", "id");
                    await fillSelect(document.getElementById("originLocation"), AxoMotorWebAPI.getKnownLocations2, "details", "id");
                    await fillSelect(document.getElementById("destinationLocation"), AxoMotorWebAPI.getKnownLocations2, "details", "id");
                };
            }

            // Botón agregar parada
            document.getElementById("btnAddStop").addEventListener("click", async () => {
            const stopId = parseInt(document.getElementById("stopLocation").value);
            const stopDateTimeInput = document.getElementById("stopDateTime").value;

            if (!stopId) {
                alert("Selecciona un lugar para la parada");
                return;
            }
            if (!stopDateTimeInput) {
                alert("Selecciona fecha y hora para la parada");
                return;
            }

            // Obtener info del lugar por id
            let allLocations = await AxoMotorWebAPI.getKnownLocations2();
            if (allLocations && typeof allLocations === "object" && !Array.isArray(allLocations)) {
                if (Array.isArray(allLocations.result)) {
                allLocations = allLocations.result;
                }
            }
            const stopLocation = allLocations.find(loc => loc.id === stopId);
            if (!stopLocation) {
                alert("Lugar no encontrado");
                return;
            }

            const newStop = {
                latitude: stopLocation.latitude,
                longitude: stopLocation.longitude,
                name: stopLocation.name,
                address: stopLocation.address,
                ratio: stopLocation.ratio,
                dateTime: new Date(stopDateTimeInput).toISOString()
            };

            stops.push(newStop);
            renderStops();

            // Opcional: limpiar selector y fecha
            document.getElementById("stopDateTime").value = "";
            });


            // Formulario de creación de viaje
            const createTripForm = document.getElementById("createTripForm");
            if (createTripForm) {
                createTripForm.onsubmit = async (e) => {
                    e.preventDefault();
                    try {
                        const driverId = parseInt(document.getElementById("driverId").value);
                        const vehicleId = parseInt(document.getElementById("vehicleId").value);
                        const originId = parseInt(document.getElementById("originLocation").value);
                        const destinationId = parseInt(document.getElementById("destinationLocation").value);
                        const knownLocations = await AxoMotorWebAPI.getKnownLocations2();

                        const originLocation = knownLocations.find(loc => loc.id === originId);
                        const destinationLocation = knownLocations.find(loc => loc.id === destinationId);

                        if (!originLocation || !destinationLocation) {
                            alert("Debes seleccionar origen y destino válidos.");
                            return;
                        }

                        const origin = {
                            latitude: originLocation.latitude,
                            longitude: originLocation.longitude,
                            name: originLocation.name,
                            address: originLocation.address,
                            ratio: originLocation.ratio,
                            dateTime: new Date(document.getElementById("originDateTime").value).toISOString()
                        };

                        const destination = {
                            latitude: destinationLocation.latitude,
                            longitude: destinationLocation.longitude,
                            name: destinationLocation.name,
                            address: destinationLocation.address,
                            ratio: destinationLocation.ratio,
                            dateTime: new Date(document.getElementById("destinationDateTime").value).toISOString()
                        };

                        const newTrip = { driverId, vehicleId, origin, destination, plannedStops: stops };

                        console.log("Enviando nuevo viaje:", newTrip);
                        await AxoMotorWebAPI.createTrip(newTrip);

                        alert("Viaje creado con éxito");
                        toggleModal("modalCreateTrip", false);
                        init(); // refrescar la tabla
                    } catch (error) {
                        console.error("Error creando viaje:", error);
                        alert("No se pudo crear el viaje");
                    }
                };
            }

            // Cancelar modal de crear viaje
            const cancelCreateTrip = document.getElementById("cancelCreateTrip");
            if (cancelCreateTrip) cancelCreateTrip.onclick = () => toggleModal("modalCreateTrip", false);
            const closeCreateTrip = document.getElementById("closeCreateTrip");
            if (closeCreateTrip) closeCreateTrip.onclick = () => toggleModal("modalCreateTrip", false);

            // Botones de la tabla
            attachRowEvents();
        }

    

    function attachRowEvents() {
        document.querySelectorAll(".infoBtn").forEach(btn => 
            btn.onclick = () => showInfo(btn.dataset.id)
        );
        document.querySelectorAll(".editBtn").forEach(btn => 
            btn.onclick = () => editTrip(btn.dataset.id)
        );
        document.querySelectorAll(".deleteBtn").forEach(btn => 
            btn.onclick = () => deleteTrip(btn.dataset.id)
        );
            }

            document.getElementById("btnFullscreenMap").addEventListener("click", () => {
            const mapContainer = document.querySelector(".map-container");
            mapContainer.classList.toggle("map-fullscreen");
            map.updateSize(); // importante para que OpenLayers redibuje
            });


    

    async function showInfo(id) {
        try {
            const response = await AxoMotorWebAPI.getTripById(id);
            selectedTrip = response;

            if (selectedTrip?.tripId) {
                const container = document.getElementById("tripDetails");
                container.innerHTML = `
                    <p><b>Conductor:</b> ${selectedTrip.driver?.fullName || "N/A"}</p>
                    <p><b>Vehículo:</b> ${selectedTrip.vehicle?.details || "N/A"}</p>
                    <p><b>Estado:</b> ${selectedTrip.status}</p>
                    <p><b>Origen:</b> ${selectedTrip.origin?.name} (${selectedTrip.origin?.address})</p>
                    <p><b>Destino:</b> ${selectedTrip.destination?.name} (${selectedTrip.destination?.address})</p>
                    <p><b>Inicio:</b> ${selectedTrip.origin?.dateTime?.replace("T", " ").slice(0, 16)}</p>
                    <p><b>Fin:</b> ${selectedTrip.destination?.dateTime?.replace("T", " ").slice(0, 16)}</p>
                `;

                // Renderizar paradas
                const stopsTbody = document.getElementById("stopsTableBody");
                stopsTbody.innerHTML = "";
                if (Array.isArray(selectedTrip.plannedStops) && selectedTrip.plannedStops.length > 0) {
                    selectedTrip.plannedStops.forEach(stop => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${stop.name}</td>
                            <td>${stop.address}</td>
                            <td>${stop.dateTime?.replace("T", " ").slice(0, 16)}</td>
                        `;
                        stopsTbody.appendChild(row);
                    });
                } else {
                    stopsTbody.innerHTML = `<tr><td colspan="3">Sin paradas planificadas</td></tr>`;
                }

                // Mostrar en el mapa
                updateMap(selectedTrip);

                toggleModal("modalTripInfo", true);
            } else {
                alert("No se encontró información del viaje");
            }
        } catch (error) {
            console.error(error);
            alert("No se pudieron cargar los detalles del viaje");
        }
    }

        
    async function editTrip(id) {
        try {
            const trip = await AxoMotorWebAPI.getTripById(id);
            if (!trip) {
            alert("No se encontró el viaje para editar");
            return;
            }

            editingTripId = id;

            // Setear el valor actual en el select
            document.getElementById("tripStatus").value = trip.status || "planned";

            toggleModal("modalEditTrip", true);
        } catch (error) {
            console.error(error);
            alert("Error al cargar datos del viaje");
        }
    }

    // Eventos del modal de edición
    document.getElementById("editTripForm").onsubmit = async (e) => {
        e.preventDefault();
        if (!editingTripId) return;

        const newStatus = document.getElementById("tripStatus").value;

        try {
            await AxoMotorWebAPI.updateTrip(editingTripId, { status: newStatus });
            alert("Estado del viaje actualizado con éxito");
            toggleModal("modalEditTrip", false);
            init(); // recargar tabla
        } catch (error) {
            console.error(error);
            alert("Error al actualizar el estado del viaje");
        }
    };

    

    document.getElementById("cancelEditTrip").onclick = () => {
    toggleModal("modalEditTrip", false);
    };

    document.getElementById("closeEditTrip").onclick = () => {
    toggleModal("modalEditTrip", false);
    };

    async function deleteTrip(id) {
    if (!confirm("¿Seguro que deseas eliminar este viaje?")) return;

    try {
        await AxoMotorWebAPI.deleteTrip(id);
        alert("Viaje eliminado con éxito");
        init(); // recargar la tabla
    } catch (error) {
        console.error(error);
        alert("Error al eliminar el viaje");
    }
    }


        function initMap() {
            map = new Map({
                target: 'map',
                layers: [
                    new TileLayer({ source: new OSM() })
                ],
                view: new View({
                    center: [-116.8253, 32.4613], // coords aproximadas
                    zoom: 13,
                    projection: 'EPSG:4326'
                })
            });

            vectorLayer = new VectorLayer({
                source: new VectorSource()
            });

            map.addLayer(vectorLayer);
        }

            async function updateMap(trip) {
        const source = new VectorSource();

        // Construimos lista de puntos: origen + paradas + destino
        const points = [];
        if (trip.origin) points.push(trip.origin);
        if (Array.isArray(trip.plannedStops)) points.push(...trip.plannedStops);
        if (trip.destination) points.push(trip.destination);

        // Marcadores
        function createMarker(lon, lat, iconUrl) {
            const feature = new Feature({
                geometry: new Point([lon, lat])
            });
            feature.setStyle(new Style({
                image: new Icon({
                    src: iconUrl,
                    scale: 0.05
                })
            }));
            return feature;
        }

        points.forEach((p, idx) => {
            let icon = '/assets/stop.svg';
            if (idx === 0) icon = '/assets/origin.svg';
            else if (idx === points.length - 1) icon = '/assets/destination.svg';
            source.addFeature(createMarker(p.longitude, p.latitude, icon));
        });

        // Ruta con OSRM
        const routeCoords = await fetchRoute(points);
        if (routeCoords.length > 0) {
            const lineFeature = new Feature({
                geometry: new LineString(routeCoords)
            });
            lineFeature.setStyle(new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 4
                })
            }));
            source.addFeature(lineFeature);

            // Centrar mapa en la ruta
            map.getView().fit(lineFeature.getGeometry().getExtent(), {
                padding: [50, 50, 50, 50],
                maxZoom: 15
            });
        }

        vectorLayer.setSource(source);
    }

            

            function toggleModal(id, show) {
                document.getElementById(id).classList.toggle("hidden", !show);
            }

    
            
    async function renderAllTripsOnMap() {
    const source = new VectorSource();

    await Promise.all(trips.map(async (trip) => {
        const points = [];
        if (trip.origin) points.push(trip.origin);
        if (Array.isArray(trip.plannedStops)) points.push(...trip.plannedStops);
        if (trip.destination) points.push(trip.destination);

        const routeCoords = await fetchRoute(points);
        if (routeCoords.length > 0) {
            const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
            const lineFeature = new Feature({
                geometry: new LineString(routeCoords)
            });
            lineFeature.setStyle(new Style({
                stroke: new Stroke({ color, width: 3 })
            }));
            source.addFeature(lineFeature);
        }
    }));

    vectorLayer.setSource(source);
}


    
    // Botón "Nuevo Viaje"
        document.getElementById("btnNewTrip").onclick = async () => {
        toggleModal("modalCreateTrip", true);

        await fillSelect(
        document.getElementById("driverId"),
        AxoMotorWebAPI.getAllDrivers2,
        "fullName", // texto mostrado
        "id"        // valor del option
        );

        await fillSelect(
            document.getElementById("vehicleId"),
            AxoMotorWebAPI.getAllVehicles2,
            "details", // texto mostrado
            "id"       // valor del option
        );
        await fillSelect(
        document.getElementById("originLocation"),
        AxoMotorWebAPI.getKnownLocations2,
        "details",
        "id"
            );

            await fillSelect(
            document.getElementById("destinationLocation"),
            AxoMotorWebAPI.getKnownLocations2,
            "details",
            "id"
            );
            await loadStopLocationsSelect();
        };

        async function loadStopLocationsSelect() {
        let allLocations = await AxoMotorWebAPI.getKnownLocations2();

        // Si es objeto con .result
        if (allLocations && typeof allLocations === "object" && !Array.isArray(allLocations)) {
            if (Array.isArray(allLocations.result)) {
            allLocations = allLocations.result;
            }
        }

        const originId = parseInt(document.getElementById("originLocation").value);
        const destinationId = parseInt(document.getElementById("destinationLocation").value);

        // Filtrar quitando origen y destino
        const filteredLocations = allLocations.filter(loc => loc.id !== originId && loc.id !== destinationId);

        const stopSelect = document.getElementById("stopLocation");
        stopSelect.innerHTML = filteredLocations.map(loc => `<option value="${loc.id}">${loc.details}</option>`).join('');
        }


        document.getElementById("originLocation").addEventListener("change", loadStopLocationsSelect);
        document.getElementById("destinationLocation").addEventListener("change", loadStopLocationsSelect);




        async function fillSelect(selectElement, fetchFunction, textProp, valueProp) {
         try {
        let data = await fetchFunction();

        // Si data es objeto y tiene result, usarlo
        if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (Array.isArray(data.result)) {
            data = data.result;
        }
        }

        if (!Array.isArray(data)) {
        console.warn("fillSelect esperaba un array, recibió:", data);
        selectElement.innerHTML = `<option disabled>No disponible</option>`;
        return;
        }

        selectElement.innerHTML = data.map(item => 
        `<option value="${item[valueProp]}">${item[textProp]}</option>`
        ).join('');
        } catch (error) {
            console.error("Error cargando opciones:", error);
            selectElement.innerHTML = `<option disabled>Error cargando</option>`;
        }
        }


    /*
    // Agregar paradas
    document.getElementById("btnAddStop").addEventListener("click", () => {
    const stopName = prompt("Nombre de la parada:");
    const stopAddress = prompt("Dirección:");
    const stopDateTime = prompt("Fecha y hora (YYYY-MM-DD HH:mm):");

    if (!stopName || !stopAddress || !stopDateTime) return;

    const newStop = {
        latitude: 0,
        longitude: 0,
        name: stopName,
        address: stopAddress,
        ratio: 1000,
        dateTime: new Date(stopDateTime).toISOString()
    };

    stops.push(newStop);
    renderStops();
    });*/

    function renderStops() {
    const tbody = document.getElementById("plannedStopsBody");
    tbody.innerHTML = "";
    stops.forEach((stop, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${stop.name}</td>
        <td>${stop.address}</td>
        <td>${stop.dateTime.replace("T", " ").slice(0,16)}</td>
        <td><button type="button" class="btn danger" onclick="removeStop(${idx})">🗑️</button></td>
        `;
        tbody.appendChild(row);
    });
    }

    window.removeStop = (idx) => {
    stops.splice(idx, 1);
    renderStops();
    };

    // Crear viaje
    document.getElementById("createTripForm").onsubmit = async (e) => {
    e.preventDefault();

    try {
        const driverId = parseInt(document.getElementById("driverId").value);
        const vehicleId = parseInt(document.getElementById("vehicleId").value);

        const originId = parseInt(document.getElementById("originLocation").value);
        const destinationId = parseInt(document.getElementById("destinationLocation").value);

        // Obtener la lista de lugares
        const knownLocations = await AxoMotorWebAPI.getKnownLocations2();

        const originLocation = knownLocations.find(loc => loc.id === originId);
        const destinationLocation = knownLocations.find(loc => loc.id === destinationId);

        if (!originLocation || !destinationLocation) {
        alert("Debes seleccionar origen y destino válidos.");
        return;
        }

        const origin = {
        latitude: originLocation.latitude,
        longitude: originLocation.longitude,
        name: originLocation.name,
        address: originLocation.address,
        ratio: originLocation.ratio,
        dateTime: new Date(document.getElementById("originDateTime").value).toISOString()
        };

        const destination = {
        latitude: destinationLocation.latitude,
        longitude: destinationLocation.longitude,
        name: destinationLocation.name,
        address: destinationLocation.address,
        ratio: destinationLocation.ratio,
        dateTime: new Date(document.getElementById("destinationDateTime").value).toISOString()
        };

        const newTrip = {
        driverId,
        vehicleId,
        origin,
        destination,
        plannedStops: stops
        };

        console.log("Enviando nuevo viaje:", newTrip);

        await AxoMotorWebAPI.createTrip(newTrip);

        alert("Viaje creado con éxito");
        toggleModal("modalCreateTrip", false);
        init(); // recargar tabla
    } catch (error) {
        console.error("Error creando viaje:", error);
        alert("No se pudo crear el viaje");
    }
    };

    // Abrir modal para registrar lugar
    document.getElementById("btnNewLocation").onclick = () => {
    toggleModal("modalNewLocation", true);
    };

    // Cerrar modal
    document.getElementById("closeNewLocation").onclick = () => toggleModal("modalNewLocation", false);
    document.getElementById("cancelNewLocation").onclick = () => toggleModal("modalNewLocation", false);

    // Enviar nuevo lugar
    document.getElementById("newLocationForm").onsubmit = async (e) => {
    e.preventDefault();

    const newLocation = {
        name: document.getElementById("locationName").value.trim(),
        address: document.getElementById("locationAddress").value.trim(),
        longitude: parseFloat(document.getElementById("locationLongitude").value),
        latitude: parseFloat(document.getElementById("locationLatitude").value),
        ratio: parseFloat(document.getElementById("locationRatio").value)
    };

    // Validaciones simples
    if(newLocation.longitude < -180 || newLocation.longitude > 180) {
    alert("La longitud debe estar entre -180 y 180");
    return;
    }
    if(newLocation.latitude < -90 || newLocation.latitude > 90) {
    alert("La latitud debe estar entre -90 y 90");
    return;
    }
    if(newLocation.ratio <= 0 || newLocation.ratio > 1) {
    alert("El ratio debe estar entre 0 (exclusivo) y 1");
    return;
    }


    try {
        console.log("Nuevo lugar a enviar:", newLocation);
        await AxoMotorWebAPI.createKnownLocation(newLocation);
        alert("Lugar registrado con éxito");

        toggleModal("modalNewLocation", false);

        // Recargar selects de origen y destino
        await fillSelect(
        document.getElementById("originLocation"),
        AxoMotorWebAPI.getKnownLocations2,
        "details",
        "id"
        );
        await fillSelect(
        document.getElementById("destinationLocation"),
        AxoMotorWebAPI.getKnownLocations2,
        "details",
        "id"
        );
    } catch (error) {
        console.error("Error registrando lugar:", error);
        alert("No se pudo registrar el lugar");
    }
    };

    async function fetchRoute(points) {
        try {
            // Construimos la query con todos los puntos encadenados
            const coords = points.map(p => `${p.longitude},${p.latitude}`).join(';');

            const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
            console.log("Consultando OSRM:", url);

            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                return data.routes[0].geometry.coordinates; // devuelve el arreglo de coordenadas
            } else {
                console.error("No se pudo calcular la ruta", data);
                return [];
            }
        } catch (err) {
            console.error("Error obteniendo ruta desde OSRM:", err);
            return [];
        }
    }



    // Botones cancelar modal
    document.getElementById("closeCreateTrip").onclick = () => toggleModal("modalCreateTrip", false);
    document.getElementById("cancelCreateTrip").onclick = () => toggleModal("modalCreateTrip", false);


    export function cleanUp() {
    console.log('Finalizando página de viajes');
}
