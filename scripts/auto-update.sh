#!/bin/bash
# Script de atualização automática disparado pelo Webhook

cd /opt/igreja
echo "🔄 Iniciando atualização automática..."

# Puxar mudanças do GitHub
git fetch origin main
git reset --hard origin/main

# Garantir que as permissões estão corretas
chmod -R 755 .

echo "✅ Site atualizado com sucesso!"
