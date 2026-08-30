# Organizador de Archivos Portable

Un sistema portable para la organización de archivos, desarrollado usando PHP, HTML, CSS, JavaScript y empaquetado con PHP Desktop (Chromium Embedded Framework).

## Características

- **Totalmente Portable**: No requiere instalación de un servidor web ni de PHP en el sistema operativo.
- **Interfaz Web**: Acceso a través de una interfaz de usuario limpia y fácil de utilizar.
- **Gestión Local**: Ideal para procesar y organizar archivos de manera local utilizando la potencia de PHP de fondo.

## Código Fuente

Este repositorio contiene únicamente el **código fuente** (`www/` y configuraciones relevantes) para que sea más ligero. Los archivos binarios pesados (como ejecutables, dependencias de Chromium, librerías y carpetas de PHP Desktop) han sido ignorados (`.gitignore`).

## Cómo ejecutar desde el código fuente

Si has descargado este repositorio y deseas ejecutarlo localmente:

1. Necesitas descargar [PHP Desktop Chrome](https://github.com/cztomczak/phpdesktop).
2. Extrae PHP Desktop en una carpeta.
3. Clona o descarga este repositorio y reemplaza la carpeta `www/` predeterminada por la de este repositorio.
4. Asegúrate de incluir el archivo `settings.json` de este repositorio en la raíz (junto al ejecutable de PHP Desktop).
5. Ejecuta el archivo `.exe` principal de PHP Desktop (por lo general llamado `phpdesktop-chrome.exe` o `AFyloX.exe`).

## Releases (Versión Lista para Usar)

Para descargar la versión completamente funcional (que incluye el motor portable y no requiere configuraciones), ve a la sección de **Releases** en este repositorio y descarga el archivo comprimido disponible.

- Simplemente extrae el archivo y ejecuta `AFyloX.exe`.
