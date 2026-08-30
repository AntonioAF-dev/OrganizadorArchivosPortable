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
    echo json_encode(['success' => false, 'message' => 'La carpeta no existe.']);
    exit;
}

// Generar script de PowerShell que pide permisos (UAC) y repara el ACL de la carpeta.
// Utilizamos Start-Process -Verb RunAs para elevar privilegios.
// -Wait garantiza que PHP no devuelva la respuesta hasta que el proceso elevado termine.
$ps = <<<EOT
\$origen = "$origen"
\$script = "takeown.exe /f `"`\$origen`" /r /d Y | Out-Null; icacls.exe `"`\$origen`" /grant administrators:F /t | Out-Null"
try {
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command `"\$script`"" -Verb RunAs -Wait
} catch {
    # Ignorar si el usuario cancela el UAC
}
EOT;

$file = sys_get_temp_dir() . '/unlock_permissions.ps1';
file_put_contents($file, $ps);

$command = 'powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' . $file . '"';
shell_exec($command);

if (file_exists($file)) {
    unlink($file);
}

echo json_encode(['success' => true]);
?>
