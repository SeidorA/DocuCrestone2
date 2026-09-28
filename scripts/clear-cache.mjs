import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function removeDirOrFile(targetPath, label) {
  if (fs.existsSync(targetPath)) {
    try {
      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`\x1b[32m✔ Eliminado directorio:\x1b[0m ${label} (\x1b[33m${path.relative(projectRoot, targetPath)}\x1b[0m)`);
      } else {
        fs.unlinkSync(targetPath);
        console.log(`\x1b[32m✔ Eliminado archivo:\x1b[0m ${label} (\x1b[33m${path.relative(projectRoot, targetPath)}\x1b[0m)`);
      }
      return true;
    } catch (err) {
      console.error(`\x1b[31m✖ Error al eliminar ${label}:\x1b[0m`, err.message);
      return false;
    }
  } else {
    console.log(`\x1b[90m○ No existe:\x1b[0m ${label} (ya estaba limpio)`);
    return false;
  }
}

function clearCache() {
  console.log('\n🧹 \x1b[1m\x1b[36mIniciando limpieza de caché en DocuPortal...\x1b[0m\n');

  const nextDir = path.join(projectRoot, '.next');
  const docsCacheFile = path.join(projectRoot, 'data', 'docs-cache.json');
  const turboDir = path.join(projectRoot, '.turbo');

  removeDirOrFile(nextDir, 'Caché de compilación Next.js (.next)');
  removeDirOrFile(turboDir, 'Caché de Turbopack (.turbo)');
  removeDirOrFile(docsCacheFile, 'Snapshot local de documentación (data/docs-cache.json)');

  console.log('\n\x1b[32m✨ ¡Caché limpiada con éxito!\x1b[0m');
  console.log('💡 Ejecuta \x1b[33mnpm run sync\x1b[0m para sincronizar de nuevo la documentación');
  console.log('   o ejecuta \x1b[33mnpm run dev\x1b[0m para iniciar el servidor en modo desarrollo.\n');
}

clearCache();
