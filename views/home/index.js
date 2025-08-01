export function init(extraData, dataStore) {
  console.log('Inicializando página de inicio con KPIs...');

  const kpiData = {
    OperationalVehiclesPercentage: 85,
    OnTimeTripCompletedPercentage: 92,
    AvgTimeToResolveIncident: 3.5,
    PanicButtonActivations: 12,
    IncidentsReported: 7,
    GpsSignalLossTimePercentage: 6,
    HarshDrivingEventsPer100Km: 4
  };

  // Actualiza los valores numéricos en la barra resumen
  document.getElementById('summary-OperationalVehiclesPercentage').querySelector('.kpi-value').textContent = kpiData.OperationalVehiclesPercentage + '%';
  document.getElementById('summary-OnTimeTripCompletedPercentage').querySelector('.kpi-value').textContent = kpiData.OnTimeTripCompletedPercentage + '%';
  document.getElementById('summary-AvgTimeToResolveIncident').querySelector('.kpi-value').textContent = kpiData.AvgTimeToResolveIncident + 'h';
  document.getElementById('summary-PanicButtonActivations').querySelector('.kpi-value').textContent = kpiData.PanicButtonActivations;

  // Opciones base para gauges
  const gaugeOptions = {
    chart: { type: 'solidgauge', backgroundColor: 'transparent' },
    title: null,
    pane: {
      center: ['50%', '70%'],
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: {
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc',
        backgroundColor: '#eee'
      }
    },
    tooltip: { enabled: false },
    yAxis: {
      min: 0,
      max: 100,
      stops: [
        [0.1, '#DF5353'], // rojo
        [0.5, '#DDDF0D'], // amarillo
        [0.9, '#55BF3B']  // verde
      ],
      lineWidth: 0,
      tickPositions: []
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true,
          format: `<div style="text-align:center">
                    <span style="font-size:28px;color:#333">{y}%</span><br/>
                    <span style="font-size:14px;color:#666">{series.name}</span>
                   </div>`
        }
      }
    }
  };

  Highcharts.chart('OperationalVehiclesPercentage', Highcharts.merge(gaugeOptions, {
    yAxis: { max: 100 },
    series: [{ name: 'Vehículos Operativos', data: [kpiData.OperationalVehiclesPercentage], color: '#4caf50' }]
  }));

  Highcharts.chart('OnTimeTripCompletedPercentage', Highcharts.merge(gaugeOptions, {
    yAxis: { max: 100 },
    series: [{ name: 'Viajes a Tiempo', data: [kpiData.OnTimeTripCompletedPercentage], color: '#2196f3' }]
  }));

  Highcharts.chart('GpsSignalLossTimePercentage', Highcharts.merge(gaugeOptions, {
    yAxis: { max: 100 },
    series: [{ name: 'Tiempo Sin Señal GPS', data: [kpiData.GpsSignalLossTimePercentage], color: '#ff9800' }]
  }));

  Highcharts.chart('AvgTimeToResolveIncident', {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Tiempo Promedio para Resolver Incidencias (hrs)' },
    xAxis: { categories: ['Hoy'] },
    yAxis: { min: 0, title: { text: 'Horas' } },
    series: [{ name: 'Horas', data: [kpiData.AvgTimeToResolveIncident], color: '#8e44ad' }]
  });

  Highcharts.chart('PanicButtonActivations', {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Activaciones Botón de Pánico' },
    xAxis: { categories: ['Hoy'] },
    yAxis: { min: 0, title: { text: 'Activaciones' } },
    series: [{ name: 'Activaciones', data: [kpiData.PanicButtonActivations], color: '#e74c3c' }]
  });

  Highcharts.chart('IncidentsReported', {
    chart: { type: 'line', backgroundColor: 'transparent' },
    title: { text: 'Incidencias Reportadas' },
    xAxis: { categories: ['Hoy'] },
    yAxis: { min: 0, title: { text: 'Número de Incidencias' } },
    series: [{ name: 'Incidencias', data: [kpiData.IncidentsReported], color: '#34495e' }]
  });

  Highcharts.chart('HarshDrivingEventsPer100Km', {
    chart: { type: 'column', backgroundColor: 'transparent' },
    title: { text: 'Eventos de Conducción Brusca (por 100 km)' },
    xAxis: { categories: ['Hoy'] },
    yAxis: { min: 0, title: { text: 'Eventos' } },
    series: [{ name: 'Eventos', data: [kpiData.HarshDrivingEventsPer100Km], color: '#f39c12' }]
  });
}

export function cleanUp() {
  console.log('Finalizando página de inicio');
  const grid = document.querySelector('.kpi-grid');
  if (grid) grid.innerHTML = '';
}
