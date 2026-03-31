-- 1. Create the Admin User
INSERT INTO "User" ("id", "first", "last", "username", "email", "password", "role", "age", "gender")
VALUES (
  'u-admin-sarem', 
  'Sarem', 
  'Admin', 
  'sarem_admin', 
  'sarem@admin', 
  '123', 
  'ADMIN', 
  24, 
  'MALE'
);

-- 2. Create 3 Experimental Student Users
INSERT INTO "User" ("id", "first", "last", "username", "email", "password", "role", "age", "gender")
VALUES 
('u-student-01', 'Abebe', 'Kebede', 'abebe_k', 'abebe@school.com', '123', 'STUDENT', 16, 'MALE'),
('u-student-02', 'Martha', 'Tesfaye', 'martha_t', 'martha@school.com', '123', 'STUDENT', 15, 'FEMALE'),
('u-student-03', 'Elias', 'Bekele', 'elias_b', 'elias@school.com', '123', 'STUDENT', 17, 'MALE');

-- 3. Create Interest Tags
INSERT INTO "Tag" ("id", "name")
VALUES 
('tag-bio-01', 'Biology'),
('tag-micro-01', 'Microbiology'),
('tag-genetics-01', 'Genetics'),
('tag-tech-01', 'Biotechnology');

-- 4. Create UserTag Relations (Experimental Liking Levels)
INSERT INTO "UserTag" ("id", "UserId", "TagId", "likingLevel")
VALUES 
-- Student 1 likes Biology and Microbiology
('ut-01', 'u-student-01', 'tag-bio-01', 0.95),
('ut-02', 'u-student-01', 'tag-micro-01', 0.80),

-- Student 2 focuses on Genetics and Biotechnology
('ut-03', 'u-student-02', 'tag-genetics-01', 0.90),
('ut-04', 'u-student-02', 'tag-tech-01', 0.85),

-- Student 3 has a general interest in Biology
('ut-05', 'u-student-03', 'tag-bio-01', 0.70);