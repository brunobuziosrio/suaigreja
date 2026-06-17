#!/bin/bash
set -e

echo "🚀 DEPLOY ROBUSTO - VERIFICANDO TUDO"

# 1. Verificar arquivos locais
echo "1️⃣  Verificando arquivos locais..."
REQUIRED_FILES=(
  "tailwind.config.js"
  "vite.config.ts"
  "src/styles.css"
  "src/components/ui/select.tsx"
  "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ ERRO: Arquivo $file não existe!"
    exit 1
  fi
  echo "  ✅ $file"
done

# 2. Build
echo -e "\n2️⃣  Fazendo build..."
bun run build 2>&1 | grep "built in"

# 3. Criar tar (apenas arquivos necessários)
echo -e "\n3️⃣  Empacotando..."
tar czf /tmp/deploy-package.tar.gz \
  dist/ \
  tailwind.config.js \
  vite.config.ts \
  src/styles.css
echo "  ✅ Pacote criado: $(ls -lh /tmp/deploy-package.tar.gz | awk '{print $5}')"

# 4. Enviar para servidor
echo -e "\n4️⃣  Enviando para servidor..."
scp -i ~/.ssh/servidor_site /tmp/deploy-package.tar.gz root@178.156.241.183:/tmp/
echo "  ✅ Enviado"

# 5. Extrair e colocar no lugar certo
echo -e "\n5️⃣  Atualizando no servidor..."
ssh -i ~/.ssh/servidor_site root@178.156.241.183 "
  cd /opt/igreja/app && \
  rm -rf dist && \
  cd /tmp && \
  tar xzf deploy-package.tar.gz && \
  cp -r dist /opt/igreja/app/ && \
  cp tailwind.config.js vite.config.ts /opt/igreja/app/ && \
  cp src/styles.css /opt/igreja/app/src/ && \
  ls -lh /opt/igreja/app/tailwind.config.js && \
  echo '✅ Arquivos no servidor confirmados'
"

# 6. Restart Docker
echo -e "\n6️⃣  Reiniciando Docker..."
ssh -i ~/.ssh/servidor_site root@178.156.241.183 "
  docker restart igreja-app && \
  sleep 5 && \
  echo '✅ Docker reiniciado'
"

# 7. Teste final
echo -e "\n7️⃣  Teste final..."
RESPONSE=$(curl -s https://suaigreja.top/admin/test-data | wc -c)
if [ $RESPONSE -gt 1000 ]; then
  echo "  ✅ Site respondendo com $RESPONSE bytes"
else
  echo "  ❌ ERRO: Site não respondendo"
  exit 1
fi

echo -e "\n✅ DEPLOY COMPLETO!"
