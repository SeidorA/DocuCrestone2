import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Cargar variables de .env.local o .env
function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local');
  const envExamplePath = path.join(projectRoot, '.env');
  const targetPath = fs.existsSync(envPath) ? envPath : (fs.existsSync(envExamplePath) ? envExamplePath : null);

  const env = {
    NEXT_PUBLIC_PRODUCT_SLUG: 'docuportal',
    NEXT_PUBLIC_PORTAL_URL: '',
  };

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

async function syncDocs() {
  const env = loadEnv();
  const productSlug = process.env.NEXT_PUBLIC_PRODUCT_SLUG || env.NEXT_PUBLIC_PRODUCT_SLUG || 'docuportal';
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || env.NEXT_PUBLIC_PORTAL_URL;

  if (!portalUrl) {
    console.error('\x1b[31m✖ Error:\x1b[0m No se ha definido NEXT_PUBLIC_PORTAL_URL en .env.local');
    console.error('Por favor, crea o edita .env.local con la URL de Portal CMS.');
    process.exit(1);
  }

  const docsEndpoint = `${portalUrl}/api/public/docs?product=${encodeURIComponent(productSlug)}&include_content=true`;
  const blogEndpoint = `${portalUrl}/api/public/blog?product=${encodeURIComponent(productSlug)}`;
  const releasesEndpoint = `${portalUrl}/api/public/releases?product=${encodeURIComponent(productSlug)}`;

  console.log('🔄 Iniciando sincronización de documentación desde Portal CMS...');
  console.log(`📦 Producto: \x1b[36m${productSlug}\x1b[0m`);
  console.log(`🌐 Servidor: \x1b[34m${portalUrl}\x1b[0m`);
  console.log(`📡 Endpoint Docs: ${docsEndpoint}\n`);

  try {
    const startTime = Date.now();
    const headers = { Accept: 'application/json' };

    const [docsRes, blogRes, releasesRes] = await Promise.all([
      fetch(docsEndpoint, { headers }).catch((e) => {
        console.warn('\x1b[33m⚠ Advertencia:\x1b[0m No se pudo conectar al endpoint de docs:', e.message);
        return null;
      }),
      fetch(blogEndpoint, { headers }).catch(() => null),
      fetch(releasesEndpoint, { headers }).catch(() => null),
    ]);

    if (!docsRes || !docsRes.ok) {
      throw new Error(`HTTP Error ${docsRes ? docsRes.status : 'Network error'}: ${docsRes ? docsRes.statusText : 'No se pudo conectar'}`);
    }

    const data = await docsRes.json();

    if (!data.success && !data.product) {
      throw new Error(data.error || 'La respuesta de la API no contiene datos válidos del producto');
    }

    if (!data.technical_docs) {
      data.technical_docs = {};
    }

    // Merge blog
    if (blogRes && blogRes.ok) {
      try {
        const blogData = await blogRes.json();
        if (blogData && Array.isArray(blogData.posts)) {
          data.technical_docs.blog = blogData.posts;
        }
      } catch {}
    }

    // Merge releases
    if (releasesRes && releasesRes.ok) {
      try {
        const relData = await releasesRes.json();
        if (relData && Array.isArray(relData.releases)) {
          data.technical_docs.releases = relData.releases;
        }
      } catch {}
    }

    // Crear directorio data/ si no existe
    const dataDir = path.join(projectRoot, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Guardar copia local en data/docs-cache.json
    const cacheFilePath = path.join(dataDir, 'docs-cache.json');
    fs.writeFileSync(cacheFilePath, JSON.stringify(data, null, 2), 'utf8');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const docsCount = data.total_documents || (data.documents ? data.documents.length : 0);
    const modulesCount = data.modules ? data.modules.length : 0;
    const blogCount = data.technical_docs?.blog?.length || 0;
    const releasesCount = data.technical_docs?.releases?.length || 0;

    console.log(`\x1b[32m✔ Sincronización completada con éxito en ${duration}s!\x1b[0m`);
    console.log(`📄 Documentos sincronizados: \x1b[33m${docsCount}\x1b[0m`);
    console.log(`📂 Módulos recibidos: \x1b[33m${modulesCount}\x1b[0m`);
    console.log(`📰 Artículos de Blog: \x1b[33m${blogCount}\x1b[0m`);
    console.log(`🚀 Release Notes: \x1b[33m${releasesCount}\x1b[0m`);
    console.log(`💾 Guardado localmente en: \x1b[35m${path.relative(projectRoot, cacheFilePath)}\x1b[0m\n`);
  } catch (error) {
    console.error('\x1b[31m✖ Error al sincronizar con Portal CMS:\x1b[0m', error.message);
    process.exit(1);
  }
}

syncDocs();
