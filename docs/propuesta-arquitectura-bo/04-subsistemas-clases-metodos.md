# Catalogo Exhaustivo de Subsistemas, Clases y Metodos

## Indice

1. [Objetivo](#objetivo)
2. [Convenciones de diseno](#convenciones-de-diseno)
3. [Subsistema SecurityAccess](#subsistema-securityaccess)
4. [Subsistema CatalogInventory](#subsistema-cataloginventory)
5. [Subsistema LoanReservation](#subsistema-loanreservation)
6. [Subsistema ReturnCompensation](#subsistema-returncompensation)
7. [Subsistema Maintenance](#subsistema-maintenance)
8. [Subsistema LocationManagement](#subsistema-locationmanagement)
9. [Subsistema Notification](#subsistema-notification)
10. [Subsistema Reporting](#subsistema-reporting)
11. [Subsistema AuditTrace](#subsistema-audittrace)
12. [Subsistema AcademicPeriod](#subsistema-academicperiod)
13. [Subsistema DispatcherGateway](#subsistema-dispatchergateway)
14. [Matriz de ownership y dependencia](#matriz-de-ownership-y-dependencia)
15. [Referencias](#referencias)

## Objetivo

Definir la estructura tecnica objetivo del backend, detallando unidades funcionales, responsabilidades y limites de cada componente.

## Convenciones de diseno

1. Metodos publicos exponen capacidades de negocio.
2. Metodos privados encapsulan invariantes, validaciones y detalles internos.
3. Servicios de clase no comparten estado mutable global.
4. Metodos por clase en `src/bo/<Subsystem>/<Class>/methods` son stateless.
5. La comunicacion entre subsistemas pasa por casos de uso o eventos.

## Subsistema SecurityAccess

### Clases

1. AuthSessionService.
2. AuthorizationService.
3. ProfileAssignmentService.
4. PermissionSyncService.

### Metodos publicos

1. login.
2. logout.
3. refreshSession.
4. authorizeTransaction.
5. assignProfileToUser.
6. revokeProfileFromUser.
7. syncPermissionsFromSource.

### Metodos privados

1. #resolveUserIdentity.
2. #buildPermissionKey.
3. #loadUserProfilesCache.
4. #loadTransactionsCache.
5. #validateSessionHardRules.

### Dependencias

1. user, profile, user_profile, method_profile, transaction.
2. Session wrapper y sanitizer.

## Subsistema CatalogInventory

### Clases

1. CategoryService.
2. ItemService.
3. FeatureService.
4. InventoryService.
5. ConditionStateService.

### Metodos publicos

1. createCategory.
2. updateCategory.
3. registerItem.
4. updateItemCoreData.
5. setItemCondition.
6. attachFeatureToItem.
7. adjustInventory.
8. transferInventoryBetweenLocations.

### Metodos privados

1. #validateCategoryType.
2. #validateItemCostRules.
3. #computeNewStock.
4. #ensureConditionTransitionAllowed.
5. #guardSoftDeleteConstraints.

### Dependencias

1. category, category_type, item, feature, item_feature, inventory, condition_status_type.

## Subsistema LoanReservation

### Clases

1. LoanService.
2. ReservationService.
3. LoanPolicyService.
4. LoanLifecycleService.

### Metodos publicos

1. createReservation.
2. convertReservationToLoan.
3. createDirectLoan.
4. renewLoan.
5. markLoanOverdue.
6. cancelReservation.

### Metodos privados

1. #assertUserSolvency.
2. #assertInventoryAvailability.
3. #calculateEstimatedReturnDate.
4. #lockInventoryRowsForMovement.
5. #emitLoanCreatedEvent.

### Dependencias

1. movement, movement_detail, movement_type, period, user, inventory.

## Subsistema ReturnCompensation

### Clases

1. ReturnService.
2. ReturnStatusService.
3. CompensationService.
4. FinePolicyService.

### Metodos publicos

1. registerReturn.
2. classifyReturnStatus.
3. createCompensationRecord.
4. settleCompensation.
5. recalculateUserSolvency.

### Metodos privados

1. #evaluateDelay.
2. #evaluateDamageOrLoss.
3. #computeCompensationAmount.
4. #applyPaymentMethodRules.
5. #closeMovementLifecycle.

### Dependencias

1. return_status, return_status_type, compensation, payment_method_type, movement_detail, user.

## Subsistema Maintenance

### Clases

1. EquipmentMaintenanceService.
2. ComponentMaintenanceService.
3. MaintenancePlanningService.
4. MaintenanceCostPolicyService.

### Metodos publicos

1. openMaintenance.
2. startMaintenance.
3. closeMaintenance.
4. registerMaintenanceCost.
5. schedulePreventiveMaintenance.

### Metodos privados

1. #ensureItemInMaintenableState.
2. #validateMaintenanceWindow.
3. #updateConditionAfterMaintenance.
4. #auditMaintenanceTransition.

### Dependencias

1. maintenance_log, item, inventory, user, condition_status_type.

## Subsistema LocationManagement

### Clases

1. LocationTypeService.
2. LocationService.
3. LocationHierarchyService.

### Metodos publicos

1. createLocation.
2. moveLocationNode.
3. assignInventoryToLocation.
4. deactivateLocation.

### Metodos privados

1. #preventHierarchyCycles.
2. #validateLocationTypeCompatibility.
3. #cascadeLogicalRules.

### Dependencias

1. location, location_type, inventory.

## Subsistema Notification

### Clases

1. NotificationService.
2. ReminderService.
3. DelayAlertService.
4. NotificationTemplateService.

### Metodos publicos

1. queueReturnReminder.
2. queueDelayAlert.
3. markNotificationRead.
4. resendNotification.

### Metodos privados

1. #buildNotificationPayload.
2. #resolveNotificationType.
3. #deduplicatePendingNotification.
4. #applyRateLimitPerUser.

### Dependencias

1. notification, notification_type, user, movement.

## Subsistema Reporting

### Clases

1. SolvencyReportService.
2. DebtorsReportService.
3. LoanStatsReportService.
4. ReportExportService.

### Metodos publicos

1. generateSolvencyReport.
2. generateDebtorsReport.
3. generateLoanStatsByPeriod.
4. exportReport.

### Metodos privados

1. #buildReportFilters.
2. #normalizeDateWindow.
3. #aggregateLoanMetrics.
4. #maskSensitiveColumns.

### Dependencias

1. user, movement, movement_detail, compensation, period.

## Subsistema AuditTrace

### Clases

1. AuditEventService.
2. SecurityAuditService.
3. BusinessAuditService.
4. SystemAuditService.

### Metodos publicos

1. recordSecurityEvent.
2. recordBusinessEvent.
3. recordSystemEvent.
4. queryAuditTrail.

### Metodos privados

1. #sanitizeAuditPayload.
2. #classifyAuditSeverity.
3. #bindRequestCorrelation.

### Dependencias

1. audit, audit_type, user.

## Subsistema AcademicPeriod

### Clases

1. PeriodService.
2. PeriodTypeService.
3. PeriodPolicyService.

### Metodos publicos

1. createPeriod.
2. activatePeriod.
3. closePeriod.
4. validateOperationWithinPeriod.

### Metodos privados

1. #ensureNoOverlappingPeriods.
2. #enforceSingleActivePeriod.
3. #propagatePeriodStateToPolicies.

### Dependencias

1. period, period_type, movement.

## Subsistema DispatcherGateway

### Clases

1. DispatchOrchestrator.
2. ExecutableResolverService.
3. DispatchContractValidator.

### Metodos publicos

1. dispatchTransaction.
2. resolveExecutable.
3. validateDispatchPayload.

### Metodos privados

1. #resolveRouteByTransactionId.
2. #guardReflectionInvocation.
3. #mapDomainErrorToTransport.

### Dependencias

1. transaction, method_registry, method_resolver, security.

## Matriz de ownership y dependencia

| Subsistema         | Owner primario    | Consume                               | Expone                |
| ------------------ | ----------------- | ------------------------------------- | --------------------- |
| SecurityAccess     | Seguridad         | Session, user_profile, method_profile | authorizeTransaction  |
| CatalogInventory   | Inventario        | item, inventory, location             | adjustInventory       |
| LoanReservation    | Operaciones       | movement, inventory, user             | createDirectLoan      |
| ReturnCompensation | Operaciones       | return_status, compensation           | registerReturn        |
| Maintenance        | Soporte tecnico   | maintenance_log, item                 | openMaintenance       |
| LocationManagement | Inventario        | location, inventory                   | moveLocationNode      |
| Notification       | Comunicacion      | notification, movement                | queueDelayAlert       |
| Reporting          | Analitica         | movement, compensation, user          | generateDebtorsReport |
| AuditTrace         | Cumplimiento      | audit                                 | recordBusinessEvent   |
| AcademicPeriod     | Gestion academica | period                                | activatePeriod        |
| DispatcherGateway  | Plataforma        | security, bo resolver                 | dispatchTransaction   |

## Referencias

1. [03-arquitectura-objetivo-clean.md](./03-arquitectura-objetivo-clean.md)
2. [05-estados-internos-y-privacidad.md](./05-estados-internos-y-privacidad.md)
3. [06-roadmap-corto-plazo.md](./06-roadmap-corto-plazo.md)
