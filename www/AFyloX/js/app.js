const dictionary = {
    "Documentos": ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "txt", "csv"],
    "Imágenes": ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"],
    "Programas": ["exe", "msi", "bat", "cmd"],
    "Comprimidos": ["zip", "rar", "7z", "tar", "gz"],
    "Multimedia": ["mp3", "mp4", "avi", "mkv", "wav"]
};

document.addEventListener("DOMContentLoaded", () => {
    const origenInput = document.getElementById("origen");
    const destinoInput = document.getElementById("destino");
    const categoriesContainer = document.getElementById("categories-container");
    const form = document.getElementById("organizer-form");
    const btnSubmit = document.getElementById("btn-submit");
    const btnClose = document.getElementById("close-app");

    // Cerrar Aplicación
    if (btnClose) {
        btnClose.addEventListener("click", () => {
            window.close();
        });
    }

    // Sincronizar destino con origen al escribir (si el usuario no ha editado el destino manualmente)
    let isDestinoManual = false;

    // Selector de carpetas nativo (mediante PowerShell)
    async function selectFolder(inputElement) {
        const btn = inputElement.nextElementSibling;
        if (btn) btn.disabled = true;
        inputElement.disabled = true;
        try {
            const res = await fetch('seleccionar_carpeta.php');
            const data = await res.json();
            if (data.success && data.path) {
                inputElement.value = data.path;
                inputElement.dispatchEvent(new Event('input'));
            }
        } catch (e) {
            console.error('Error selecting folder:', e);
        } finally {
            if (btn) btn.disabled = false;
            inputElement.disabled = false;
        }
    }
    
    const btnBrowseOrigen = document.getElementById("btn-browse-origen");
    if (btnBrowseOrigen) {
        btnBrowseOrigen.addEventListener("click", () => selectFolder(origenInput));
    }

    const btnBrowseDestino = document.getElementById("btn-browse-destino");
    if (btnBrowseDestino) {
        btnBrowseDestino.addEventListener("click", () => {
            isDestinoManual = true;
            selectFolder(destinoInput);
        });
    }

    const btnUnlock = document.getElementById("btn-unlock");
    if (btnUnlock) {
        btnUnlock.addEventListener("click", async () => {
            const origen = origenInput.value.trim();
            if (!origen) {
                Swal.fire("Carpeta requerida", "Por favor, selecciona primero una Ruta de Origen para desbloquear.", "warning");
                return;
            }

            Swal.fire({
                title: 'Elevando Permisos...',
                text: 'Acepta la ventana de Administrador de Windows (UAC) que aparecerá. Esto puede tardar unos segundos dependiendo del tamaño de la carpeta.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                const response = await fetch("desbloquear.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ origen: origen })
                });
                const result = await response.json();
                if (result.success) {
                    Swal.fire("¡Desbloqueado!", "Los permisos de la carpeta han sido reparados correctamente. Ahora puedes organizar los archivos.", "success");
                } else {
                    Swal.fire("Error", result.message || "Error al desbloquear.", "error");
                }
            } catch (error) {
                console.error(error);
                Swal.fire("Error del Sistema", "No se pudo conectar con el proceso de desbloqueo. Verifica que la aplicación no esté bloqueada por el antivirus.", "error");
            }
        });
    }
    
    destinoInput.addEventListener("input", () => {
        isDestinoManual = true;
    });

    let scanTimeout;
    origenInput.addEventListener("input", (e) => {
        if (!isDestinoManual) {
            const val = e.target.value.trim();
            if (val) {
                const separator = val.endsWith('\\') || val.endsWith('/') ? '' : '\\';
                destinoInput.value = val + separator + "Archivos_Ordenados";
            } else {
                destinoInput.value = "";
            }
        }
        if (e.target.value === "") {
            isDestinoManual = false;
        }

        // Lanzar escaneo
        clearTimeout(scanTimeout);
        const val = e.target.value.trim();
        scanTimeout = setTimeout(() => {
            scanExtensions(val);
        }, 800);
    });

    const cardColors = [
        'rgba(255, 218, 227, 0.65)', // Pink
        'rgba(230, 224, 255, 0.65)', // Lilac
        'rgba(216, 243, 235, 0.65)', // Green
        'rgba(206, 233, 245, 0.65)', // Blue
        'rgba(255, 241, 208, 0.65)'  // Peach
    ];
    let colorIndex = 0;

    // Generar DOM de las categorías
    Object.keys(dictionary).forEach(masterKey => {
        const extensions = dictionary[masterKey];
        const cardColor = cardColors[colorIndex % cardColors.length];
        colorIndex++;
        
        const card = document.createElement("div");
        card.className = "category-card";
        card.style.background = cardColor;
        
        card.innerHTML = `
            <div class="category-header">
                <label class="checkbox-container" style="display: flex; align-items: center; position: relative;">
                    <input type="checkbox" class="category-checkbox master-checkbox" data-master="${masterKey}">
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </label>
                <span class="category-title">${masterKey}</span>
                <input type="text" class="folder-name-input" value="${masterKey}" data-master-folder="${masterKey}" title="Nombre de subcarpeta destino" autocomplete="off" onclick="event.stopPropagation()">
            </div>
            <div class="extensions-list ext-grid">
                ${extensions.map(ext => `
                    <div class="extension-row">
                        <label class="extension-item chip">
                            <input type="checkbox" class="ext-checkbox sub-checkbox" data-parent="${masterKey}" value="${ext}">
                            <span class="ext-label">.${ext}</span>
                        </label>

                    </div>
                `).join("")}
            </div>
            <div class="card-footer">
                <label class="toggle-switch" title="Crea carpetas internas por extensión (Ej: ${masterKey}/pdf)">
                    <input type="checkbox" class="chk-separar-card" data-master="${masterKey}">
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Agrupar por extensión</span>
                </label>
            </div>
        `;
        
        categoriesContainer.appendChild(card);
    });

    // === Escaneo Dinámico de Extensiones Desconocidas ===
    function removeOtrosCard() {
        const card = document.getElementById("card-otros");
        if (card) {
            card.remove();
        }
    }

    function bindEventsForCard(card) {
        const master = card.querySelector('.master-checkbox');
        const subCheckboxes = card.querySelectorAll('.sub-checkbox');
        const masterInput = card.querySelector('.folder-name-input');

        master.addEventListener("change", (e) => {
            const isChecked = e.target.checked;
            subCheckboxes.forEach(sub => sub.checked = isChecked);
        });

        subCheckboxes.forEach(sub => {
            sub.addEventListener("change", () => {
                const allChecked = Array.from(subCheckboxes).every(cb => cb.checked);
                const someChecked = Array.from(subCheckboxes).some(cb => cb.checked);
                master.checked = allChecked;
                master.indeterminate = !allChecked && someChecked;
            });
        });
    }

    function renderOtrosCard(extensions) {
        let card = document.getElementById("card-otros");
        if (!card) {
            card = document.createElement("div");
            card.id = "card-otros";
            card.className = "category-card";
            card.style.background = "rgba(226, 232, 240, 0.8)"; // Silver/Gray color
            categoriesContainer.appendChild(card);
        }
        
        const masterKey = "Otros";
        
        card.innerHTML = `
            <div class="category-header">
                <label class="checkbox-container" style="display: flex; align-items: center; position: relative;">
                    <input type="checkbox" class="category-checkbox master-checkbox" data-master="${masterKey}">
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                </label>
                <span class="category-title">${masterKey} (Detectados)</span>
                <input type="text" class="folder-name-input" value="${masterKey}" data-master-folder="${masterKey}" title="Nombre de subcarpeta destino" autocomplete="off" onclick="event.stopPropagation()">
            </div>
            <div class="extensions-list ext-grid">
                ${extensions.map(ext => `
                    <div class="extension-row">
                        <label class="extension-item chip">
                            <input type="checkbox" class="ext-checkbox sub-checkbox" data-parent="${masterKey}" value="${ext}">
                            <span class="ext-label">.${ext}</span>
                        </label>

                    </div>
                `).join("")}
            </div>
            <div class="card-footer">
                <label class="toggle-switch" title="Crea carpetas internas por extensión (Ej: ${masterKey}/json)">
                    <input type="checkbox" class="chk-separar-card" data-master="${masterKey}">
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Agrupar por extensión</span>
                </label>
            </div>
        `;
        
        bindEventsForCard(card);
    }

    async function scanExtensions(origenPath) {
        if (!origenPath) {
            removeOtrosCard();
            return;
        }
        
        try {
            const response = await fetch("escanear_extensiones.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ origen: origenPath })
            });
            const result = await response.json();
            
            if (result.success && result.extensiones) {
                const knownExts = new Set();
                Object.values(dictionary).forEach(extList => extList.forEach(ext => knownExts.add(ext)));
                
                const unknownExts = result.extensiones.filter(ext => !knownExts.has(ext));
                
                if (unknownExts.length > 0) {
                    renderOtrosCard(unknownExts);
                } else {
                    removeOtrosCard();
                }
            } else {
                removeOtrosCard();
            }
        } catch (e) {
            console.error("Error al escanear extensiones:", e);
            removeOtrosCard();
        }
    }
    // ====================================================

    // Lógica de Checkboxes
    document.querySelectorAll(".master-checkbox").forEach(master => {
        master.addEventListener("change", (e) => {
            const isChecked = e.target.checked;
            const parentKey = e.target.dataset.master;
            const subCheckboxes = document.querySelectorAll(`.sub-checkbox[data-parent="${parentKey}"]`);
            subCheckboxes.forEach(sub => sub.checked = isChecked);
        });
    });

    // Sincronización del Input Master a los hijos (Ya no es necesario)

    document.querySelectorAll(".sub-checkbox").forEach(sub => {
        sub.addEventListener("change", (e) => {
            const parentKey = e.target.dataset.parent;
            const master = document.querySelector(`.master-checkbox[data-master="${parentKey}"]`);
            const subCheckboxes = document.querySelectorAll(`.sub-checkbox[data-parent="${parentKey}"]`);
            
            const allChecked = Array.from(subCheckboxes).every(cb => cb.checked);
            const someChecked = Array.from(subCheckboxes).some(cb => cb.checked);
            
            master.checked = allChecked;
            master.indeterminate = !allChecked && someChecked;
        });
    });

    // Envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const origen = origenInput.value.trim();
        const destino = destinoInput.value.trim();
        
        if (!origen || !destino) {
            Swal.fire({
                title: "Campos vacíos",
                text: "Por favor, ingresa tanto la ruta de origen como la de destino.",
                icon: "warning",
                confirmButtonColor: "#2563EB"
            });
            return;
        }

        // Recopilar categorías a separar
        const categoriasASeparar = [];
        document.querySelectorAll('.chk-separar-card:checked').forEach(chk => {
            const masterKey = chk.dataset.master;
            const card = chk.closest('.category-card');
            const masterInput = card.querySelector('.folder-name-input');
            const targetFolder = masterInput.value.trim() || masterKey;
            categoriasASeparar.push(targetFolder);
        });

        // Recopilar selección: mapa de { extension: "carpetaDestino" }
        const dataToSend = {
            origen: origen,
            destino: destino,
            categoriasASeparar: categoriasASeparar,
            extensiones: {}
        };

        // Extraer qué extensiones están marcadas
        document.querySelectorAll(".sub-checkbox:checked").forEach(cb => {
            const ext = cb.value;
            const card = cb.closest('.category-card');
            const masterInput = card.querySelector('.folder-name-input');
            const folderName = masterInput.value.trim() || cb.dataset.parent;
            
            dataToSend.extensiones[ext] = folderName;
        });

        if (Object.keys(dataToSend.extensiones).length === 0) {
            Swal.fire({
                title: "Sin selección",
                text: "Por favor, selecciona al menos una categoría o extensión para organizar.",
                icon: "warning",
                confirmButtonColor: "#2563EB"
            });
            return;
        }

        // Mostrar estado de carga
        const originalBtnText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = `
            <svg class="icon" style="animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Procesando...
        `;
        btnSubmit.disabled = true;

        try {
            const response = await fetch("procesar.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (result.success) {
                if (result.archivos_copiados.length > 0) {
                    // Preguntar si desea eliminar originales
                    Swal.fire({
                        title: "¡Copia Exitosa!",
                        text: `Se han copiado ${result.archivos_copiados.length} archivos con éxito. ¿Deseas eliminar los archivos originales de la carpeta origen para liberar espacio?`,
                        icon: "success",
                        showCancelButton: true,
                        confirmButtonColor: "#EF4444",
                        cancelButtonColor: "#1E293B",
                        confirmButtonText: "Sí, eliminar originales",
                        cancelButtonText: "No, mantenerlos"
                    }).then((swalResult) => {
                        if (swalResult.isConfirmed) {
                            eliminarOriginales(result.archivos_copiados);
                        }
                    });
                } else {
                    Swal.fire({
                        title: "Sin resultados",
                        text: "No se encontraron archivos con las extensiones seleccionadas en la ruta de origen.",
                        icon: "info",
                        confirmButtonColor: "#2563EB"
                    });
                }
            } else {
                throw new Error(result.message || "Error desconocido en el servidor");
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: "Problema al Organizar",
                text: "No se pudo completar el proceso. Es posible que algunos archivos tengan nombres muy largos o caracteres no soportados, que la carpeta sea gigantesca, o que falten permisos. Si es un problema de permisos, intenta usar el botón 'Desbloquear Permisos'.",
                icon: "error",
                confirmButtonColor: "#EF4444"
            });
        } finally {
            btnSubmit.innerHTML = originalBtnText;
            btnSubmit.disabled = false;
        }
    });

    // Función para llamar a eliminar.php
    async function eliminarOriginales(archivos) {
        try {
            Swal.fire({
                title: 'Eliminando...',
                text: 'Por favor, espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            });

            const response = await fetch("eliminar.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archivos: archivos })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: "¡Limpieza completada!",
                    text: `Se han eliminado ${result.eliminados} archivos originales.`,
                    icon: "success",
                    confirmButtonColor: "#22C55E"
                });
            } else {
                throw new Error(result.message || "Error al eliminar");
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: "Error de limpieza",
                text: "No se pudieron eliminar algunos archivos originales. Podrían estar abiertos en otro programa o protegidos por el sistema.",
                icon: "error",
                confirmButtonColor: "#EF4444"
            });
        }
    }
});



// CSS inline animation for loading spinner
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

