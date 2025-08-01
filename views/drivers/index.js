let driversData = [
    { nombre: "Juan", apellidos: "Pérez", correo: "juan@example.com", telefono: "555-1234", estado: "activo", activo: true, ultimoLogin: "2025-07-15" },
    { nombre: "María", apellidos: "López", correo: "maria@example.com", telefono: "555-5678", estado: "inactivo", activo: false, ultimoLogin: "2025-06-30" },
    { nombre: "Carlos", apellidos: "Ramírez", correo: "carlos@example.com", telefono: "555-9876", estado: "bloqueado", activo: false, ultimoLogin: "2025-05-20" }
];

// inicializa la vista
export function init(extraData, dataStore) {
    const selectEstado = document.getElementById("estadoSelect");
    const tbody = document.getElementById("driversTableBody");

    function renderTable(filtro) {
        tbody.innerHTML = "";
        driversData
            .filter(d => filtro === "todos" || d.estado === filtro)
            .forEach(driver => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${driver.nombre}</td>
                    <td>${driver.apellidos}</td>
                    <td>${driver.correo}</td>
                    <td>${driver.telefono}</td>
                    <td>${driver.estado}</td>
                    <td>${driver.activo ? "Sí" : "No"}</td>
                    <td>${driver.ultimoLogin}</td>
                `;
                tbody.appendChild(row);
            });
    }

    // primer render
    renderTable("todos");

    // evento de filtrado
    selectEstado.addEventListener("change", () => {
        renderTable(selectEstado.value);
    });
}

// opcional: limpiar si se sale de la vista
export function cleanUp() {
    document.getElementById("driversTableBody").innerHTML = "";
}
