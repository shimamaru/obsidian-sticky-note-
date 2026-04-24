const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 27184;
const VAULT_DIR = '/Users/shimataniyu/dev/My-vault/zettelkasten/01_journal';

function todayFilePath() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return path.join(VAULT_DIR, `${yyyy}-${mm}-${dd}.md`);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/append') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const text = body.trim();
      if (!text) {
        res.writeHead(400);
        res.end('empty');
        return;
      }
      const filePath = todayFilePath();
      const entry = `\n${text}`;
      fs.appendFile(filePath, entry, 'utf8', err => {
        if (err) {
          res.writeHead(500);
          res.end('error');
          return;
        }
        res.writeHead(200);
        res.end('ok');
      });
    });
    return;
  }

  if (req.method === 'PUT' && req.url === '/daily') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      fs.writeFile(todayFilePath(), body, 'utf8', err => {
        res.writeHead(err ? 500 : 200);
        res.end(err ? 'error' : 'ok');
      });
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/daily') {
    fs.readFile(todayFilePath(), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500);
        res.end('');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`obsidian-sticky server running on http://127.0.0.1:${PORT}`);
});
