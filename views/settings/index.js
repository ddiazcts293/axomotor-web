export function init(extraData, dataStore) {
    const form = document.getElementById('settingsForm');

    form.addEventListener('submit', e => {
        e.preventDefault();

        const theme = document.getElementById('theme').value;
        const language = document.getElementById('language').value;
        const notifications = document.getElementById('notifications').checked;

        alert(`Cambios guardados:
        Tema: ${theme}
        Idioma: ${language}
        Notificaciones: ${notifications ? 'Activadas' : 'Desactivadas'}`);
    });
}
