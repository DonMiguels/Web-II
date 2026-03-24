# Sanitizer Component - Architecture and Usage Guide

## Purpose

The sanitizer component protects request payloads before business validation and processing.

Main goals:

- Normalize benign input formatting consistently.
- Block payloads that match deny security patterns.
- Detect and redact potentially sensitive data when not explicitly allowed by route.
- Keep route behavior declarative via config files.
- Return deterministic metadata for auditing and diagnostics.

## File Structure

Core files:

- `backend/src/sanitizer/sanitizer.js`
- `backend/config/sanitizer/sanitize-rules.js`
- `backend/config/sanitizer/sanitize-regex.js`

Current integration points:

- `backend/src/session/sessionRoutes.js`
- `backend/src/dispatcher/dispatcherRoutes.js`

## High-Level Flow

`sanitizePayload` executes this pipeline:

- Load route config using `routeKey`.
- Merge route-level and call-level `forceIncludePaths`.
- Force include selected paths from original payload copy.
- Recursively walk objects, arrays, and strings.
- Apply string transforms.
- Evaluate deny patterns.
- Evaluate sensitive property/value heuristics.
- Build result metadata.
- Return sanitized payload and rejection contract.

## Configuration Model

### `sanitize-rules.js` root properties

- `version`: version marker for rule contract.
- `behavior`: runtime toggles and safety limits.
- `defaults`: baseline string transforms.
- `denyPatternKeysGlobal`: deny regex keys applied to all string fields.
- `sensitivePropertyPolicy`: sensitive data detection and redaction policy.
- `routeMaps`: per-route force include and field rules.
- `responsePolicy`: response contract for sanitizer rejections.
- `auditPolicy`: sanitizer logging controls.

### `behavior` properties

- `rejectOnDenyPattern`:
  - `true`: deny match causes rejection.
  - `false`: continue with sanitized output.
- `sanitizeUnknownFields`: policy flag for unknown fields.
- `normalizeUnknownStrings`: apply default transforms to unknown string fields.
- `maxDepth`: recursion guard.
- `maxStringLength`: post-transform truncation limit.

### `defaults` properties

- `trim`
- `normalizeSpaces`
- `stripHtml`
- `toLowerCase`
- `toUpperCase`

### `sensitivePropertyPolicy` properties

- `propertyNameRuleKeys`: detect-sensitive-by-name rules.
- `valueHeuristicRuleKeys`: detect-sensitive-by-value rules.
- `redactReplacement`: replacement value when sensitive path is not allowed.
- `allowSensitivePathsByRoute`: explicit per-route allowlist.

### `routeMaps` structure

Each route supports:

- `forceIncludePaths`: dot-notation paths copied before sanitization.
- `fields`: top-level field overrides.

Each field override may include:

- `trim`
- `normalizeSpaces`
- `stripHtml`
- `toLowerCase`
- `toUpperCase`
- `applyGlobalDenyPatterns`: when `false`, global deny keys are not applied to that field.
- `denyPatternKeys`

### `responsePolicy` properties

- `statusCode`
- `errorCode`
- `message`
- `includeFields`
- `includeRuleKey`

### `auditPolicy` properties

- `enabled`
- `logChangedFields`
- `logDeniedRules`
- `logRouteKey`
- `logValues`

## Regex Catalog Model

Each `sanitize-regex.js` entry has:

- `key`: unique identifier.
- `pattern`: regex source string.
- `flags`: regex flags.
- `mode`: `deny` or `detect`.
- `target`: `value` or `property`.
- `description`: rule intent.

Deny rules (blocking examples):

- `username_whitespace`
- `xss_script_tag`
- `xss_javascript_protocol`
- `xss_inline_handler`
- `control_chars`
- `sql_union_select`
- `sql_comment_sequence`
- `command_injection_chain`
- `path_traversal`

Detect rules (redaction heuristics examples):

- `sensitive_property_name`
- `sensitive_jwt_value`
- `sensitive_bearer_token`
- `sensitive_private_key_block`
- `sensitive_high_entropy_keylike`
- `sensitive_credit_card_like`
- `sensitive_iban_like`
- `sensitive_email_like`
- `sensitive_phone_like`

## Public API

### `createSanitizer()`

Purpose:

- Compile regex catalog once.
- Return sanitizer runtime API.

Input:

- None.

Output:

- Object with method `sanitizePayload(payload, options)`.

### `sanitizePayload(payload, options = {})`

Purpose:

- Sanitize one payload according to route and global policy.

Input:

- `payload`: expected plain object. Non-plain values are coerced to `{}`.
- `options.routeKey`: string route identifier.
- `options.forceIncludePaths`: optional string array in dot notation.

Output:

- `cleanedPayload`: sanitized payload object.
- `changedFields`: string array of modified field paths.
- `deniedMatches`: array of `{ field, ruleKey, description }`.
- `rejected`: boolean rejection decision.
- `forcedIncluded`: final forced paths used.
- `sanitizedAfterForce`: forced paths later modified by sanitization.
- `response`: rejection response object.

`response` shape:

- `statusCode`
- `code`
- `message`
- `fields`
- `rules`

## Internal Methods (Implementation Reference)

Helpers:

- `isPlainObject(value) -> boolean`
- `normalizeSpaces(value) -> string`
- `stripHtml(value) -> string`
- `cloneDeep(value) -> any`
- `toPathParts(pathValue) -> string[]`
- `hasPath(source, pathValue) -> boolean`
- `getPath(source, pathValue) -> any | undefined`
- `setPath(target, pathValue, newValue) -> void`
- `shouldApplyStringDefaults(rules) -> boolean`

Runtime closures:

- `getRouteRules(routeKey) -> object`
- `evaluateRegexKeys({ regexKeys, targetValue, fieldPath, deniedMatches }) -> string[]`
- `isSensitiveByPropertyName(propertyName) -> string | null`
- `isSensitiveByValue(value) -> string | null`
- `applyStringTransforms(value, rules) -> string`
- `applyForceIncludePaths({ sourcePayload, targetPayload, forceIncludePaths, forcedIncluded }) -> void`

## Force Include Precedence

Actual behavior:

- Force include runs first.
- Full sanitization runs after force include.
- Forced fields are still sanitized and can still trigger deny rules.
- `sanitizedAfterForce` records forced fields later modified.

Security implication:

- Force include never bypasses sanitization controls.

Field-level precedence:

- `denyPatternKeysGlobal` is applied by default.
- A field can disable global deny keys with `applyGlobalDenyPatterns: false`.
- Route/field `denyPatternKeys` are always applied.

## Session Integration

File:

- `backend/src/session/sessionRoutes.js`

Route keys currently used:

- `session.register`
- `session.login`
- `session.forgotPassword`
- `session.resetPassword`

Per-route flow:

- Execute sanitizer through `sanitizeOrReject`.
- Replace `req.body` with `cleanedPayload`.
- If rejected, return sanitizer response immediately.
- Else continue existing validator checks and business flow.

Current security policy for session credentials:

- Session input allows sensitive credentials for internal auth flow.
- Password fields in `session.register`, `session.login`, and `session.resetPassword` disable global deny keys and only reject `control_chars`.
- Session responses still use response route keys and keep sensitive redaction enabled.

## Dispatcher Integration

File:

- `backend/src/dispatcher/dispatcherRoutes.js`

Flow:

- Execute `sanitizePayload` with route key `dispatcher.root`.
- Replace `req.body` with `cleanedPayload`.
- Return configured 400 only on deny-pattern rejection.
- Allow benign normalization and continue dispatcher processing.

## Examples

### Username with whitespace (rejected)

Input:

```json
{
  "username": "john doe",
  "password": "P@ssw0rd!",
  "person_id": 1
}
```

Expected result highlights:

- `deniedMatches` includes `username_whitespace` on `username`.
- `rejected` is `true`.
- Response code is `INVALID_INPUT_SANITIZATION`.

### Benign normalization (allowed)

Input:

```json
{
  "email": "  USER@Example.COM  "
}
```

Route:

- `session.forgotPassword`

Expected result highlights:

- `cleanedPayload.email` becomes `user@example.com`.
- `rejected` remains `false` when no deny pattern is matched.

### Login password with `#` (allowed)

Input:

```json
{
  "username": "super_admin",
  "password": "Admin123!@#"
}
```

Route:

- `session.login`

Expected result highlights:

- Password is preserved as-is for authentication.
- No rejection is triggered by `sql_comment_sequence` for this field.
- Rejection remains active for control chars and non-password risky fields.

### Sensitive redaction by policy

Input:

```json
{
  "api_key": "abcd1234secret"
}
```

Route:

- `dispatcher.root`

Expected result highlights:

- Property is detected as sensitive.
- Value is replaced with `[REDACTED]` unless path is allowlisted.
- Request can continue if deny patterns were not matched.

## Operational Guidelines

- Add new regex only in `sanitize-regex.js`.
- Reference regex keys from `sanitize-rules.js`.
- Keep route rules explicit and minimal.
- Prefer per-field overrides for high-risk fields.
- Do not log raw sensitive values.

## Known Limitations

- `sanitizeUnknownFields` is currently informational and does not short-circuit traversal.
- Dot-path array handling in force include is basic.
- Detect rules may produce false positives in some domains.
- Regex-only heuristics can be improved with typed schema context.

## Team Adoption Checklist

- Add route key under `routeMaps`.
- Add field-level overrides and deny keys.
- Add allowlist sensitive paths only when required.
- Integrate sanitizer call before business validator.
- Add tests for deny rejection, benign normalization, redaction, and force-include precedence.

## Regression Test Command

Run the session sanitizer regression suite:

```bash
npm --prefix backend run test:session-sanitizer
```

Run the session HTTP validation suite (backend must be running):

```bash
npm --prefix backend run test:session-http
```
