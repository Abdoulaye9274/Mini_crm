DELETE FROM users WHERE login = 'admin';
DELETE FROM users WHERE login = 'abdoulaye';
INSERT INTO users (login, password, role) VALUES ('abdoulaye', '$2b$10$NLEMPX8vHQKVPV7R7z3bEeyBSuRtqNudWpudRiiVTuK0zx93A0f/O', 'admin');