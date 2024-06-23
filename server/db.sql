BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	VARCHAR(20),
	"salt" TEXT,
	"password" TEXT,
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


INSERT INTO "users" VALUES (1,'alice','1234aswe5678iopl', '18930244332a4eaf09e75bf90f255b1c18c35ead02499e403887f5989e3abb85bb75d2842b6393c628e86e0060c03ba92a6a1d1bbd48b9b8960568512c6fd911', 1);
INSERT INTO "users" VALUES (2,'bob', '9876trew5432lkjh', '089381d22d91bd62e0593afcabe30eaa28910585d65397d78900b31dc88d03f76d47dff810d2bd957728464713114a7175f8213f35a2f83c446746016e4401fc', 0);
INSERT INTO "tickets" VALUES (1,'Simple Request','Where are the office?','new feature',  'open','2024-06-18 15:36',2);
INSERT INTO "tickets" VALUES (2,'Payment required','Where are my money?', 'administrative', 'open','2024-06-19 21:00',1);
INSERT INTO "tickets" VALUES (3,'Account closed','Where are you?', 'maintenance', 'open', '2023-06-19 20:00',2);
COMMIT;