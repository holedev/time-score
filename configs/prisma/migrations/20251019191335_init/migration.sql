-- CreateEnum
CREATE TYPE "public"."app_role" AS ENUM ('anonymous', 'user', 'reviewer', 'admin');

-- CreateEnum
CREATE TYPE "public"."PresentationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "public"."TeamStatus" AS ENUM ('PENDING', 'DONE');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "timeStart" TIMESTAMP(3) NOT NULL,
    "timeEnd" TIMESTAMP(3) NOT NULL,
    "presentationStatus" "public"."PresentationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "members" TEXT[],
    "order" INTEGER NOT NULL,
    "status" "public"."TeamStatus" NOT NULL DEFAULT 'PENDING',
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CriteriaTemplate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "eventId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "CriteriaTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CriteriaRecord" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "criteriaId" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL,

    CONSTRAINT "CriteriaRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventReviewer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "eventId" INTEGER NOT NULL,
    "reviewerId" UUID NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "scores" JSONB NOT NULL,

    CONSTRAINT "EventReviewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CriteriaTemplate_eventId_key" ON "public"."CriteriaTemplate"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventReviewer_eventId_reviewerId_key" ON "public"."EventReviewer"("eventId", "reviewerId");

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CriteriaTemplate" ADD CONSTRAINT "CriteriaTemplate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CriteriaRecord" ADD CONSTRAINT "CriteriaRecord_criteriaId_fkey" FOREIGN KEY ("criteriaId") REFERENCES "public"."CriteriaTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventReviewer" ADD CONSTRAINT "EventReviewer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
