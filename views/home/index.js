const thresholds = {
  AVG_SPEED:{type:'Range', low:60, acceptable:70, high:80, critical:90, max:120},
  DELAY_TIME:{type:'Percent', acceptable:5, high:10, critical:15, max:20},
  FUEL_EFF:{type:'Range', low:7, acceptable:9, high:10, critical:12, max:15},
  HARD_BRAKE:{type:'Value', acceptable:2, high:5, critical:10, max:15},
  IDLE_TIME:{type:'Percent', acceptable:10, high:15, critical:20, max:30},
  MAINT_COST:{type:'Value', acceptable:1000, high:1500, critical:2000, max:3000},
  ROUTE_COMP:{type:'Percent', acceptable:95, high:90, critical:85, max:100},
  SAFETY_SC:{type:'Range', low:90, acceptable:85, high:80, critical:70, max:100}
};

function getStatus(code, val) {
  const t = thresholds[code];
  if (!t) return 'neutral';
  if (t.type==='Range') {
    if (val >= t.low && val <= t.acceptable) return 'success';
    if (val > t.acceptable && val <= t.high) return 'warning';
    if (val > t.high && val <= t.critical) return 'alert';
    return 'danger';
  } else {
    if (val <= t.acceptable) return 'success';
    if (val <= t.high) return 'warning';
    if (val <= t.critical) return 'alert';
    return 'danger';
  }
}

function renderGauge(code, val) {
  const t = thresholds[code];
  const status = getStatus(code, val);
  const colors = {
    success: '#22c55e',
    warning: '#eab308',
    alert: '#f97316',
    danger: '#ef4444',
    neutral: '#6b7280'
  };
  const color = colors[status] || colors.neutral;
  
  Highcharts.chart(code,{
    chart:{type:'solidgauge',backgroundColor:'transparent'},
    title:{text:null},
    pane:{center:['50%','70%'],size:'100%',startAngle:-90,endAngle:90,
          background:{innerRadius:'60%',outerRadius:'100%',shape:'arc',backgroundColor:'#e5e7eb'}},
    yAxis:{min:0,max:t.max,labels:{enabled:false},lineWidth:0,tickPositions:[]},
    tooltip:{enabled:false},
    plotOptions:{solidgauge:{dataLabels:{y:-20,borderWidth:0,useHTML:true,
      format:`<div style="text-align:center">
                <span style="font-size:22px;color:#111827">{y}</span><br/>
                <span style="font-size:13px;color:#6b7280">${code}</span>
              </div>`}}},
    series:[{data:[val],color:color}]
  });

  const card=document.getElementById('summary-'+code);
  if(card){
    card.classList.add(status);
    card.querySelector('.kpi-value').textContent=val+(t.type==='Percent'?'%':'');
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const sample={
    AVG_SPEED:72,
    DELAY_TIME:8,
    FUEL_EFF:9.2,
    HARD_BRAKE:3,
    IDLE_TIME:12,
    MAINT_COST:1200,
    ROUTE_COMP:94,
    SAFETY_SC:88
  };
  Object.keys(sample).forEach(code=>renderGauge(code,sample[code]));

  // Cambio de periodo (ejemplo)
  document.getElementById('periodSelector').addEventListener('change',e=>{
    const val=e.target.value;
    let data;
    if(val==='today'){
      data={AVG_SPEED:72,DELAY_TIME:8,FUEL_EFF:9.2,HARD_BRAKE:3,IDLE_TIME:12,MAINT_COST:1200,ROUTE_COMP:94,SAFETY_SC:88};
    } else if(val==='week'){
      data={AVG_SPEED:70,DELAY_TIME:6,FUEL_EFF:8.9,HARD_BRAKE:4,IDLE_TIME:14,MAINT_COST:1300,ROUTE_COMP:92,SAFETY_SC:85};
    } else {
      data={AVG_SPEED:68,DELAY_TIME:5,FUEL_EFF:9.1,HARD_BRAKE:5,IDLE_TIME:15,MAINT_COST:1400,ROUTE_COMP:91,SAFETY_SC:84};
    }
    Object.keys(data).forEach(code=>renderGauge(code,data[code]));
  });
});
