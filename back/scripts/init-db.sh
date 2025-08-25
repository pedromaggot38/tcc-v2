#!/bin/sh
# Aborta o script se qualquer comando falhar
set -e

echo "🔄 Aguardando o banco de dados estar disponível..."
# Loop que verifica ativamente se a base de dados está pronta
until npx prisma db pull; do
  >&2 echo "PostgreSQL não está disponível - a aguardar..."
  sleep 1
done

echo "✅ PostgreSQL está pronto."
echo "📊 Executando migrações do Prisma..."
npx prisma migrate deploy

echo "🚀 Iniciando a aplicação..."


exec "$@"