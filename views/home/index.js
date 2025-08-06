let client;

// Umbrales de tu base de datos
const kpiThresholds = {
  OperativeVehiclesPercentage: { type: "Percent", thresholds: [90, 75, 50, 25, 0] },
  OnTimeTripsCompletedPercentage: { type: "Percent", thresholds: [90, 80, 70, 50, 30] },
  AverageTimeToResolveIncident: { type: "Range", thresholds: [10, 15, 30, 45, 60] },
  PanicButtonActivations: { type: "Value", thresholds: [0, 1, 3] },
  IncidentsReported: { type: "Range", thresholds: [0, 2, 4, 8, 16] },
  HarshDrivingEvents: { type: "Range", thresholds: [0, 4, 8, 16, 32] }
};

// Mapeo de estados a español
const statusTranslations = {
  optimal: "Óptimo",
  good: "Bueno",
  acceptable: "Aceptable",
  bad: "Malo",
  critical: "Crítico",
  notData: "Sin datos"
};

// Calcular estado según thresholds
function getStatus(kpiKey, value) {
  if (value === null || value === undefined) return "notData";

  const config = kpiThresholds[kpiKey];
  if (!config) return "notData";

  const t = config.thresholds;

  switch (config.type) {
    case "Percent":
      if (value >= t[0]) return "optimal";
      if (value >= t[1]) return "good";
      if (value >= t[2]) return "acceptable";
      if (value >= t[3]) return "bad";
      if (value >= t[4]) return "critical";
      return "critical";

    case "Range":
      if (value <= t[0]) return "optimal";
      if (value <= t[1]) return "good";
      if (value <= t[2]) return "acceptable";
      if (value <= t[3]) return "bad";
      if (value <= t[4]) return "critical";
      return "critical";

    case "Value":
      if (value <= t[0]) return "optimal";
      if (value <= t[1]) return "good";
      if (value <= t[2]) return "bad";
      return "critical";

    default:
      return "notData";
  }
}

// 📌 Inicializar vista Home
export async function init({ navigateTo }, dataStore) {
  console.log("📡 Conectando al broker MQTT...");

  client = mqtt.connect("wss://broker.emqx.io:8084/mqtt", {
    clientId: "Axomotor_" + Math.random().toString(16).substr(2, 8)
  });

  client.on("connect", () => {
    console.log("✅ Conectado al broker MQTT");

    // Suscripción al tópico de KPIs
    client.subscribe("axomotor/kpis", (err) => {
      if (!err) console.log("📩 Suscrito a axomotor/kpis");
      else console.error("❌ Error al suscribirse", err);
    });
  });

  client.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("📊 KPIs recibidos:", data);
      renderKPIs(data);
    } catch (e) {
      console.error("❌ Error parseando mensaje MQTT", e);
    }
  });

  client.on("error", (err) => {
    console.error("❌ Error de conexión MQTT:", err);
  });
}

// 📌 Renderizar todos los KPIs
function renderKPIs(data) {
  const operativeVal = data.operativeVehiclesPercentage.value;
  const operativeStatus = data.operativeVehiclesPercentage.status !== "notData"
    ? data.operativeVehiclesPercentage.status
    : getStatus("OperativeVehiclesPercentage", operativeVal);

  renderGauge("operativeVehicles",
    "Porcentaje de vehículos operativos",
    operativeVal,
    operativeStatus
  );

  const onTimeVal = data.onTimeTripsCompletedPercentage.value;
  const onTimeStatus = data.onTimeTripsCompletedPercentage.status !== "notData"
    ? data.onTimeTripsCompletedPercentage.status
    : getStatus("OnTimeTripsCompletedPercentage", onTimeVal);

  renderGauge("onTimeTrips",
    "Porcentaje de viajes completados a tiempo",
    onTimeVal,
    onTimeStatus
  );

  renderValue("avgIncidentResolution",
    "Tiempo promedio resolución incidencias (min)",
    data.averageTimeToResolveIncident.value,
    getStatus("AverageTimeToResolveIncident", data.averageTimeToResolveIncident.value)
  );

  renderValue("panicActivations",
    "Activaciones botón de pánico",
    data.panicButtonActivations.value,
    getStatus("PanicButtonActivations", data.panicButtonActivations.value)
  );

  renderValue("incidentsReported",
    "Incidencias reportadas",
    data.incidentsReported.value,
    getStatus("IncidentsReported", data.incidentsReported.value)
  );

  renderValue("harshDrivingEvents",
    "Eventos de conducción brusca",
    data.harshDrivingEvents.value,
    getStatus("HarshDrivingEvents", data.harshDrivingEvents.value)
  );
}

// 📌 Renderizar KPI tipo gauge
function renderGauge(container, title, value, status) {
  const el = document.getElementById(container);
  if (!el) {
    console.warn(`⚠️ Contenedor no encontrado: ${container}`);
    return;
  }

  const safeStatus = status ? status.toLowerCase() : "notdata";
  el.className = `card status-${safeStatus}`;

  Highcharts.chart(container, {
    chart: { type: 'solidgauge' },
    title: { text: title },
    pane: {
      center: ['50%', '60%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: { innerRadius: '60%', outerRadius: '100%', shape: 'arc' }
    },
    yAxis: {
      min: 0,
      max: 100,
      stops: [
        [0.3, '#DF5353'],
        [0.7, '#DDDF0D'],
        [1.0, '#55BF3B']
      ]
    },
    series: [{ name: title, data: [value ?? 0] }],
    tooltip: { valueSuffix: '%' }
  });
}

function renderValue(container, title, value, status) {
  const el = document.getElementById(container);
  if (!el) {
    console.warn(`⚠️ Contenedor no encontrado: ${container}`);
    return;
  }

  const safeStatus = status ? status.toLowerCase() : "notdata";
  const translatedStatus = statusTranslations[status] || "Sin datos";
  
  el.className = `card status-${safeStatus}`;
  el.innerHTML = `
    <h3>${title}</h3>
    <p><strong>${value ?? "N/D"}</strong></p>
    <p class="estado">Estado: ${translatedStatus}</p>
  `;
}