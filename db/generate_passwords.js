import bcrypt from 'bcrypt';
import readline from 'readline';


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function generatePasswordHashes() {
  console.log(' Generador de hashes bcrypt para usuarios\n');
  
 
  const username = await askQuestion(' Ingresa el nombre de usuario: ');
  
  
  const password = await askQuestion(' Ingresa la contraseña a hashear: ');
  
  if (!username || !password) {
    console.log(' Error: Debes ingresar usuario y contraseña');
    rl.close();
    return;
  }
  
  console.log('\n Generando hash...\n');
  
  try {
    const hash = await bcrypt.hash(password, 10);
    
    console.log(' Hash generado exitosamente!\n');
    console.log(' Resultado:');
    console.log(` Usuario: ${username}`);
    console.log(` Contraseña: ${password}`);
    console.log(` Hash: ${hash}`);
    console.log('');
    
    // Generar SQL UPDATE statement
    const sqlUpdate = `UPDATE public.user SET user_password = '${hash}' WHERE user_name = '${username}';`;
    console.log(' SQL para actualizar base de datos:');
    console.log(sqlUpdate);
    console.log('');
    
    
    const another = await askQuestion('¿Quieres generar otro hash? (s/n): ');
    if (another.toLowerCase() === 's') {
      console.log('\n' + '='.repeat(50) + '\n');
      await generatePasswordHashes();
    } else {
      console.log('\n Adiós!');
      rl.close();
    }
    
  } catch (error) {
    console.log(' Error generando hash:', error.message);
    rl.close();
  }
}

// Iniciar el proceso
generatePasswordHashes().catch(console.error);
