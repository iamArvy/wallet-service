-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "idempotency_key" DROP NOT NULL,
ALTER COLUMN "reference" DROP NOT NULL;
