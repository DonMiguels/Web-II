# Estandar BO Transversal (Fase 4)

Fecha: 26-03-2026
Estado: propuesta aplicable desde esta iteracion

## 1. Objetivo

Unificar reglas de implementacion para todos los BO publicos, reduciendo desviaciones en:

1. Contrato de error.
2. Observabilidad.
3. Politica de borrado.
4. Metadatos temporales.

## 2. Contrato minimo de respuesta por dispatcher/security

## 2.1 Exito

Respuesta minima esperada:

1. statusCode: 200
2. data: payload de negocio
3. message: texto de estado
4. observability:
   - process_name
   - transaction_id
   - status_code
   - duration_ms

## 2.2 Error

Respuesta minima esperada:

1. statusCode: codigo HTTP de dominio
2. code: codigo de dominio estandar
3. message: mensaje funcional
4. error:
   - code
   - details
5. observability:
   - process_name
   - transaction_id
   - status_code
   - duration_ms

## 2.3 Catalogo de codigos de dominio

Usar DOMAIN_ERROR_CODES en todos los casos:

1. HARD_DELETE_BLOCKED
2. VALIDATION_ERROR
3. NOT_FOUND
4. CONFLICT
5. UNEXPECTED_ERROR

## 3. Politica de borrado

## 3.1 Entidades historicas operativas

No hard-delete en BO publico para:

1. Loan / Prestamo
2. Return / Devolucion
3. Notification / Notificacion
4. Audit / Auditoria

Implementacion obligatoria:

1. Bloqueo explicito con HARD_DELETE_BLOCKED.
2. Cobertura de prueba de contrato via Security.execute.

## 3.2 Entidades maestras con deleted_at

Aplicar baja logica estandar:

1. UPDATE ... SET deleted_at = NOW(), updated_at = NOW()
2. Guardias: AND deleted_at IS NULL
3. Lecturas: WHERE deleted_at IS NULL

## 4. Metadatos temporales

Para entidades maestras nuevas o migradas:

1. created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
2. updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
3. deleted_at TIMESTAMPTZ (cuando aplique soft-delete)
4. Trigger set_updated_at activo en tablas incluidas en politica.

## 5. Criterios de revision tecnica (pull request)

Todo cambio BO debe verificar:

1. Query de escritura actualiza updated_at.
2. Query de lectura respeta deleted_at IS NULL cuando aplique.
3. Si hay delete, justificar si pertenece a whitelist aprobada.
4. Contrato Security.execute estable para exito y error.
5. Pruebas de gobernanza Fase 4 en verde.

## 6. Enforcements actualmente activos

1. backend/testing/tests/bo/bo-phase4-governance.test.mjs:
   - hard-delete bloqueado en entidades historicas.
   - soft-delete validado para componentes e inventario.
   - whitelist de DELETE residual controlada.
   - contrato Security.execute validado para 404 y 409.
2. backend/testing/tests/session/test_session_sanitizer.js:
   - credenciales de sesion con simbolos validos sin falsos positivos.

## 7. Pendientes para cierre total de Fase 4

1. Formalizar whitelist aprobada por negocio/arquitectura en CI.
2. Completar homogeneizacion de contratos en CRUD legacy fuera del camino publico BO.
3. Publicar matriz trazable Requerimiento -> Metodo BO -> Query -> Test.
