import SecurityService from './service/security_service.js';
import Config from './config/config.js';

async function testExecuteAuthorized() {
    console.log('🧪 Probando executeAuthorized con validación de perfiles...\n');
    
    try {
        // 1. Inicializar el SecurityService
        const security = new SecurityService();
        await security.syncPermissions();
        
        // 2. Probar verificación de perfiles
        const testUserId = 'testuser';
        const testProfile = 'admin';
        
        console.log('👤 Agregando perfil de prueba...');
        await security.setUserProfile(testUserId, testProfile);
        
        console.log('✅ Verificando perfil asignado:', security.hasUserProfile(testUserId, testProfile));
        console.log('❌ Verificando perfil no asignado:', security.hasUserProfile(testUserId, 'nonexistent'));
        
        // 3. Crear un permiso de prueba (debe existir en permission.csv)
        const testPermission = {
            sub_system: 'Security',
            class: 'Person', 
            method: 'createPerson',
            profile: 'admin',
            parameter: {
                ci: '12345678',
                name: 'Test',
                lastname: 'User',
                email: 'test@example.com',
                phone: '04121234567'
            }
        };
        
        console.log('\n📋 Permiso de prueba:', testPermission);
        
        // 4. Verificar que el permiso exista
        const hasPermission = security.hasPermission(testPermission);
        console.log('✅ Permiso existe:', hasPermission);
        
        if (!hasPermission) {
            console.log('❌ El permiso no existe en permission.csv');
            return;
        }
        
        // 5. Ejecutar el método autorizado
        console.log('\n🚀 Ejecutando método autorizado...');
        const result = await security.executeAuthorized(testPermission);
        
        console.log('\n📊 Resultado:', JSON.stringify(result, null, 2));
        
        if (result.statusCode === 200) {
            console.log('✅ Método ejecutado exitosamente');
        } else {
            console.log('❌ Error en la ejecución:', result.error);
        }
        
        // 6. Mostrar mapa de perfiles en memoria
        console.log('\n🗺️ Mapa de perfiles en memoria:');
        for (const [userId, profiles] of security.userProfiles) {
            console.log(`  ${userId}: [${Array.from(profiles).join(', ')}]`);
        }
        
    } catch (error) {
        console.error('💥 Error en la prueba:', error.message);
    }
}

// Ejecutar la prueba
testExecuteAuthorized();
