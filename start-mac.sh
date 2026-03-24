#!/bin/bash
set -e

root="$(cd "$(dirname "$0")" && pwd)"
backend="$root/backend"
frontend="$root/frontend"
profile="development"
skip_install="false"
skip_env_setup="false"
dry_run="false"
node_cmd=""
npm_cmd=""

if command -v node >/dev/null 2>&1; then
	node_cmd="node"
elif command -v node.exe >/dev/null 2>&1; then
	node_cmd="node.exe"
else
	echo "No se encontro node/node.exe en PATH"
	exit 1
fi

if command -v npm >/dev/null 2>&1; then
	npm_cmd="npm"
elif command -v npm.cmd >/dev/null 2>&1; then
	npm_cmd="npm.cmd"
else
	echo "No se encontro npm/npm.cmd en PATH"
	exit 1
fi

while [[ $# -gt 0 ]]; do
	case "$1" in
		--profile)
			profile="$2"
			shift 2
			;;
		--skip-install)
			skip_install="true"
			shift
			;;
		--skip-env-setup)
			skip_env_setup="true"
			shift
			;;
		--dry-run)
			dry_run="true"
			shift
			;;
		*)
			echo "Argumento no reconocido: $1"
			exit 1
			;;
	esac
done

if [[ "$profile" != "development" && "$profile" != "test" && "$profile" != "production" ]]; then
	echo "Perfil invalido: $profile"
	echo "Valores permitidos: development, test, production"
	exit 1
fi

if [[ "$skip_env_setup" != "true" ]]; then
	echo "Inicializando archivos de entorno..."
	( cd "$root" && "$node_cmd" setup-env.js )
fi

if [[ "$skip_install" != "true" ]]; then
	echo "Instalando dependencias del backend..."
	( cd "$backend" && "$npm_cmd" install )

	echo "Instalando dependencias del frontend..."
	( cd "$frontend" && "$npm_cmd" install )
fi

backend_cmd="export APP_ENV='$profile'; cd '$backend'; $npm_cmd run dev; read -n 1 -s -r -p 'Presiona Enter para cerrar esta terminal'"
frontend_cmd="export APP_ENV='$profile'; cd '$frontend'; $npm_cmd run dev -- --host; read -n 1 -s -r -p 'Presiona Enter para cerrar esta terminal'"

if [[ "$dry_run" == "true" ]]; then
	echo "Modo dry-run: no se iniciaran procesos."
	echo "APP_ENV=$profile"
	echo "Backend command: $backend_cmd"
	echo "Frontend command: $frontend_cmd"
	exit 0
fi

echo "Iniciando backend en Terminal..."
osascript -e "tell application \"Terminal\" to do script \"$backend_cmd\""

echo "Iniciando frontend en Terminal..."
osascript -e "tell application \"Terminal\" to do script \"$frontend_cmd\""

echo "Listo. Se levantaron backend y frontend en procesos separados con APP_ENV=$profile."
echo "Presiona Ctrl+C para cerrar esta terminal."
