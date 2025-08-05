# axomotor-web

Página web de administración para un sistema de monitoreo de vehículos de una empresa.

## Configuración

Se requiere de Node.js instalado para iniciar el servidor web. No se necesita copiar el contenido de esta carpeta a la carpeta raíz de Apache.

**Pasos:**

1. Clonar o descargar este repositorio.
2. Abrir la terminal en el directorio del proyecto.
3. Ejecutar `npm install` para installar las dependencias requeridas.

### Probar el servidor

Usando una terminal (o la terminal integrada en VSCode) posicionada en la carpeta del proyecto, ejecutar el comando `npm start` para iniciar el servidor web. Se mostrará la URL y el puerto de localhost para ver la página web en un navegador.

## Estructura del proyecto

```
root/
|- assets/
|- css/
|   |- style.css
|   |- theme.css
|- js/
|   |- index.js
|- services/
|   |- /
|- views/
|   |- admin/
|   |   |- index.html
|   |   |- index.js
|   |   |- style.css
|   |- drivers/
|   |   |- index.html
|   |   |- index.js
|   |   |- style.css
|   |- home/
|   |   |- index.html
|   |   |- index.js
|   |   |- style.css
|   |- incidents/
|   |   |- index.html
|   |   |- index.js
|   |   |- style.css
|   |- trips/
|   |   |- index.html
|   |   |- index.js
|   |   |- style.css
|   |- vehicles/
|   |   |- index.html
|   |   |- index.js
|   |   |- style.css
|- index.html
|- views.json
```

- Todas las vistas (o secciones) están en la carpeta `views`.
- El archivo `views.json` define las secciones que deberán mostrarse en el menú lateral.
- El archivo `index.js` se encarga de gestionar la navegación entre vistas.
- Los archivos carpeta `css` en el directorio raíz contienen la información del estilo para toda la página.
