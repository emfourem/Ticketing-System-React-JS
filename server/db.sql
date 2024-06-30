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


INSERT INTO "users" VALUES (1,'alice','1234aswe5678iopl', 'f8ece24d2af9f7ffd34c66870dc139b81987b74278f73ddceb81ec729edd691ebc19d985766f21489550ac91301d975ec31e77a9cb6dca26877adebf76f2606b', 1);
INSERT INTO "users" VALUES (2,'bob', '9876trew5432lkjh', 'f0722523c4d1cb82e5bf0df0fa0f56ad0732f6ba24183f4440e86ee45dee305306b5517db3cd1681249d27814f612ae58af766dc96d96364e994f1cb630d9853', 0);
INSERT INTO "users" VALUES (3,'carl', 'trew9876lkjh2345', '0c97c5207b168b5d53bf25bb143169721a5a0eacd71b9924bcdd144e697ce02fced62d30453c978735173c38513313ebce047d8316f8f2bf200bb38b913823f7', 0);
INSERT INTO "users" VALUES (4,'dave', '5432ytoi9854lagd', '113082826bc283b85e86f889a0241ca10130a3d0e99d1f1bb1c1c7b1a4d23594a747fa7e304794dd023961feced1db4c149aec5faa9cd71b525441a2c67b4908', 0);
INSERT INTO "users" VALUES (5,'michele', '9614iexn1029ythg', 'a0d28f990983deae5f9d323f44c3316874481b18846ae7766d8f2f851c8dd8eece09315817c4e0b44a7458702da9dde2d7dd6e2795291fde5f748680daa3d2f9', 1);
INSERT INTO "tickets" VALUES (1,'Simple Request','Where is the office?','administrative',  'open','2023-12-18 15:36',2);
INSERT INTO "tickets" VALUES (2,'Payment required','Where are my money?', 'payment', 'open','2024-06-19 21:00',1);
INSERT INTO "tickets" VALUES (3,'Account closed','I cannot re-open my ticket', 'maintenance', 'open', '2021-06-19 20:30',4);
INSERT INTO "tickets" VALUES (4,'Exam date','When is the exam?', 'inquiry', 'open', '2023-05-25 19:51',5);
INSERT INTO "tickets" VALUES (5,'Car sharing','Does someone know a good company for investments?', 'new feature', 'open', '2022-01-01 12:30',3);
INSERT INTO "tickets" VALUES (6,'Easter holidays','When are the easter holidays?','payment',  'close','2022-03-01 08:26',5);
INSERT INTO "tickets" VALUES (7,'Summer is coming','The summer is coming! <b> Pay attention </b>', 'new feature', 'close','2024-04-22 18:27',1);
INSERT INTO "tickets" VALUES (8,'Password changed','I have been changed my password', 'administrative', 'close', '2018-02-11 15:34',4);
INSERT INTO "tickets" VALUES (9,'Ticked closure','When is my ticket closed?', 'inquiry', 'close', '2023-01-11 10:41',2);
INSERT INTO "tickets" VALUES (10,'Hot temperatures','There will be a lot of problems due to hot temperatures', 'maintenance', 'close', '2016-10-20 06:18',3);
INSERT INTO "blocks" VALUES (1,'2022-06-27 21:17', 'bob', '<b>Ticket cannot be re-opened</b>!',3);
INSERT INTO "blocks" VALUES (2,'2022-06-30 06:19', 'michele', 'Ticket can be re-opened by <i>administrators</i> only!',3);
INSERT INTO "blocks" VALUES (3,'2022-07-11 09:36', 'dave', 'Thank you!<br> dave',3);
INSERT INTO "blocks" VALUES (4,'2024-06-19 21:10', 'bob', 'I have already received my money!',2);
INSERT INTO "blocks" VALUES (5,'2024-06-21 07:28', 'alice', '<b>Happy for you</b>!',2);
INSERT INTO "blocks" VALUES (6,'2024-06-23 14:45', 'bob', 'I <i>hope</i> you will receive your money soon.<br>Otherwise, you can contact your boss.',2);
COMMIT;