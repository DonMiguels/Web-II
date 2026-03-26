# Preguntas de Decision y Aprobacion (Obligatorias)

## 1. Objetivo

Este documento consolida las decisiones que no deben asumirse tecnicamente sin aprobacion explicita del cliente/PO.

## 1.1 Estado

Version actualizada con respuestas del usuario al 26-03-2026.

## 2. Decisiones resueltas

| ID  | Decision aprobada                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------- |
| Q1  | El control de acceso cruzado de reportes se maneja unicamente por middleware.                                   |
| Q2  | El actor de jobs batch debe ser processed_by_user_id, inyectado por scheduler externo.                          |
| Q3  | La auditoria de jobs de notificaciones es obligatoria.                                                          |
| Q4  | Mantener rutas legacy de Loan/Return por 30 dias de transicion y luego bloquearlas, consolidando Process-first. |
| Q5  | Se permiten multiples periodos activos.                                                                         |
| Q6  | Fuente canonica de usuarios: Users. Security opera como replica.                                                |
| Q7  | Se implementa FSM dedicada para manejo formal de estados.                                                       |
| Q8  | DomainError es obligatorio en 100% de BO.                                                                       |

## 3. Q4 - Rutas legacy especificas solicitadas

## 3.1 Legacy de Loans/Loan (expuestos en clase Loan)

1. Loans/Loan/createLoan
2. Loans/Loan/getLoanById
3. Loans/Loan/getLoansByUser
4. Loans/Loan/getAllLoans
5. Loans/Loan/getActiveLoans
6. Loans/Loan/updateLoan
7. Loans/Loan/deleteLoan
8. Loans/Loan/getLoansByEquipment
9. Loans/Loan/getLoansByComponent

Estado de permisos actual: rutas activas principalmente para profile admin en permission.csv.

## 3.2 Legacy de Returns/Return (expuestos en clase Return)

1. Returns/Return/createReturn
2. Returns/Return/getReturnById
3. Returns/Return/getReturnsByUser
4. Returns/Return/getAllReturns
5. Returns/Return/updateReturn
6. Returns/Return/deleteReturn

Estado de permisos actual: estas rutas existen en BO, pero no se encontraron permisos activos equivalentes en permission.csv para exposicion operativa estandar.

## 3.3 Ruta canonica de proceso (objetivo)

1. Loans/LoanProcess/createLoanWithDetails
2. Loans/LoanProcess/renewLoan
3. Returns/ReturnProcess/registerReturn

## 4. Resolucion final de Q4

1. Politica aprobada: mantener temporalmente rutas legacy de Loan/Return durante 30 dias.
2. Politica de salida: bloqueo funcional posterior al dia 30 y consolidacion oficial de rutas Process-first.
3. Alcance de migracion: consumidores actuales deben moverse a LoanProcess/ReturnProcess dentro de la ventana.

## 5. Cierre de matriz y plan

Con la decision final de Q4 y la definicion de actor batch se congela la version final de:

1. Matriz de desarrollo cerrada.
2. Plan de implementacion con alcance congelado.
3. Checklist de validacion por criterio de salida.
