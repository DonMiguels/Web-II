$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

Write-Host 'Instalando dependencias del backend...'
Push-Location $backend
npm install
Pop-Location

Write-Host 'Instalando dependencias del frontend...'
Push-Location $frontend
npm install
Pop-Location

Write-Host 'Iniciando backend...'
Start-Process -WorkingDirectory $backend -FilePath 'powershell' -ArgumentList @(
	'-NoExit',
	'-Command',
	"Set-Location -LiteralPath '$backend'; npm run dev; Read-Host 'Presiona Enter para cerrar esta terminal'"
)

Write-Host 'Iniciando frontend...'
Start-Process -WorkingDirectory $frontend -FilePath 'powershell' -ArgumentList @(
	'-NoExit',
	'-Command',
	"Set-Location -LiteralPath '$frontend'; npm run dev; Read-Host 'Presiona Enter para cerrar esta terminal'"
)

Write-Host 'Listo. Se levantaron backend y frontend en procesos separados.'
Read-Host 'Presiona Enter para cerrar esta terminal'
