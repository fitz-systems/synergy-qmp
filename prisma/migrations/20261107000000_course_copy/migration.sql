ALTER TABLE "synergy"."courses" ADD COLUMN "duration_hours" INTEGER,
ADD COLUMN "lecture_minutes" INTEGER,
ADD COLUMN "price_cents" INTEGER;

ALTER TABLE "synergy"."course_locales" ADD COLUMN "lecture_title" TEXT,
ADD COLUMN "outcomes" TEXT[];

UPDATE "synergy"."courses" AS c SET "price_cents" = v.price_cents, "duration_hours" = v.duration_hours, "lecture_minutes" = v.lecture_minutes
FROM (VALUES
  ('ground', 9900, 2, 60),
  ('air', 9900, 2, 60)
) AS v (code, price_cents, duration_hours, lecture_minutes)
WHERE c."code" = v.code;

UPDATE "synergy"."course_locales" AS l SET "lecture_title" = v.lecture_title, "outcomes" = v.outcomes
FROM "synergy"."courses" AS c, (VALUES
  ('ground', 'en', 'TDG Class 7 Ground', ARRAY['Become familiar with the regulations for transporting radioactive materials by ground.', 'Understand the classification of dangerous goods.', 'Choose the proper packaging for the transportation of Class 7 packages.', 'Assign safety marks to radioactive packages.', 'Apply the standard procedures for shipping, handling and receiving radioactive packages.', 'React appropriately in case of emergency.']),
  ('ground', 'fr', 'TMD classe 7, transport terrestre', ARRAY['Maîtriser les règlements qui régissent le transport de matières radioactives par route.', 'Comprendre la classification des matières dangereuses.', 'Choisir l''emballage approprié pour le transport de matières de classe 7.', 'Apposer les signes d''avertissement nécessaires sur les colis radioactifs.', 'Suivre les procédures concernant la réception, la manutention et l''envoi de colis radioactifs.', 'Suivre les procédures en cas de situation d''urgence.']),
  ('air', 'en', 'TDG Class 7 Air', ARRAY['Become familiar with the regulations for transporting radioactive materials by air.', 'Understand the classification of dangerous goods.', 'Choose the proper packaging for the transportation of Class 7 packages.', 'Assign safety marks to radioactive packages.', 'Apply the standard procedures for shipping, handling and receiving radioactive packages.', 'React appropriately in case of emergency.']),
  ('air', 'fr', 'TMD classe 7, transport aérien', ARRAY['Maîtriser les règlements qui régissent le transport de matières radioactives par voie aérienne.', 'Comprendre la classification des matières dangereuses.', 'Choisir l''emballage approprié pour le transport de matières de classe 7.', 'Apposer les signes d''avertissement nécessaires sur les colis radioactifs.', 'Suivre les procédures concernant la réception, la manutention et l''envoi de colis radioactifs.', 'Suivre les procédures en cas de situation d''urgence.'])
) AS v (code, locale, lecture_title, outcomes)
WHERE l."course_id" = c."id" AND c."code" = v.code AND l."locale" = v.locale;

ALTER TABLE "synergy"."courses" ALTER COLUMN "duration_hours" SET NOT NULL,
ALTER COLUMN "lecture_minutes" SET NOT NULL,
ALTER COLUMN "price_cents" SET NOT NULL;

ALTER TABLE "synergy"."course_locales" ALTER COLUMN "lecture_title" SET NOT NULL;

ALTER TABLE "synergy"."courses" ADD CONSTRAINT "courses_listing_check" CHECK ("price_cents" >= 0 AND "duration_hours" > 0 AND "lecture_minutes" > 0);
ALTER TABLE "synergy"."course_locales" ADD CONSTRAINT "course_locales_outcomes_check" CHECK ("outcomes" IS NOT NULL);
