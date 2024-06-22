BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	VARCHAR(20),
	"admin"	INTEGER DEFAULT(0)
);
CREATE TABLE IF NOT EXISTS "tickets" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "title" VARCHAR(100),
	"text"	TEXT,
	"category"	VARCHAR(20),
	"state"	VARCHAR(10),
	"date"	DATE,
	"ownerId" INTEGER,
    FOREIGN KEY (ownerId) REFERENCES users("id")
);
CREATE TABLE IF NOT EXISTS "blocks" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"date"	DATE,
    "author" VARCHAR(20),
	"text" TEXT,
	"ticketId"	INTEGER,
    FOREIGN KEY (ticketId) REFERENCES tickets("id")
);


INSERT INTO "users" VALUES (1,'Alice', 0);
INSERT INTO "users" VALUES (2,'Bob', 0);
INSERT INTO "tickets" VALUES (1,'Simple Request','Where are the office?','new feature',  'open','2024-06-18 15:36',2);
INSERT INTO "tickets" VALUES (2,'Payment required','Where are my money?', 'administrative', 'open','2024-06-19 21:00',1);
INSERT INTO "tickets" VALUES (3,'Account closed','Where are you?', 'maintenance', 'open', '2023-06-19 20:00',2);
COMMIT;