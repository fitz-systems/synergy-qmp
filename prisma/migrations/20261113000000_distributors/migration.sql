CREATE TABLE "synergy"."distributors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "seat_balance" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "distributors_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "distributors_name_check" CHECK (btrim("name") <> '')
);

CREATE UNIQUE INDEX "distributors_name_key" ON "synergy"."distributors"("name");

ALTER TABLE "synergy"."organizations" ADD COLUMN "distributor_id" INTEGER;

CREATE INDEX "organizations_distributor_id_idx" ON "synergy"."organizations"("distributor_id");

ALTER TABLE "synergy"."organizations" ADD CONSTRAINT "organizations_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "synergy"."distributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "synergy"."enrollments" ADD COLUMN "seat_distributor_id" INTEGER;

CREATE INDEX "enrollments_seat_distributor_id_idx" ON "synergy"."enrollments"("seat_distributor_id");

ALTER TABLE "synergy"."enrollments" ADD CONSTRAINT "enrollments_seat_distributor_id_fkey" FOREIGN KEY ("seat_distributor_id") REFERENCES "synergy"."distributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
