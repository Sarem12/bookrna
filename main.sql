-- 1. Create the Book
INSERT INTO "Book" ("id", "subject", "grade", "imgUrl")
VALUES ('BOOK-BIO-G10', 'Biology', 10, 'https://example.com/bio10.jpg');

-- 2. Create the Unit
INSERT INTO "Unit" ("id", "title", "BookId")
VALUES ('UNIT-BIO-U1', 'Unit 1: Biotechnology', 'BOOK-BIO-G10');

-- 3. Create the Main Lesson
INSERT INTO "Lesson" ("id", "title", "unitId", "ParentLessonId", "index")
VALUES ('LES-1-1', '1.1 What is biotechnology?', 'UNIT-BIO-U1', NULL, 1);

-- 4. Create Sub-Lessons
INSERT INTO "Lesson" ("id", "title", "unitId", "ParentLessonId", "index")
VALUES ('LES-1-1-A', 'Types of Micro-organisms', 'UNIT-BIO-U1', 'LES-1-1', 1);

INSERT INTO "Lesson" ("id", "title", "unitId", "ParentLessonId", "index")
VALUES ('LES-1-1-B', 'Traditional Technology using Yeast', 'UNIT-BIO-U1', 'LES-1-1', 2);

INSERT INTO "Lesson" ("id", "title", "unitId", "ParentLessonId", "index")
VALUES ('LES-1-1-C', 'Food production using bacteria', 'UNIT-BIO-U1', 'LES-1-1', 3);

-- 5. Create RealParagraphs for Main Lesson (1.1)
INSERT INTO "RealParagraph" ("id", "content", "LessonId", "order") VALUES
('RP-1', 'Biology, as you discovered last year, is the study of living organisms. Now, at the beginning of your grade 10 biology course, you are going to be studying biotechnology.', 'LES-1-1', 1),
('RP-2', 'Biotechnology is the use of micro-organisms to make things that people want, often involving industrial production.', 'LES-1-1', 2),
('RP-3', 'Biotechnology has always been extremely important. It involves ways of making and preserving foods and making alcoholic drinks. Traditional applications of biotechnology involve brewing beers, making wines, making bread, and making cheese and yoghurt.', 'LES-1-1', 3),
('RP-4', 'Modern applications of biotechnology include using genetic engineering to change crops and animals; producing new medicines; and helping to provide new energy sources. It has enormous significance in helping people to improve and control their lives.', 'LES-1-1', 4);

-- 6. Create RealParagraphs for "Types of Micro-organisms"
INSERT INTO "RealParagraph" ("id", "content", "LessonId", "order") VALUES
('RP-5', 'Biotechnology is based on microbiology. Microbiology is the study of micro-organisms – tiny living organisms including bacteria, viruses, fungi and protoctista, which are usually too small to be seen with the naked eye.', 'LES-1-1-A', 1),
('RP-6', 'Some micro-organisms cause disease; others are enormously useful to people – for example, they play a vital role in decay and the recycling of nutrients in the environment.', 'LES-1-1-A', 2),
('RP-7', 'Not all types of micro-organism are used in biotechnology. The main groups are bacteria and fungi, although viruses are being used more and more for genetic engineering.', 'LES-1-1-A', 3);

-- 7. Create RealParagraphs for "Traditional Technology using Yeast"
INSERT INTO "RealParagraph" ("id", "content", "LessonId", "order") VALUES
('RP-8', 'One of the most useful micro-organisms is yeast. The yeasts are single-celled organisms. Each yeast cell has a nucleus, cytoplasm and a membrane surrounded by a cell wall.', 'LES-1-1-B', 1),
('RP-9', 'The main way in which yeasts reproduce is by asexual budding – splitting into two, to form new yeast cells. Just one gram of yeast contains about 25 billion cells!', 'LES-1-1-B', 2),
('RP-10', 'When yeast cells break down sugar in the absence of oxygen, they produce ethanol (commonly referred to as alcohol) and carbon dioxide. The anaerobic respiration of yeast is sometimes referred to as fermentation.', 'LES-1-1-B', 3);

-- 8. Create RealParagraphs for "Food production using bacteria"
INSERT INTO "RealParagraph" ("id", "content", "LessonId", "order") VALUES
('RP-11', 'People soon realised that the milk female animals made for their young was also a very good food for people. But milk does not stay fresh for long.', 'LES-1-1-C', 1),
('RP-12', 'It is full of nutrients, and bacteria that are found naturally in the air and in the environment soon start to grow in the milk and make it go bad.', 'LES-1-1-C', 2),
('RP-13', 'Yoghurt is a fermented milk product. It is made by the action of bacteria on the milk sugar (lactose). The bacteria used are usually Lactobacillus. They respire anaerobically, and the process is called a lactic fermentation because the waste product is lactic acid.', 'LES-1-1-C', 3);