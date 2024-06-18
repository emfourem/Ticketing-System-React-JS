-- Create the Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    admin INTEGER NOT NULL DEFAULT(0)  --1 for admins, 0 for normal users
);

-- Create the Blocks table
CREATE TABLE IF NOT EXISTS Blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author VARCHAR(20) NOT NULL,
    date TEXT NOT NULL, --"YYYY-MM-DD hh:mm"
    ticketId INT,
    FOREIGN KEY (ticketId) REFERENCES Tickets(id)
);

-- Create the Tickets table
CREATE TABLE IF NOT EXISTS Tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    state VARCHAR(5) NOT NULL,
    category VARCHAR(20) NOT NULL,
    date TEXT NOT NULL,
    ownerId INT,
    FOREIGN KEY (ownerId) REFERENCES Users(id)
);