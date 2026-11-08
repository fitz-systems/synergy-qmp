CREATE TABLE "synergy"."rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key"),
    CONSTRAINT "rate_limit_buckets_count_check" CHECK ("count" > 0)
);

CREATE INDEX "rate_limit_buckets_window_start_idx" ON "synergy"."rate_limit_buckets"("window_start");
