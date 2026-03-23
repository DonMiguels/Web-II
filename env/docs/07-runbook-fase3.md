# Runbook de Ejecucion - Fase 3

## 1. Objetivo

Ejecutar la Fase 3 de forma controlada para cerrar los pendientes diferidos:

1. Validacion centralizada y tipada de variables de entorno (fail-fast).
2. Implementacion de sanitize por metodo, mapa y regex.
3. Aplicacion de sanitize en puntos de entrada criticos.
4. Retiro gradual de fallbacks legacy de entorno (si procede y se aprueba).
5. Alineacion documental final con la arquitectura vigente.

## 2. Alcance

### Incluye

1. Backend runtime de entorno y validadores.
2. Sanitizacion de payloads de entrada para rutas y flujos principales.
3. Pruebas manuales y tecnicas de verificacion.
4. Actualizacion de documentos operativos.

### No incluye

1. Integracion con secret manager externo.
2. Rotacion automatica de secretos.
3. Cambios de UI no relacionados con configuracion/sanitizacion.

## 3. Precondiciones

1. Rama actual limpia o con cambios conocidos.
2. Entorno generado con node setup-env.js.
3. APP_ENV definido para la sesion de trabajo.
4. Stack de DB operativo para pruebas funcionales.

Comandos sugeridos (PowerShell):

```powershell
git status
node setup-env.js
$env:APP_ENV = "development"
docker compose --env-file ./env/development/docker.env -f db-win/docker-compose.yml up -d
```

Resultado esperado:

1. Sin errores en setup de env.
2. Contenedores DB en estado healthy o running.

## 4. Roles y Responsables

1. Implementador: aplica cambios de codigo y docs.
2. Revisor: valida criterios de aceptacion tecnica.
3. Operador QA: ejecuta runbook de pruebas manuales.

## 5. Entradas y Artefactos

### Entradas minimas

1. Contrato de variables aprobado (Fase 1).
2. Estado de Fase 2 operativo.
3. Lista de pendientes diferidos (validacion env + sanitize).

### Artefactos de salida

1. Modulo de validacion de entorno en backend.
2. Config de sanitize por metodo/map/regex.
3. Evidencias de pruebas (salidas de comandos y casos HTTP).
4. Documentacion actualizada.

## 6. Plan de Ejecucion por Etapas

## Etapa 0 - Baseline y Congelamiento

Checklist:

1. Crear rama de trabajo de Fase 3.
2. Capturar baseline de arranque backend/frontend/db.
3. Confirmar que Fase 2 sigue levantando sin regresiones.

Comandos sugeridos:

```powershell
git checkout -b phase3-env-validation-sanitize
npm --prefix backend run dev
npm --prefix frontend run dev -- --host
```

Criterio de salida:

1. Baseline funcional registrado en bitacora.

## Etapa 1 - Validacion Central de Entorno (Fail-Fast)

Objetivo:

1. Tener una unica capa que valide variables requeridas, tipos, enums y defaults.

Acciones tecnicas:

1. Definir schema de entorno por dominios:
1. Base app.
2. Server/CORS.
3. Session.
4. Auth JWT.
5. DB.
6. Services.
2. Crear parser tipado:
1. boolean (true/false).
2. integer/number con rango.
3. string no vacio.
4. lista CSV.
3. Implementar validacion al inicio de backend antes de boot de server.
4. Emitir error claro por variable faltante o invalida y terminar proceso.

Definition of Done (Etapa 1):

1. Backend no inicia con configuracion invalida.
2. Mensajes de error indican nombre de variable, valor detectado y regla esperada.
3. Config consumida por el resto del sistema proviene del modulo central.

Pruebas minimas:

1. Quitar AUTH_JWT_SECRET y verificar fallo controlado.
2. Colocar DB_PORT no numerico y verificar fallo controlado.
3. Arrancar con valores correctos y verificar inicio normal.

## Etapa 2 - Sanitizacion Metodo/Mapa/Regex

Objetivo:

1. Implementar sanitize reutilizable con reglas declarativas y comportamiento determinista.

Diseno objetivo:

1. sanitize(value, options).
2. sanitizeByMap(payload, sanitizeMap).
3. sanitizeByRegex(value, regexRules).
4. Orden de precedencia recomendado:
1. Regla explicita por campo (map).
2. Regla por regex.
3. Regla default global.

Acciones tecnicas:

1. Crear archivo de configuracion de sanitize defaults (JSON o JS).
2. Definir acciones soportadas:
1. trim.
2. toLowerCase/toUpperCase (si aplica).
3. normalizeSpaces.
4. stripHtml.
5. denyPatterns (lista regex bloqueadas).
6. allowPatterns (opcional por campo).
3. Integrar sanitize en flujos de entrada (controladores/rutas criticas).
4. Mantener separacion entre sanitizacion y validacion (no mezclar responsabilidades).

Definition of Done (Etapa 2):

1. Existen funciones unitarias de sanitize reutilizables.
2. Se aplican en los endpoints definidos como criticos.
3. Casos de XSS basicos y patrones peligrosos son neutralizados o rechazados de forma consistente.

Pruebas minimas:

1. Input con espacios extremos se normaliza.
2. Input con script/tag peligroso se limpia o rechaza segun regla.
3. Input valido no se altera de forma inesperada.

## Etapa 3 - Integracion, Compatibilidad y Fallbacks

Objetivo:

1. Conectar validacion env + sanitize sin romper flujos existentes.

Acciones tecnicas:

1. Revisar imports y puntos de inicializacion.
2. Habilitar modo compatibilidad temporal donde aplique.
3. Marcar fallbacks legacy para retiro y fecha objetivo.
4. Eliminar fallbacks legacy solo si el smoke test completo pasa.

Definition of Done (Etapa 3):

1. No hay regresiones en login, registro, CRUD principal y endpoints protegidos.
2. Fallbacks residuales quedan documentados o removidos.

## Etapa 4 - Verificacion Operativa End-to-End

Checklist de validacion:

1. DB arriba y saludable.
2. Backend inicia y conecta DB.
3. Frontend inicia y consume API.
4. Endpoint protegido responde 401 sin sesion y 200 con sesion valida.
5. Casos sanitize/validacion se comportan segun esperado.

Comandos sugeridos:

```powershell
docker compose --env-file ./env/development/docker.env -f db-win/docker-compose.yml ps
npm --prefix backend run dev
npm --prefix frontend run dev -- --host
```

## Etapa 5 - Cierre, Documentacion y Entrega

Checklist:

1. Actualizar docs operativas en env/docs.
2. Actualizar catalogo de variables solo si hubo cambios de contrato.
3. Adjuntar evidencia de pruebas (capturas/logs/salidas clave).
4. Generar resumen tecnico de cambios y riesgos residuales.

## 7. Matriz de Riesgos

1. Riesgo: bloqueo de arranque por validacion estricta.
1. Mitigacion: mensajes de error claros + checklist previo de variables.
2. Riesgo: sobre-sanitizacion rompiendo casos validos.
1. Mitigacion: pruebas con datos reales + allowPatterns por campo.
3. Riesgo: divergencia entre config y documentacion.
1. Mitigacion: actualizar docs en el mismo PR.

## 8. Plan de Rollback

Condiciones para rollback:

1. Regresion critica en login/registro.
2. Imposibilidad de iniciar backend con configuracion correcta.
3. Sanitizacion rompe flujos de negocio prioritarios.

Pasos:

1. Revertir commit(s) de Fase 3 en rama.
2. Restaurar baseline de Fase 2.
3. Reejecutar smoke test basico.
4. Reabrir ejecucion con alcance reducido.

## 9. Criterios de Aceptacion Final

1. Validacion central de entorno activa y probada (casos validos e invalidos).
2. sanitize metodo/map/regex implementado y aplicado en rutas acordadas.
3. Smoke test backend/frontend/db en verde.
4. Documentacion alineada con comportamiento real.
5. Sin secretos expuestos ni nuevos hardcodes criticos.

## 10. Plantilla de Bitacora de Ejecucion

Completar por cada corrida:

1. Fecha:
2. Rama:
3. APP_ENV:
4. Responsable:
5. Commit inicial:
6. Commit final:

Bloque de seguimiento:

1. Etapa 0: [OK/FAIL] - Evidencia:
2. Etapa 1: [OK/FAIL] - Evidencia:
3. Etapa 2: [OK/FAIL] - Evidencia:
4. Etapa 3: [OK/FAIL] - Evidencia:
5. Etapa 4: [OK/FAIL] - Evidencia:
6. Etapa 5: [OK/FAIL] - Evidencia:

Incidentes:

1. Incidente:
2. Impacto:
3. Accion tomada:
4. Estado:

Conclusiones:

1. Riesgos residuales:
2. Tareas post-runbook:
3. Go/No-Go final:
