-- Drop existing tables if they exist
DROP TABLE IF EXISTS employees CASCADE;

-- Create employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'manager', 'employee')),
    department VARCHAR(100),
    position VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    avatar VARCHAR(255),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_department ON employees(department);

-- Insert a default admin user (password: admin123)
INSERT INTO employees (name, email, password, role) 
VALUES (
    'Admin User', 
    'admin@hrgenie.com',
    '$2a$10$xPJ5sYtMmNPKxHXzLzXKu.lCY6JJBPWOGd1tzAkVlwMvBZF8AJTB.',
    'admin'
) ON CONFLICT DO NOTHING;