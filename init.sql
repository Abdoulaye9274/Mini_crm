-- Créer l'utilisateur PostgreSQL crmuser
CREATE USER crmuser WITH PASSWORD 'crmpass';

-- Accorder tous les privilèges sur la base de données crm à crmuser
GRANT ALL PRIVILEGES ON DATABASE crm TO crmuser;
GRANT ALL PRIVILEGES ON SCHEMA public TO crmuser;

-- Table des utilisateurs AVEC les colonnes login et password
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  login VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user'
);

-- Changer le propriétaire de la table
ALTER TABLE users OWNER TO crmuser;

-- Insérer un utilisateur admin (mot de passe "admin123!")
INSERT INTO users (login, password, role)
VALUES ('admin', '$2b$10$KIXObJj9IfzEl6ZLzFfE7Oq6H.g83AONuwqV7kO7.XzR7iS0F6im6', 'admin')
ON CONFLICT (login) DO NOTHING;

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE clients OWNER TO crmuser;

-- Table des contrats
CREATE TABLE IF NOT EXISTS contracts (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'actif'
);

ALTER TABLE contracts OWNER TO crmuser;

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

ALTER TABLE services OWNER TO crmuser;

-- Relation contrat-services (many-to-many)
CREATE TABLE IF NOT EXISTS contract_services (
  contract_id INT REFERENCES contracts(id) ON DELETE CASCADE,
  service_id INT REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (contract_id, service_id)
);

ALTER TABLE contract_services OWNER TO crmuser;

-- Table des activités (pour le tableau de bord)
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'Succès',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE activities OWNER TO crmuser;

-- Accorder tous les privilèges sur les tables et séquences existantes et futures
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crmuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crmuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO crmuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO crmuser;
