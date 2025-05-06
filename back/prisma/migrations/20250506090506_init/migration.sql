-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('root', 'admin', 'journalist');

-- CreateEnum
CREATE TYPE "States" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado', 'Domingo');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'journalist',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageDescription" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "state" "States" NOT NULL,
    "crm" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "visibility" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" "WeekDay" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "doctorId" INTEGER NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_id_username_idx" ON "user"("id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "article_slug_key" ON "article"("slug");

-- CreateIndex
CREATE INDEX "article_slug_userId_createdAt_idx" ON "article"("slug", "userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "token_token_key" ON "token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "token_username_token_key" ON "token"("username", "token");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_crm_key" ON "doctor"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_phone_key" ON "doctor"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_email_key" ON "doctor"("email");

-- CreateIndex
CREATE INDEX "doctor_crm_name_idx" ON "doctor"("crm", "name");

-- CreateIndex
CREATE INDEX "schedule_doctorId_dayOfWeek_idx" ON "schedule"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_doctorId_dayOfWeek_key" ON "schedule"("doctorId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
