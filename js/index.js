let views = [];
let currentView = null;
let historyStack = [];
let dataStore = {}; // permite pasar datos entre vistas

const toggleMenuBtn = document.getElementById('toggleMenu');
const sideMenu = document.getElementById('sideMenu');
const viewContent = document.getElementById('viewContent');
const backButton = document.getElementById('backButton');
const viewTitle = document.getElementById('viewTitle');
const viewIcon = document.getElementById('viewIcon');

// carga el archivo JSON con las vistas
fetch('/views.json')
    .then(res => res.json())
    .then(json => {
        views = json;
        buildMenu();
        navigateTo('home');
    });

// construye el menú lateral dinámicamente
function buildMenu() {
    // procesa cada vista
    views.forEach(view => {
        const btn = document.createElement('button');
        btn.textContent = `${view.icon} ${view.displayName}`;
        btn.style.background = view.color;
        btn.onclick = () => navigateTo(view.id);
        sideMenu.appendChild(btn);
    });
}

// cambia de vista usando imports dinámicos
async function navigateTo(id, extraData = null, fromBackButton = false) {
    const newView = views.find(s => s.id === id);
    if (!newView || newView.id === currentView?.id) return;

    // guarda la vista actual en el historial
    if (!fromBackButton && currentView) historyStack.push(currentView.id);

    // intenta llamar a la función de limpieza del módulo anterior
    if (currentView && currentView.module && currentView.module.cleanUp) {
        try {
            await currentView.module.cleanUp();
        } catch (e) {
            console.warn(`Error cleaning ${currentView.id}`, e);
        }
    }

    currentView = newView;
    document.title = `${currentView.displayName} - AxoMotor`;
    viewTitle.textContent = currentView.displayName;
    viewIcon.textContent = currentView.icon;
    backButton.disabled = historyStack.length === 0;

    // establece las rutas del HTML y JS
    const htmlPath = `/views/${currentView.id}/index.html`;
    // carga el HTML de la vista
    const html = await fetch(htmlPath).then(res => res.text());
    viewContent.innerHTML = html;

    try {
        // importa el módulo JS
        const module = await import(`./../views/${currentView.id}/index.js`);
        currentView.module = module;

        // verifica si el modulo define una función de inicialización
        if (module.init) {
            // inicializa el módulo y le pasa los datos
            module.init(extraData, dataStore);
        }
    } catch (err) {
        console.error(`No se pudo cargar el módulo JS de ${currentView.id}`, err);
    }
}

// retrocede a la vista anterior
backButton.onclick = () => {
    const last = historyStack.pop();
    if (last) navigateTo(last, null, true);
};

// alterna la visualización del menú lateral
toggleMenuBtn.onclick = () => {
    sideMenu.classList.toggle('hidden');
};
