# Gobernanza Tecnica, Riesgos, Pruebas y Metricas

## Indice
1. [Objetivo](#objetivo)
2. [Modelo de gobernanza recomendado](#modelo-de-gobernanza-recomendado)
3. [Riesgos principales y mitigaciones](#riesgos-principales-y-mitigaciones)
4. [Estrategia de pruebas](#estrategia-de-pruebas)
5. [Observabilidad y logging](#observabilidad-y-logging)
6. [Metricas operativas y de arquitectura](#metricas-operativas-y-de-arquitectura)
7. [Politica de cambios y calidad](#politica-de-cambios-y-calidad)
8. [Checklist de control continuo](#checklist-de-control-continuo)
9. [Referencias](#referencias)

## Objetivo
Definir controles de calidad y operacion para sostener la evolucion arquitectonica sin perder estabilidad ni trazabilidad.

## Modelo de gobernanza recomendado
1. ADR ligero por decision tecnica relevante.
2. Dueño tecnico por subsistema.
3. Definition of Done con pruebas + observabilidad.
4. Release por lotes funcionales con rollback definido.

## Riesgos principales y mitigaciones
| Riesgo | Impacto | Probabilidad | Mitigacion |
|---|---|---|---|
| Regresion por cambios de naming canónico BO | Alto | Media | Migraciones idempotentes + contract tests |
| Regresion en autorizacion | Alto | Media | Contract tests de permisos |
| Inconsistencia de stock | Alto | Media | Lock + reconciliacion nocturna |
| Deuda por errores no tipados | Medio | Alta | Catalogo unico de errores |
| Fuga de datos sensibles en log | Alto | Baja | Sanitizacion y redaction central |
| Latencia alta de dispatch | Medio | Media | Cache, metricas y tuning resolver |

## Estrategia de pruebas
### Piramide sugerida
1. Unit tests de dominio.
2. Integration tests de repositorios y adapters.
3. Contract tests para dispatcher y seguridad.
4. End-to-end de procesos minimos.

### Casos minimos obligatorios
1. Sesion requerida.
2. Perfil no asignado.
3. Transaccion inexistente.
4. Permiso denegado.
5. Prestamo exitoso.
6. Devolucion clasificada y cierre correcto.
7. Compensacion parcial y total.
8. Alertas de retraso y recordatorio.
9. Reporte de morosos correcto por periodo.

## Observabilidad y logging
### Estilo de log
1. JSON estructurado por linea.
2. Campos base: timestamp, level, app, env, message, context, meta.
3. Correlacion obligatoria: requestId, txId, userId, profile.

### Eventos auditables minimos
1. Decision de autorizacion.
2. Cambio de estado de prestamo/devolucion.
3. Cambio de solvencia.
4. Creacion/cierre de mantenimiento.
5. Emision/fallo de notificacion.

## Metricas operativas y de arquitectura
### Metricas de negocio
1. Prestamos por periodo.
2. Tasa de devolucion tardia.
3. Monto compensado por dano/perdida.
4. Tasa de conversion de reserva a prestamo.

### Metricas de plataforma
1. Latencia p95 de dispatch.
2. Error rate por transaction_id.
3. Cache hit ratio de permisos/transacciones.
4. Tiempo de sync de seguridad.

### Metricas de calidad arquitectonica
1. Acoplamiento entre modulos (tendencia).
2. Complejidad ciclomatica por servicio critico.
3. Cobertura de pruebas por subsistema.
4. Deuda tecnica pendiente por fase.

## Politica de cambios y calidad
1. Ningun merge de dominio sin pruebas unitarias nuevas/actualizadas.
2. Ningun cambio en autorizacion sin contract tests.
3. Ningun cambio de schema sin migracion documentada.
4. Ningun evento critico sin trazabilidad de auditoria.

## Checklist de control continuo
1. Revisar alineacion process -> tabla -> caso de uso.
2. Ejecutar suite de seguridad y dispatch en cada release.
3. Auditar permisos y opciones semanalmente.
4. Revisar metricas de latencia y errores diarias.
5. Verificar no exposicion de estado interno en API.

## Referencias
1. [03-arquitectura-objetivo-clean.md](./03-arquitectura-objetivo-clean.md)
2. [06-roadmap-corto-plazo.md](./06-roadmap-corto-plazo.md)
3. [docs/logger-design.md](../logger-design.md)
4. [docs/sanitizer-design.md](../sanitizer-design.md)
