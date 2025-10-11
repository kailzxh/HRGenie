-- Create employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    department VARCHAR(100),
    position VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    avatar VARCHAR(255),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_employees_email ON employees(email);

-- Create index on department for filtering
CREATE INDEX idx_employees_department ON employees(department);

-- Create index on status for filtering
CREATE INDEX idx_employees_status ON employees(status);