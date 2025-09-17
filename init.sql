CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
);

INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$hashadmin', 'ADMIN'),
('user', '$2b$10$hashuser', 'USER');