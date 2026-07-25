/**
 * Reglas de seguridad para validar entradas de formularios en el cliente.
 * Detecta patrones potencialmente peligrosos (SQL/script) en cadenas de texto.
 */
export const SecurityRules = {
  /** Expresión regular de patrones considerados peligrosos. */
  dangerousPatterns: /\b(union|select|insert|update|delete|drop|script|eval)\b/i,

  /**
   * Indica si un valor es seguro (no contiene patrones peligrosos).
   *
   * @param {string} val - Valor a evaluar.
   * @returns {boolean} `true` si es seguro o está vacío; `false` si es peligroso.
   */
  isSafe: (val) => {
    if (!val) return true;

    const isDangerous = SecurityRules.dangerousPatterns.test(val);

    console.log(`Input: ${val} | ¿Es peligroso?: ${isDangerous}`);

    return !isDangerous;
  },
};