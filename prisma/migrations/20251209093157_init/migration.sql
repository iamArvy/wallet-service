-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'success', 'failed', 'abandoned');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'transfer');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "profile_picture" TEXT,
    "password" TEXT,
    "google_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_api_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "permissions" TEXT[],
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wallets" (
    "id" TEXT NOT NULL,
    "wallet_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "receiver_wallet_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "authorization_url" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "webhook_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_api_keys_api_key_key" ON "user_api_keys"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_api_keys_user_id_name_key" ON "user_api_keys"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_wallet_number_key" ON "user_wallets"("wallet_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_user_id_key" ON "user_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_wallet_id_idx" ON "payments"("wallet_id");

-- CreateIndex
CREATE INDEX "payments_receiver_wallet_id_idx" ON "payments"("receiver_wallet_id");

-- AddForeignKey
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "user_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_receiver_wallet_id_fkey" FOREIGN KEY ("receiver_wallet_id") REFERENCES "user_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
