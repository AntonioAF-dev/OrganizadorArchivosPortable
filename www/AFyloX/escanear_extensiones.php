<?php
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['origen'])) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
    exit;
}

$origen = $data['origen'];

if (!file_exists($origen) || !is_dir($origen)) {
    echo json_encode(['success' => false, 'extensiones' => []]);
    exit;
}

$extensiones = [];

$dir = @opendir($origen);
if ($dir) {
    while (($file = readdir($dir)) !== false) {
        if ($file === '.' || $file === '..') continue;
        
        $rutaAbsoluta = rtrim($origen, '/\\') . DIRECTORY_SEPARATOR . $file;
        
        if (is_file($rutaAbsoluta)) {
            $info = pathinfo($file);
            if (isset($info['extension']) && trim($info['extension']) !== '') {
                $ext = strtolower(trim($info['extension']));
                $extensiones[$ext] = true;
            }
        }
    }
    closedir($dir);
}

$extList = array_keys($extensiones);
sort($extList);

echo json_encode(['success' => true, 'extensiones' => $extList]);
?>
