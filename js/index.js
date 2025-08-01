let views = [];
let currentView = null;
let historyStack = [];
let dataStore = {}; // permite pasar datos entre vistas

// alternar sidebar colapsada
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
        navigateTo('login', { navigateTo }); // empieza en login
    });

    // construye el menú lateral dinámicamente
    function buildMenu() {
    const content = document.querySelector('.sideMenu-content');
    content.innerHTML = ''; // evita duplicados

    views.forEach(view => {
        // Excluir 'login' y 'settings' del menú lateral
        if (view.id === 'login' || view.id === 'settings') return;

        const btn = document.createElement('button');
        btn.innerHTML = `<i class="${view.icon}"></i> <span class="text">${view.displayName}</span>`;
        btn.onclick = () => navigateTo(view.id);
        content.appendChild(btn);
    });
    }




// cambia de vista usando imports dinámicos

async function navigateTo(id, extraData = null, fromBackButton = false) {
    const newView = views.find(s => s.id === id);
    if (!newView || newView.id === currentView?.id) return;

    if (!fromBackButton && currentView) historyStack.push(currentView.id);

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
    viewIcon.innerHTML = `<i class="${currentView.icon}"></i>`; // 

    backButton.disabled = historyStack.length === 0;
    if (id === "login") {
        sideMenu.style.display = "none";
        backButton.style.display = "none";
        document.getElementById("viewHeader").style.display = "none";
    } else {
        sideMenu.style.display = "flex";
        backButton.style.display = "inline-block";
        document.getElementById("viewHeader").style.display = "flex";
    }


    

    const htmlPath = `/views/${currentView.id}/index.html`;
    const cssPath = `/views/${currentView.id}/style.css`;

    const html = await fetch(htmlPath).then(res => res.text());
    viewContent.innerHTML = html;

    document.querySelectorAll('link[data-view-style]').forEach(link => link.remove());

    document.querySelector('.herramienta button').onclick = () => {
    navigateTo('settings');
};


    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    link.setAttribute('data-view-style', currentView.id);
    document.head.appendChild(link);

    try {
        const module = await import(`./../views/${currentView.id}/index.js`);
        currentView.module = module;
        if (module.init) {
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

toggleMenuBtn.onclick = () => {
  sideMenu.classList.toggle('collapsed');
  sideMenu.classList.toggle('expanded');
};
