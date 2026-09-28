import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ngrok from '@ngrok/ngrok';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Cargar variables de .env.local o .env
function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local');
  const envExamplePath = path.join(projectRoot, '.env');
  const targetPath = fs.existsSync(envPath) ? envPath : (fs.existsSync(envExamplePath) ? envExamplePath : null);

  const env = {};
  if (targetPath) {
    const content = fs.readFileSync(targetPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
  return env;
}

async function startTunnel() {
  const env = loadEnv();
  const authtoken =
    process.env.NGROK_AUTHTOKEN ||
    env.NGROK_AUTHTOKEN ||
    '3JmRbUtqqG9uzbHHDnGE8BKdbgt_4XDfbkRHdPGqLy1djz8wn';

  const port = Number(process.env.PORT || env.PORT || 3000);
  const webhookSecret = process.env.PORTAL_WEBHOOK_SECRET || env.PORTAL_WEBHOOK_SECRET || 'portal_webhook_secret_crestone';

  console.log('🚀 Iniciando túnel ngrok para desarrollo local...\n');

  try {
    const listener = await ngrok.forward({
      addr: port,
      authtoken: authtoken,
    });

    const publicUrl = listener.url();
    const webhookUrl = `${publicUrl}/api/webhook`;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌍 URL Pública (Frontend): \x1b[36m${publicUrl}\x1b[0m`);
    console.log(`🔗 Webhook Endpoint:       \x1b[32m${webhookUrl}\x1b[0m`);
    console.log(`🔑 Webhook Secret Token:   \x1b[33m${webhookSecret}\x1b[0m`);
    console.log(`🔌 Puerto Local:           \x1b[35mhttp://localhost:${port}\x1b[0m`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Túnel ngrok ACTIVO y escuchando conexiones.');
    console.log('💡 Pega la URL del Webhook y el Secret en Portal CMS.');
    console.log('⚠️  Mantén esta ventana de terminal abierta. Presiona Ctrl+C para detener.\n');

    // Mantener el bucle de eventos de Node.js activo de forma indefinida
    const keepAlive = setInterval(() => {}, 1000 * 60 * 60);

    const cleanup = async () => {
      clearInterval(keepAlive);
      console.log('\n🛑 Cerrando túnel ngrok...');
      try {
        await listener.close();
      } catch {}
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  } catch (error) {
    console.error('❌ Error al iniciar ngrok:', error.message || error);
    process.exit(1);
  }
}

startTunnel();
