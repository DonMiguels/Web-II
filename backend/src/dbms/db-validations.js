/**
 * @file Validaciones de unicidad de usuario en base de datos.
 * @description Comprueba si un email o username ya están registrados mediante consultas nombradas.
 */

/**
 * @description Verifica si un correo electrónico ya está en uso.
 * @param {string} email - Correo a comprobar.
 * @param {Object} dbmsInstance - Instancia de DBMS con `executeNamedQuery` (e `init` opcional).
 * @returns {Promise<string>} Mensaje de error si está en uso, o cadena vacía si está disponible.
 */
export async function checkEmailInUse(email, dbmsInstance) {
  let emailInUse = false;
  if (dbmsInstance && typeof dbmsInstance.executeNamedQuery === 'function') {
    try {
      if (typeof dbmsInstance.init === 'function' && !dbmsInstance.queries) {
        await dbmsInstance.init();
      }
      const result = await dbmsInstance.executeNamedQuery({
        nameQuery: 'countUserByEmail',
        params: { email },
      });
      if (Number(result?.rows?.[0]?.count || 0) > 0) emailInUse = true;
    } catch (err) {
      console.error('Error checking email existence:', err);
    }
  }

  if (emailInUse) return 'El email ya está en uso.';
  return '';
}

/**
 * @description Verifica si un nombre de usuario ya está en uso.
 * @param {string} username - Nombre de usuario a comprobar.
 * @param {Object} dbmsInstance - Instancia de DBMS con `executeNamedQuery` (e `init` opcional).
 * @returns {Promise<string|undefined>} Mensaje de error si está en uso o si falla la validación; `undefined` si está disponible.
 */
export async function checkUsernameInUse(username, dbmsInstance) {
  if (dbmsInstance && typeof dbmsInstance.executeNamedQuery === 'function') {
    try {
      if (typeof dbmsInstance.init === 'function' && !dbmsInstance.queries) {
        await dbmsInstance.init();
      }
      const result = await dbmsInstance.executeNamedQuery({
        nameQuery: 'countUserByUsername',
        params: { username },
      });
      const userExists = Number(result?.rows?.[0]?.count || 0) > 0;
      if (userExists) {
        return 'El nombre de usuario ya está en uso.';
      }
    } catch (err) {
      console.error('Error checking username existence:', err);
      return 'Error al validar el nombre de usuario.';
    }
  }
}
