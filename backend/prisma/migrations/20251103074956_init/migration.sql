/*
  Warnings:

  - A unique constraint covering the columns `[tran_id]` on the table `Payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payments_tran_id_key" ON "Payments"("tran_id");
