<?php
error_reporting(0);
ini_set('display_errors', 0);
set_time_limit(0); // Evitar timeout en carpetas muy grandes
header('Content-Type: application/json');

// Obtener datos del JSON enviado por JS
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos válidos.']);
    exit;
}

$origen = $data['origen'];
$destinoMaster = $data['destino'];
$categoriasASeparar = isset($data['categoriasASeparar']) ? $data['categoriasASeparar'] : [];
$extensiones = $data['extensiones']; // array de [ 'pdf' => 'Mis_PDFs', 'jpg' => 'Fotos' ]

// Validar que el origen exista y sea un directorio
if (!is_dir($origen)) {
    echo json_encode(['success' => false, 'message' => 'La ruta de origen no existe o no es un directorio.']);
    exit;
}

$archivosCopiados = [];
$errores = [];

// Abrir el directorio de origen
$dir = @opendir($origen);
if (!$dir) {
    echo json_encode(['success' => false, 'message' => 'No se pudo leer el directorio de origen. Verifique los permisos.']);
    exit;
}

// Crear un mapa de extension => folderDestino en minúsculas para búsqueda rápida
$extToFolder = [];
foreach ($extensiones as $ext => $folderName) {
    $extToFolder[strtolower($ext)] = $folderName;
}

// Recorrer los archivos
while (($file = readdir($dir)) !== false) {
    // Ignorar . y ..
    if ($file === '.' || $file === '..') {
        continue;
    }

    $rutaAbsolutaOrigen = rtrim($origen, '/\\') . DIRECTORY_SEPARATOR . $file;

    // Solo procesar archivos, no carpetas
    if (is_file($rutaAbsolutaOrigen)) {
        $info = pathinfo($file);
        $ext = isset($info['extension']) ? strtolower($info['extension']) : '';

        // Si la extensión está seleccionada para organizar
        if (isset($extToFolder[$ext])) {
            $nombreSubcarpeta = $extToFolder[$ext];
            $rutaSubcarpetaDestino = rtrim($destinoMaster, '/\\') . DIRECTORY_SEPARATOR . $nombreSubcarpeta;
            
            if (in_array($nombreSubcarpeta, $categoriasASeparar) && $ext !== '') {
                $rutaSubcarpetaDestino .= DIRECTORY_SEPARATOR . $ext;
            }

            // Crear subcarpeta si no existe
            if (!file_exists($rutaSubcarpetaDestino)) {
                if (!@mkdir($rutaSubcarpetaDestino, 0777, true)) {
                    $errores[] = "No se pudo crear la carpeta: $rutaSubcarpetaDestino";
                    continue; // Saltar al siguiente archivo
                }
            }

            // Preparar ruta final del archivo con protección anti-duplicados
            $rutaAbsolutaDestino = $rutaSubcarpetaDestino . DIRECTORY_SEPARATOR . $file;
            
            if (file_exists($rutaAbsolutaDestino)) {
                $filename = $info['filename'];
                $ext_dot = isset($info['extension']) && $info['extension'] !== '' ? '.' . $info['extension'] : '';
                $counter = 1;
                
                // Buscar el siguiente número disponible
                while (file_exists($rutaSubcarpetaDestino . DIRECTORY_SEPARATOR . $filename . ' (' . $counter . ')' . $ext_dot)) {
                    $counter++;
                }
                
                $rutaAbsolutaDestino = $rutaSubcarpetaDestino . DIRECTORY_SEPARATOR . $filename . ' (' . $counter . ')' . $ext_dot;
            }

            // Copiar
            if (@copy($rutaAbsolutaOrigen, $rutaAbsolutaDestino)) {
                $archivosCopiados[] = $rutaAbsolutaOrigen;
            } else {
                $errores[] = "No se pudo copiar: $file";
            }
        }
    }
}
closedir($dir);

// Retornar resultados
$output = json_encode([
    'success' => true,
    'archivos_copiados' => $archivosCopiados,
    'errores' => $errores
]);

if ($output === false) {
    // Si json_encode falla (usualmente por caracteres no UTF-8 en los nombres de archivo)
    array_walk_recursive($archivosCopiados, function(&$item) { 
        if (is_string($item)) $item = utf8_encode($item); 
    });
    array_walk_recursive($errores, function(&$item) { 
        if (is_string($item)) $item = utf8_encode($item); 
    });
    $output = json_encode([
        'success' => true,
        'archivos_copiados' => $archivosCopiados,
        'errores' => $errores
    ]);
}

echo $output;
?>
