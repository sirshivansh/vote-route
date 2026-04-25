import { createServer } from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join, extname } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, './dist/server/server.js');
const serverUrl = pathToFileURL(serverPath).href;
const clientPath = resolve(__dirname, './dist/client');

const port = process.env.PORT || 8080;
const host = '0.0.0.0';

let appHandler = null;
let fatalError = null;
let status = "Initializing...";

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = createServer((req, res) => {
  // 1. Static Files (Fast path)
  const urlPath = req.url.split('?')[0];
  const possibleFile = join(clientPath, urlPath);
  
  if (urlPath !== '/' && existsSync(possibleFile) && !possibleFile.endsWith('/')) {
    const ext = extname(possibleFile).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    return createReadStream(possibleFile).pipe(res);
  }

  // 2. Fatal Error Report
  if (fatalError) {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<div style="font-family:sans-serif;padding:2rem;color:red;"><h1>🛑 App Crash</h1><pre>${fatalError.stack || fatalError}</pre></div>`);
    return;
  }

  // 3. Loading Screen
  if (!appHandler) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><meta http-equiv="refresh" content="2"></head>
        <body style="font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#f0f4f8; margin:0;">
          <div style="padding:3rem; background:white; border-radius:24px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align:center; max-width:500px;">
            <h1>🚀 VoteRoute</h1>
            <p>${status}</p>
            <div style="width:50px; height:50px; border:5px solid #eee; border-top-color:#3b82f6; border-radius:50%; animation:spin 1s linear infinite; margin:2rem auto;"></div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
          </div>
        </body>
      </html>
    `);
    return;
  }

  // 4. Run the App (Universal Web Adapter)
    // PRODUCTION SECURITY HEADERS
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.google-analytics.com https://*.googleapis.com https://*.r2.dev; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.google-analytics.com;");

    appHandler(req, res);
});

server.listen(port, host, () => {
  console.log(`✅ CONTAINER STABILIZED: http://${host}:${port}`);
  setTimeout(loadApp, 500);
});

async function loadApp() {
  try {
    status = "Reading server bundle...";
    const module = await import(serverUrl);
    status = "Unpacking application engine...";
    
    let raw = module.default || module;
    if (typeof raw.createServerEntry === 'function') {
      raw = raw.createServerEntry();
    }

    if (typeof raw === 'function') {
      appHandler = raw;
    } else if (raw.handler && typeof raw.handler === 'function') {
      appHandler = raw.handler;
    } else if (raw.handle && typeof raw.handle === 'function') {
      appHandler = raw.handle;
    } else if (raw.fetch && typeof raw.fetch === 'function') {
      console.log('⚡ Edge handler (.fetch) detected! Engaging Universal Web Adapter...');
      const fetchHandler = raw.fetch;
      
      appHandler = async (nodeReq, nodeRes) => {
        try {
          const url = new URL(nodeReq.url || '/', `http://${nodeReq.headers.host || 'localhost'}`);
          const headers = new Headers();
          for (let i = 0; i < nodeReq.rawHeaders.length; i += 2) {
            headers.append(nodeReq.rawHeaders[i], nodeReq.rawHeaders[i + 1]);
          }
          
          const init = { method: nodeReq.method, headers };
          if (nodeReq.method !== 'GET' && nodeReq.method !== 'HEAD') {
            init.body = nodeReq;
            init.duplex = 'half';
          }
          
          const request = new Request(url, init);
          const response = await fetchHandler(request);
          
          nodeRes.statusCode = response.status;
          response.headers.forEach((value, key) => nodeRes.setHeader(key, value));
          
          if (response.body) {
            const { Readable } = await import('node:stream');
            Readable.fromWeb(response.body).pipe(nodeRes);
          } else {
            nodeRes.end();
          }
        } catch (err) {
          console.error("Fetch Adapter Error:", err);
          if (!nodeRes.headersSent) {
             nodeRes.writeHead(500);
             nodeRes.end(err.stack || String(err));
          }
        }
      };
    }

    if (typeof appHandler !== 'function') {
       throw new Error(`Failed to find a Node function handler.`);
    }

    status = "Engine online.";
  } catch (err) {
    fatalError = err;
    console.error('❌ FATAL LOADING ERROR:', err);
  }
}
