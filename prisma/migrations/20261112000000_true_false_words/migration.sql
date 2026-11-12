UPDATE "synergy"."questions"
SET "options" = array_replace(array_replace("options", 'T', 'True'), 'F', 'False')
WHERE "type" = 'trueFalse' AND cardinality("options") = 2 AND "options" <@ ARRAY['T', 'F']::text[];

UPDATE "synergy"."questions"
SET "options" = array_replace(array_replace("options", 'V', 'Vrai'), 'F', 'Faux')
WHERE "type" = 'trueFalse' AND cardinality("options") = 2 AND "options" <@ ARRAY['V', 'F']::text[];

UPDATE "synergy"."attempt_answers"
SET "options" = array_replace(array_replace("options", 'T', 'True'), 'F', 'False'),
    "answer_text" = CASE "answer_text" WHEN 'T' THEN 'True' WHEN 'F' THEN 'False' ELSE "answer_text" END,
    "correct_answer_text" = CASE "correct_answer_text" WHEN 'T' THEN 'True' WHEN 'F' THEN 'False' ELSE "correct_answer_text" END
WHERE cardinality("options") = 2 AND "options" <@ ARRAY['T', 'F']::text[];

UPDATE "synergy"."attempt_answers"
SET "options" = array_replace(array_replace("options", 'V', 'Vrai'), 'F', 'Faux'),
    "answer_text" = CASE "answer_text" WHEN 'V' THEN 'Vrai' WHEN 'F' THEN 'Faux' ELSE "answer_text" END,
    "correct_answer_text" = CASE "correct_answer_text" WHEN 'V' THEN 'Vrai' WHEN 'F' THEN 'Faux' ELSE "correct_answer_text" END
WHERE cardinality("options") = 2 AND "options" <@ ARRAY['V', 'F']::text[];
