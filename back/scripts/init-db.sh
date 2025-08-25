#!/bin/sh

set -e

echo "🔄 Aguardando o banco de dados estar disponível..."

until npx prisma db pull; do
  >&2 echo "PostgreSQL não está disponível - a aguardar..."
  sleep 1
done

echo "✅ PostgreSQL está pronto."
echo "📊 Executando migrações do Prisma..."
npx prisma migrate deploy

echo "⚙️ Gerando o Prisma Client..."
npx prisma generate

echo "🚀 Iniciando a aplicação..."
exec "$@"