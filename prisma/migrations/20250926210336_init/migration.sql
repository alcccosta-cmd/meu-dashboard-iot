-- CreateTable
CREATE TABLE "public"."readings" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ph" DOUBLE PRECISION NOT NULL,
    "ec" DOUBLE PRECISION NOT NULL,
    "air_temp" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "water_temp" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RelayConfigs" (
    "relayIndex" INTEGER NOT NULL,
    "mode" INTEGER NOT NULL,
    "led_on_hour" INTEGER NOT NULL,
    "led_off_hour" INTEGER NOT NULL,
    "cycle_on_min" INTEGER NOT NULL,
    "cycle_off_min" INTEGER NOT NULL,
    "ph_pulse_sec" INTEGER NOT NULL,
    "temp_threshold_on" DOUBLE PRECISION NOT NULL,
    "temp_threshold_off" DOUBLE PRECISION NOT NULL,
    "humidity_threshold_on" DOUBLE PRECISION NOT NULL,
    "humidity_threshold_off" DOUBLE PRECISION NOT NULL,
    "ec_threshold" DOUBLE PRECISION NOT NULL,
    "ec_pulse_sec" INTEGER NOT NULL,
    "co2_threshold_on" INTEGER NOT NULL,
    "co2_threshold_off" INTEGER NOT NULL,
    "ph_threshold_low" DOUBLE PRECISION NOT NULL,
    "ph_threshold_high" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RelayConfigs_pkey" PRIMARY KEY ("relayIndex")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
