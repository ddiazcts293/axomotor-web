// services/apiCalls.js
import { axomotorApiUrl } from '../secrets.js';

const defaultHeaders = {
  'Content-Type': 'application/json'
};

// HTTP helpers
async function get(endpoint, options = {}) {
  const url = `${axomotorApiUrl}/${endpoint}`;
  console.log(`GET: ${url}`);
  try {
    const response = await fetch(url, {
      ...options,
      method: 'GET',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    });
    const content = await response.json();
    if (Array.isArray(content)) return content;
    if (content.code !== 'success') throw new Error(content.reason || 'Unknown error');
    //return content.result || {};
    return content || {};
  } catch (error) {
    console.error('GET Error:', error);
    throw error;
  }
}

async function post(endpoint, body = {}, options = {}) {
  const url = `${axomotorApiUrl}/${endpoint}`;
  console.log(`POST: ${url}`, body);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      body: JSON.stringify(body)
    });
    const content = await response.json();
    if (content.code !== 'success') throw new Error(content.reason || 'Unknown error');
    //return content.result || {};
    return content || {};
  } catch (error) {
    console.error('POST Error:', error);
    throw error;
  }
}

async function put(endpoint, body = {}, options = {}) {
  const url = `${axomotorApiUrl}/${endpoint}`;
  console.log(`PUT: ${url}`, body);
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      },
      body: JSON.stringify(body)
    });
    const content = await response.json();
    if (content.code !== 'success') throw new Error(content.reason || 'Unknown error');
    //return content.result || {};
    return content || {};
  } catch (error) {
    console.error('PUT Error:', error);
    throw error;
  }
}

async function del(endpoint, options = {}) {
  const url = `${axomotorApiUrl}/${endpoint}`;
  console.log(`DELETE: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    });
    const content = await response.json();
    if (content.code !== 'success') throw new Error(content.reason || 'Unknown error');
    //return content.result || {};
    return content || {};
  } catch (error) {
    console.error('DELETE Error:', error);
    throw error;
  }
}

// CRUD API con validaciones
const AxoMotorWebAPI = {
  // Incidents
  getAllIncidents: async () => {
    const response = await get('incidents');
    return response.items || [];
  },
  getIncidentById: async (id) => {
    if (!id) throw new Error('El ID del incidente es obligatorio.');
    const response = await get(`incidents/${id}`);
    return response.items || [];
  },
  createIncident: (data) => {
    if (!data?.tripId || !data?.description) {
      throw new Error('El incidente debe tener tripId y descripción.');
    }
    return post('incidents', data);
  },
  updateIncident: (id, data) => {
    if (!data?.tripId || !data?.description) {
      throw new Error('El incidente actualizado debe tener tripId y descripción.');
    }
    return put(`incidents/${id}`, data);
  },
  deleteIncident: (id) => del(`incidents/${id}`),

  // Trips
  
  /*
  getAllTrips: async () => {
    const response = await get('trips');
    return response.items || [];
  },
  getTripById: async (id) => {
    if (!id) throw new Error('El ID del viaje es obligatorio.');
    const response = await get(`trips/${id}`);
    return response.items || [];
  },
  
  createTrip: (data) => {
    if (!data?.driverId || !data?.vehicleId) {
      throw new Error('El viaje debe tener driverId y vehicleId.');
    }
    return post('trips', data);
  },
  updateTrip: (id, data) => {
    if (!data?.driverId || !data?.vehicleId) {
      throw new Error('El viaje actualizado debe tener driverId y vehicleId.');
    }
    return put(`trips/${id}`, data);
  },
  deleteTrip: (id) => del(`trips/${id}`),

  */

  // Vehicles
  getAllVehicles: async () => {
    const response = await get('vehicles');
    return response || [];
  },
  getVehicleById: async (id) => {
    if (!id) throw new Error('El ID del vehículo es obligatorio.');
    const response = await get(`vehicles/${id}`);
    return response || [];
  },
  createVehicle: (data) => {
    if (!data?.plateNumber || !data?.registrationNumber) {
      throw new Error('El vehículo debe tener plateNumber y registrationNumber.');
    }
    return post('vehicles', data);
  },
  updateVehicle: (id, data) => {
    if (!data?.plateNumber || !data?.registrationNumber) {
      throw new Error('El vehículo actualizado debe tener plateNumber y registrationNumber.');
    }
    return put(`vehicles/${id}`, data);
  },
  deleteVehicle: (id) => del(`vehicles/${id}`),

  // User Accounts
  getAllUsers: async () => {
    const response = await get('userAccounts');
    return response || [];
  },
  getUserById: async (id) => {
    if (!id) throw new Error('El ID del usuario es obligatorio.');
    const response = await get(`userAccounts/${id}`);
    return response || [];
  },
  createUser: (data) => {
    const { firstName, lastName, email, phoneNumber, role } = data || {};
    if (!firstName || !lastName || !email || !phoneNumber || !role) {
      throw new Error('El usuario debe tener firstName, lastName, email, phoneNumber y role.');
    }
    return post('userAccounts', data);
  },
  updateUser: (id, data) => {
    const { firstName, lastName, email, phoneNumber, role } = data || {};
    if (!firstName || !lastName || !email || !phoneNumber || !role) {
      throw new Error('El usuario actualizado debe tener firstName, lastName, email, phoneNumber y role.');
    }
    return put(`userAccounts/${id}`, data);
  },
  deleteUser: (id) => del(`userAccounts/${id}`),

  // Obtener solo los conductores
  getAllDrivers: async () => {
    const response = await get('userAccounts');
    // Filtramos solo los que tengan tipo 'driver'
    return (response.result || []).filter(user => user.role === 'driver');
  },





  // === EXTRA FUNCTIONS ===

  /*
  // Obtener posiciones de un viaje
  getTripPositions: async (tripId) => {
    if (!tripId) throw new Error('El ID del viaje es obligatorio para obtener posiciones.');
    const response = await get(`trips/${tripId}/positions`);
    return response || [];
  },
  */

  getTripPositions: async (tripId, periodStart, periodEnd) => {
  if (!tripId) throw new Error('El ID del viaje es obligatorio para obtener posiciones.');
  
  let endpoint = `trips/${tripId}/positions`;
  const params = [];
  if (periodStart) params.push(`periodStart=${encodeURIComponent(periodStart)}`);
  if (periodEnd) params.push(`periodEnd=${encodeURIComponent(periodEnd)}`);
  if (params.length > 0) endpoint += `?${params.join('&')}`;

  const response = await get(endpoint);
  if (response.code === "success" && response.result?.items) {
    return response.result.items;
  }
  return [];
  },


  // Obtener viajes pendientes por ID de conductor
  getPendingTripsByDriverId: async (driverId) => {
    if (!driverId) throw new Error('El ID del conductor es obligatorio para obtener viajes pendientes.');
    const response = await get(`trips/pending/${driverId}`);
    return response || [];
  },

  /*
  // Crear una ubicación conocida
  createKnownLocation: async (data) => {
    if (!data?.name || !data?.latitude || !data?.longitude) {
      throw new Error('La ubicación conocida debe tener name, latitude y longitude.');
    }
    return post('trips/knownLocations', data);
  },
  */

  // Obtener ubicaciones conocidas
  getKnownLocations: async () => {
    const response = await get('trips/knownLocations');
    return response || [];
  },

  // Obtener ubicación conocida por ID
  getKnownLocationById: async (id) => {
    if (!id) throw new Error('El ID de la ubicación conocida es obligatorio.');
    const response = await get(`trips/knownLocations/${id}`);
    return response || [];
  },

  // Actualizar ubicación conocida
  updateKnownLocation: async (id, data) => await put('trips/knownLocations', id, data),

  // Eliminar ubicación conocida
  deleteKnownLocation: async (id) => {
    if (!id) throw new Error('El ID de la ubicación conocida es obligatorio para eliminarla.');
    return del(`trips/knownLocations/${id}`);
  },

  // Obtener eventos de un vehículo
  getVehicleEvents: async (vehicleId) => {
    if (!vehicleId) throw new Error('El ID del vehículo es obligatorio para obtener eventos.');
    const response = await get(`vehicles/${vehicleId}/events`);
    return response || [];
  },

  // Actualizar contraseña de usuario
  updateUserPassword: async (userId) => {
    if (!userId) {
      throw new Error('El ID del usuario es obligatorio para cambiar la contraseña.');
    }
    return put(`userAccounts/${userId}/resetPassword`);
  },

  // Comprobar la conexión de un vehículo
  checkVehicleConnection: async (vehicleId) => {
    if (!vehicleId) throw new Error('El ID del vehículo es obligatorio para comprobar la conexión.');
    const response = await get(`vehicles/${vehicleId}/checkConnection`);
    return response || [];
  },



/*TODOS MIS CAMBIOS*/



  
  // TRIPS ESTILO SEBAS
  // Trips
getAllTrips: async () => {
  const response = await get('trips');
  if (response.code === "success" && response.result?.items) {
    return response.result.items;
  }
  return [];
},

getTripById: async (id) => {
  if (!id) throw new Error('El ID del viaje es obligatorio.');
  const response = await get(`trips/${id}`);
  if (response.code === "success" && response.result) {
    return response.result;
  }
  return null;
},

createTrip: async (data) => {
  if (!data?.driverId || !data?.vehicleId) {
    throw new Error('El viaje debe tener driverId y vehicleId.');
  }
  return post('trips', data);
},

updateTrip: async (id, data) => {
  if (!id) throw new Error('El ID del viaje es obligatorio.');
  return put(`trips/${id}`, data);
},

deleteTrip: async (id) => {
  if (!id) throw new Error('El ID del viaje es obligatorio.');
  return del(`trips/${id}`);
},




    // Conductores
   getAllDrivers2: async () => {
  const response = await get('userAccounts?role=driver');
  if (response.code === "success" && Array.isArray(response.result)) {
    // Combinar nombre y apellido en fullName
    return response.result.map(d => ({
      ...d,
      fullName: `${d.firstName} ${d.lastName}`
    }));
  }
  return [];
  },
  // Vehículos
  getAllVehicles2: async () => {
    const response = await get('vehicles');
    if (response.code === "success" && Array.isArray(response.result)) {
      // Combinar modelo y placa en details
      return response.result.map(v => ({
        ...v,
        details: `${v.model} (${v.plateNumber})`
      }));
    }
    return [];
  },


getKnownLocations2: async () => {
  const response = await get('trips/knownLocations');
  if (response.code === "success" && Array.isArray(response.result?.items)) {
    return response.result.items.map(loc => ({
      ...loc,
      details: `${loc.name} - ${loc.address}`
    }));
  }
  return [];
},
createKnownLocation: async (locationData) => {
  const response = await post('trips/knownLocations', locationData);
  if (response.code !== "success") {
    throw new Error("Error creando lugar");
  }
  return response.result;
},

};




export default AxoMotorWebAPI;