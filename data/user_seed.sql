BEGIN;

INSERT INTO "user" ("first_name", "last_name", "pseudo","email_address", "password", "group_id") VALUES
('Agathe', 'Zeublouze', 'agathe', 'lesgardiensdelalegende@gmail.com', '$2b$10$B1NL.FDCv0sXi/o7ED5AwuGvbGqu6fIwF1KO83Nu77c5c8kxIEqpG', 1),
('Alex', 'Kuzbidon', 'alex', '2lesgardiensdelalegende@gmail.com', '$2b$10$LMqOrl1nLJNkPnzygSpvre6hqtx9UjmQj7dv6JlmLJRO8UslV4B0y', 2),
('Clement', 'Tine', 'clement', '3lesgardiensdelalegende@gmail.com', '$2b$10$opGVGReCUqhCZbNuYJkLquN7h1XcWNVgNXm7MBQWzwsa/zDyu51ia', 3),
('Désirée', 'Duktible', 'daisy', '4lesgardiensdelalegende@gmail.com', '$2b$10$QOX/d3NOjRL.6mQzIZfpi.ijpMb7ZTEohzFI3DaKdVNGNm.9zfRYq', 1);

COMMIT