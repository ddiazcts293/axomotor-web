import AxoMotorWebAPI from '../../services/axomotor.js';
let driversData = [];


// inicializa la vista
export async function init(extraData, dataStore) {
    const selectEstado = document.getElementById("estadoSelect");
    const tbody = document.getElementById("driversTableBody");

    async function loadDrivers() {
        try {
            driversData = await AxoMotorWebAPI.getAllDrivers();
            renderTable("todos");
        } catch (error) {
            console.error("Error al cargar conductores:", error);
            tbody.innerHTML = `<tr><td colspan="7">No se pudieron cargar los conductores</td></tr>`;
        }
    }

    function renderTable(filtro) {
        tbody.innerHTML = "";
        driversData
            .filter(d => filtro === "todos" || d.status === filtro)
            .forEach(driver => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${driver.firstName || "N/A"}</td>
                    <td>${driver.lastName || "N/A"}</td>
                    <td>${driver.email || "-"}</td>
                    <td>${driver.phoneNumber || "-"}</td>
                    <td>${driver.status || "-"}</td>
                    <td>${driver.isLoggedIn ? "Sí" : "No"}</td>
                    <td>${driver.lastLogInDate?.split("T")[0] || "-"}</td>
                `;
                tbody.appendChild(row);
            });
    }

    // Carga los datos
    await loadDrivers();

    // evento de filtrado
    selectEstado.addEventListener("change", () => {
        renderTable(selectEstado.value);
    });
}


// opcional: limpiar si se sale de la vista
export function cleanUp() {
    document.getElementById("driversTableBody").innerHTML = "";
}
