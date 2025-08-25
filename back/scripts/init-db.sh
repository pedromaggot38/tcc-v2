#!/bin/sh

set -e

echo "🔄 Aguardando o banco de dados e aplicando migrações..."

# Tentativa de aplicar migrações; se falhar (ex.: DB vazio/sem migrações), faz fallback para db push
until (
  npx prisma migrate deploy || (
    echo "⚠️ migrate deploy falhou. Tentando sincronizar schema com prisma db push..." && \
    npx prisma db push --accept-data-loss
  )
); do
  >&2 echo "PostgreSQL não está disponível ou sincronização falhou - a aguardar..."
  sleep 2
done

echo "✅ Esquema pronto."
echo "⚙️ Gerando o Prisma Client..."
npx prisma generate

echo "🚀 Iniciando a aplicação..."
exec "$@"