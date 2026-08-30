<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['archivos']) || !is_array($data['archivos'])) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
    exit;
}

$archivos = $data['archivos'];
$eliminados = 0;
$errores = [];

foreach ($archivos as $archivo) {
    if (file_exists($archivo) && is_file($archivo)) {
        if (@unlink($archivo)) {
            $eliminados++;
        } else {
            $errores[] = "No se pudo eliminar: $archivo";
        }
    } else {
        $errores[] = "El archivo no existe o no es válido: $archivo";
    }
}

echo json_encode([
    'success' => true,
    'eliminados' => $eliminados,
    'total_recibidos' => count($archivos),
    'errores' => $errores
]);
