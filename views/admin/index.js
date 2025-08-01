import './style.css';

let users = [];
let selectedUser = null;

export function init(extraData, dataStore) {
    console.log('Inicializando página de administración...');

    users = [
        { id: 1, nombre: "Sebastian", apellidos: "Garcia", tipo: "admin", correo: "admin@axomotor.com", estado: "activo", logged: true, telefono: "555-1234", ultimoLogin: "2025-07-30", registro: "2024-06-01", actualizacion: "2025-07-15" },
        { id: 2, nombre: "Juan", apellidos: "Perez", tipo: "user", correo: "juan@mail.com", estado: "inactivo", logged: false, telefono: "555-5678", ultimoLogin: "2025-06-10", registro: "2024-09-01", actualizacion: "2025-06-20" }
    ];

    renderUsers();
    setupEventHandlers();
}

export function cleanUp() {
    console.log('Finalizando página de administración');
}

function renderUsers() {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";
    const filter = document.getElementById("filterType").value;

    users
        .filter(u => filter === "all" || u.tipo === filter)
        .forEach(u => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${u.nombre}</td>
                <td>${u.apellidos}</td>
                <td>${u.tipo}</td>
                <td>${u.correo}</td>
                <td>${u.estado}</td>
                <td>${u.logged ? "Sí" : "No"}</td>
                <td>
                    <button class="infoUserBtn" data-id="${u.id}">ℹ️</button>
                    <button class="editUserBtn" data-id="${u.id}">✏️</button>
                    <button class="resetPassBtn" data-id="${u.id}">🔑</button>
                    <button class="deleteUserBtn" data-id="${u.id}">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    attachRowEvents();
}

function setupEventHandlers() {
    document.getElementById("filterType").onchange = renderUsers;
    document.getElementById("btnAddUser").onclick = () => toggleModal("modalAddUser", true);
    document.getElementById("cancelAddUser").onclick = () => toggleModal("modalAddUser", false);
    document.getElementById("cancelEditUser").onclick = () => toggleModal("modalEditUser", false);
    document.getElementById("closeInfoUser").onclick = () => toggleModal("modalInfoUser", false);
    document.getElementById("cancelResetPassword").onclick = () => toggleModal("modalResetPassword", false);
    document.getElementById("cancelDeleteUser").onclick = () => toggleModal("modalDeleteUser", false);

    document.getElementById("formAddUser").onsubmit = (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        users.push({ id: Date.now(), ...formData, estado: "activo", logged: false, registro: new Date().toISOString().split('T')[0], actualizacion: new Date().toISOString().split('T')[0], ultimoLogin: "-" });
        renderUsers();
        toggleModal("modalAddUser", false);
    };

    document.getElementById("formEditUser").onsubmit = (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        Object.assign(selectedUser, formData, { actualizacion: new Date().toISOString().split('T')[0] });
        renderUsers();
        toggleModal("modalEditUser", false);
    };
}

function attachRowEvents() {
    document.querySelectorAll(".infoUserBtn").forEach(btn => btn.onclick = () => showInfoUser(btn.dataset.id));
    document.querySelectorAll(".editUserBtn").forEach(btn => btn.onclick = () => showEditUser(btn.dataset.id));
    document.querySelectorAll(".resetPassBtn").forEach(btn => btn.onclick = () => showResetPassword(btn.dataset.id));
    document.querySelectorAll(".deleteUserBtn").forEach(btn => btn.onclick = () => showDeleteUser(btn.dataset.id));
}

function showInfoUser(id) {
    selectedUser = users.find(u => u.id == id);
    const container = document.getElementById("userDetails");
    container.innerHTML = `
        <p><b>Nombre:</b> ${selectedUser.nombre} ${selectedUser.apellidos}</p>
        <p><b>Tipo de cuenta:</b> ${selectedUser.tipo}</p>
        <p><b>Estado:</b> ${selectedUser.estado}</p>
        <p><b>Ha iniciado sesión:</b> ${selectedUser.logged ? "Sí" : "No"}</p>
        <p><b>Último inicio de sesión:</b> ${selectedUser.ultimoLogin}</p>
        <p><b>Fecha de registro:</b> ${selectedUser.registro}</p>
        <p><b>Última actualización:</b> ${selectedUser.actualizacion}</p>
    `;
    toggleModal("modalInfoUser", true);
}

function showEditUser(id) {
    selectedUser = users.find(u => u.id == id);
    const form = document.getElementById("formEditUser");
    form.nombre.value = selectedUser.nombre;
    form.apellidos.value = selectedUser.apellidos;
    form.correo.value = selectedUser.correo;
    form.telefono.value = selectedUser.telefono;
    form.estado.value = selectedUser.estado;
    toggleModal("modalEditUser", true);
}

function showResetPassword(id) {
    selectedUser = users.find(u => u.id == id);
    document.getElementById("resetUserName").textContent = `Usuario: ${selectedUser.nombre} ${selectedUser.apellidos}`;
    toggleModal("modalResetPassword", true);
    document.getElementById("confirmResetPassword").onclick = () => {
        alert(`Contraseña de ${selectedUser.nombre} restablecida con éxito`);
        toggleModal("modalResetPassword", false);
    };
}

function showDeleteUser(id) {
    selectedUser = users.find(u => u.id == id);
    toggleModal("modalDeleteUser", true);
    document.getElementById("confirmDeleteUser").onclick = () => {
        users = users.filter(u => u.id !== selectedUser.id);
        renderUsers();
        toggleModal("modalDeleteUser", false);
    };
}

function toggleModal(id, show) {
    document.getElementById(id).classList.toggle("hidden", !show);
}
