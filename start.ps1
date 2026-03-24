param(
	[ValidateSet('development', 'test', 'production')]
	[string]$Profile = 'development',
	[switch]$SkipInstall,
	[switch]$SkipEnvSetup,
	[switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$env:APP_ENV = $Profile

if (-not $SkipEnvSetup) {
	Write-Host 'Inicializando archivos de entorno...'
	Push-Location $root
	node setup-env.js
	Pop-Location
}

if (-not $SkipInstall) {
	Write-Host 'Instalando dependencias del backend...'
	Push-Location $backend
	npm install
	Pop-Location

	Write-Host 'Instalando dependencias del frontend...'
	Push-Location $frontend
	npm install
	Pop-Location
}

$backendCommand = "`$env:APP_ENV='$Profile'; Set-Location -LiteralPath '$backend'; npm run dev; Read-Host 'Presiona Enter para cerrar esta terminal'"
$frontendCommand = "`$env:APP_ENV='$Profile'; Set-Location -LiteralPath '$frontend'; npm run dev -- --host; Read-Host 'Presiona Enter para cerrar esta terminal'"

if ($DryRun) {
	Write-Host 'Modo dry-run: no se iniciaran procesos.'
	Write-Host "APP_ENV=$Profile"
	Write-Host "Backend command: $backendCommand"
	Write-Host "Frontend command: $frontendCommand"
	return
}

Write-Host 'Iniciando backend...'
Start-Process -WorkingDirectory $backend -FilePath 'powershell' -ArgumentList @(
	'-NoExit',
	'-Command',
	$backendCommand
)

Write-Host 'Iniciando frontend...'
Start-Process -WorkingDirectory $frontend -FilePath 'powershell' -ArgumentList @(
	'-NoExit',
	'-Command',
	$frontendCommand
)

Write-Host "Listo. Se levantaron backend y frontend en procesos separados con APP_ENV=$Profile."
Read-Host 'Presiona Enter para cerrar esta terminal'
