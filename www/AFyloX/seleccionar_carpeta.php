<?php
header('Content-Type: application/json');

$ps = <<<EOT
Add-Type -AssemblyName System.windows.forms
\$f = New-Object System.Windows.Forms.FolderBrowserDialog
\$f.ShowNewFolderButton = \$true
if (\$f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output \$f.SelectedPath
}
EOT;

$file = sys_get_temp_dir() . '/folder_picker.ps1';
file_put_contents($file, $ps);

// -Sta es OBLIGATORIO para que los diálogos de Windows Forms se muestren correctamente desde un proceso en segundo plano.
$command = 'powershell -Sta -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' . $file . '"';
$path = shell_exec($command);

// Limpiar
if (file_exists($file)) {
    unlink($file);
}

if ($path && trim($path) != "") {
    echo json_encode(['success' => true, 'path' => trim($path)]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ninguna carpeta seleccionada o diálogo cerrado.']);
}
?>
