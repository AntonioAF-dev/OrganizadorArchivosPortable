<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AFyloX - Clasifica. Organiza. Libera.</title>
    <link rel="stylesheet" href="css/style.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;700&display=swap" rel="stylesheet">
    <!-- SweetAlert2 v10 for Chrome 57 compatibility -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@10"></script>
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="header">
            <div class="logo-container">
                <div class="logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4L20 20M20 4L4 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.3"/>
                    </svg>
                </div>
                <div class="brand-text">
                    <h1 class="brand-name">AFyloX</h1>
                    <p class="brand-slogan">Clasifica. Organiza. Libera.</p>
                </div>
            </div>
            <div class="brand-author">by AntonioAF · Servacosta</div>
        </header>

        <main class="main-content">
            <form id="organizer-form" class="organizer-form">
                
                <div class="column-left">
                    <!-- Rutas Section -->
                    <section class="panel">
                        <h2 class="panel-title">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Directorios
                        </h2>
                        <div class="input-group">
                            <label for="origen">Ruta de Origen</label>
                            <div class="input-with-button">
                                <input type="text" id="origen" name="origen" placeholder="Ej: C:\Users\Usuario\Downloads" required autocomplete="off">
                                <button type="button" class="btn-browse" id="btn-browse-origen" title="Seleccionar carpeta">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                        <div class="input-group">
                            <label for="destino">Ruta de Destino Master</label>
                            <div class="input-with-button">
                                <input type="text" id="destino" name="destino" placeholder="Ej: D:\Archivos_Organizados" required autocomplete="off">
                                <button type="button" class="btn-browse" id="btn-browse-destino" title="Seleccionar carpeta">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </button>
                            </div>
                        </div>
                        <div class="unlock-panel" style="margin-top: 1rem;">
                            <button type="button" class="btn-secondary" id="btn-unlock" title="Repara los permisos de la carpeta de origen si recibes errores de Acceso Denegado">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                Desbloquear Permisos (Requiere Admin)
                            </button>
                        </div>
                    </section>

                    <!-- Acciones -->
                    <div class="actions-panel">
                        <div style="margin-bottom: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                            Configura tus rutas y selecciona las categorías a organizar.
                        </div>

                        <button type="submit" class="btn-primary" id="btn-submit">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Organizar Archivos
                        </button>
                    </div>
                </div>

                <div class="column-right">
                    <!-- Categorías Section -->
                    <section class="panel categories-panel">
                        <h2 class="panel-title">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Clasificación de Archivos
                        </h2>
                        
                        <div class="categories-container" id="categories-container">
                            <!-- Las categorías se generarán con JavaScript -->
                        </div>
                    </section>
                </div>

            </form>
        </main>
    </div>

    <script src="js/app.js"></script>
</body>
</html>
