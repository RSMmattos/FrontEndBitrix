// Este script converte arquivos .ts/.tsx para .js/.jsx e remove tipagens TypeScript.
// Execute este script com Node.js na raiz do projeto para automatizar a conversão.
// ATENÇÃO: Faça backup do projeto antes de rodar!

const fs = require('fs');
const path = require('path');

const exts = ['.ts', '.tsx'];
const jsExt = { '.ts': '.js', '.tsx': '.jsx' };

function walk(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (exts.includes(path.extname(file))) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

function stripTypescript(content) {
  // Remove tipos, interfaces, annotations e imports de types
  return content
    .replace(/: ?[A-Za-z0-9_\[\]\|<>?, ]+/g, '') // Remove tipagens simples
    .replace(/interface [^{]+{[^}]+}/g, '') // Remove interfaces
    .replace(/import [^;]+ from ['"][^'"]+['"];?/g, m => m.includes('.ts') ? '' : m) // Remove imports de types
    .replace(/ as [A-Za-z0-9_]+/g, '') // Remove 'as Tipo'
    .replace(/<([A-Za-z0-9_]+)>/g, '') // Remove generics
    .replace(/export type [^;]+;/g, '') // Remove export type
    .replace(/: ?React\.[A-Za-z0-9_]+/g, '') // Remove tipagens React
    .replace(/\bany\b/g, ''); // Remove 'any'
}

function convertFile(file) {
  const ext = path.extname(file);
  const newExt = jsExt[ext];
  const newFile = file.replace(ext, newExt);
  let content = fs.readFileSync(file, 'utf8');
  content = stripTypescript(content);
  fs.writeFileSync(newFile, content, 'utf8');
  fs.unlinkSync(file);
  console.log(`Convertido: ${file} -> ${newFile}`);
}

const root = process.cwd();
const files = walk(root);
files.forEach(convertFile);
console.log('Conversão concluída!');
