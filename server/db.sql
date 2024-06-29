BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	VARCHAR(20) NOT NULL,
	"salt" TEXT NOT NULL,
	"password" TEXT NOT NULL,
	"admin"	INTEGER DEFAULT(0)
);
CREATE TABLE IF NOT EXISTS "tickets" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
    "title" VARCHAR(100) NOT NULL,
	"text"	TEXT NOT NULL,
	"category"	VARCHAR(20) NOT NULL,
	"state"	VARCHAR(10) NOT NULL,
	"date"	DATE NOT NULL,
	"ownerId" INTEGER NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES users("id")
);
CREATE TABLE IF NOT EXISTS "blocks" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"date"	DATE NOT NULL,
    "author" VARCHAR(20) NOT NULL,
	"text" TEXT NOT NULL,
	"ticketId"	INTEGER NOT NULL,
    FOREIGN KEY (ticketId) REFERENCES tickets("id")
);


INSERT INTO "users" VALUES (1,'alice','1234aswe5678iopl', '18930244332a4eaf09e75bf90f255b1c18c35ead02499e403887f5989e3abb85bb75d2842b6393c628e86e0060c03ba92a6a1d1bbd48b9b8960568512c6fd911', 1);
INSERT INTO "users" VALUES (2,'bob', '9876trew5432lkjh', '089381d22d91bd62e0593afcabe30eaa28910585d65397d78900b31dc88d03f76d47dff810d2bd957728464713114a7175f8213f35a2f83c446746016e4401fc', 0);
INSERT INTO "users" VALUES (3,'carl', 'trew9876lkjh2345', '3c2bc3b259a8f0f6e6637340b0c9ed7d630cd34a2b0fcaf1f80aa0f2b76187b8a190c23c1b8be9d9e4d169cf1f71d708fbc4a5bd49b7df4150faf60c1200d887', 0);
INSERT INTO "users" VALUES (4,'dave', '5432ytoi9854lagd', 'b7c172d5566c5d25bab3b4502b7e49c78fd8b8e1ac6ebf9f90985dff1b3b31193315ddd621cd956c644eac54560e05065ed9b8fbab5a9e038b077acbd0771766', 0);
INSERT INTO "users" VALUES (5,'michele', '9614iexn1029ythg', '72315c44be28539a16064a8cdb18580147104a2fb7017b8e322f6e36497f5a90e7e9f8de51399aac5dd9dba3828b7ce5fed111128a5f9a072d2a3f9c47bd7fcf', 1);
INSERT INTO "tickets" VALUES (1,'Simple Request','Where are the office?','administrative',  'open','2023-12-18 15:36',2);
INSERT INTO "tickets" VALUES (2,'Payment required','Where are my money?', 'payment', 'open','2024-06-19 21:00',1);
INSERT INTO "tickets" VALUES (3,'Account closed','I cannot re-open my ticket', 'maintenance', 'open', '2021-06-19 20:30',4);
INSERT INTO "tickets" VALUES (4,'Exam date','When is the exam?', 'inquiry', 'open', '2023-05-25 19:51',5);
INSERT INTO "tickets" VALUES (5,'Car sharing','Someone know a good sharing company?', 'new feature', 'open', '2022-01-01 12:30',3);
INSERT INTO "tickets" VALUES (6,'Easter holidays','When are the easter holidays?','payment',  'close','2022-03-01 08:26',5);
INSERT INTO "tickets" VALUES (7,'Summer is coming','The summer is coming! <b> Pay attention </b>', 'new feature', 'close','2024-04-22 18:27',1);
INSERT INTO "tickets" VALUES (8,'Password changed','I have been changed my password', 'administrative', 'close', '2018-02-11 15:34',4);
INSERT INTO "tickets" VALUES (9,'Ticked closure','When is my ticket closed?', 'inquiry', 'close', '2023-01-11 10:41',2);
INSERT INTO "tickets" VALUES (10,'Hot temperatures','I see a lot of problems due to hot temperatures', 'maintenance', 'close', '2016-10-20 06:18',3);
INSERT INTO "blocks" VALUES (1,'2022-06-27 21:17', 'bob', '<b>Ticket cannot be re-opened</b>!',3);
INSERT INTO "blocks" VALUES (2,'2022-06-30 06:19', 'michele', 'Ticket can be re-opened by <i>administrators</i> only!',3);
INSERT INTO "blocks" VALUES (3,'2022-07-11 09:36', 'dave', 'Thank you!<br> dave',3);
INSERT INTO "blocks" VALUES (4,'2024-06-19 21:10', 'bob', 'I have already received my money!',2);
INSERT INTO "blocks" VALUES (5,'2024-06-21 07:28', 'alice', '<b>Happy for you</b>!',2);
INSERT INTO "blocks" VALUES (6,'2024-06-23 14:45', 'bob', 'I <i>hope</i> you will receive your money soon.<br>Otherwise, you can contact your boss.',2);
COMMIT;