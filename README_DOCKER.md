# Deploy FrontBitrix com Docker

## Passos para rodar no Linux

1. **Build da imagem Docker:**
   ```sh
   docker build -t frontbitrix .
   ```

2. **Rodar o container:**
   ```sh
   docker run -d -p 80:80 --name frontbitrix frontbitrix
   ```

3. **Acessar no navegador:**
   - http://<IP_DO_SERVIDOR>

## Observações
- O build usa Node.js para compilar o projeto e Nginx para servir os arquivos estáticos.
- Se precisar integrar com backend/API, ajuste o bloco `location /api/` no nginx.conf.
- O arquivo `.dockerignore` garante que dependências e arquivos desnecessários não sejam copiados para a imagem.
