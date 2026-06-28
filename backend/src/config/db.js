const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Connect to MySQL and initialize database if needed
async function initializeDatabase() {
    try {
        // Create a connection without database selected first
        const connection = await mysql.createConnection(poolConfig);
        console.log('Successfully connected to MySQL server.');

        // Read the database.sql file
        const sqlPath = path.join(__dirname, '../../database.sql');
        if (!fs.existsSync(sqlPath)) {
            console.error('database.sql file not found at:', sqlPath);
            return;
        }

        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Strip comments line-by-line first to prevent them from breaking the split chunks
        const cleanSql = sqlContent
            .split('\n')
            .map(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('--')) return '';
                return line;
            })
            .join('\n');

        // Split SQL statements by semicolon + newline (supporting both CRLF and LF)
        const statements = cleanSql
            .split(/;\r?\n|;\n/)
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`Executing ${statements.length} SQL statements to initialize database...`);
        
        for (const statement of statements) {
            try {
                await connection.query(statement);
            } catch (err) {
                // Ignore duplicate key errors on seed data
                if (!err.message.includes('Duplicate entry')) {
                    console.warn(`Warning executing statement: ${err.message}`);
                }
            }
        }

        await connection.end();
        console.log('Database initialization complete.');

        // Now create the final pool with the database selected
        pool = mysql.createPool({
            ...poolConfig,
            database: process.env.DB_NAME || 'agri_parts_db'
        });

    } catch (error) {
        console.error('Failed to initialize database:', error.message);
        console.warn('Attempting to create generic connection pool. Please ensure XAMPP MySQL is running.');
        
        // Fallback pool creation
        pool = mysql.createPool({
            ...poolConfig,
            database: process.env.DB_NAME || 'agri_parts_db'
        });
    }
}

// Helper query function
async function query(sql, params) {
    if (!pool) {
        pool = mysql.createPool({
            ...poolConfig,
            database: process.env.DB_NAME || 'agri_parts_db'
        });
    }
    const [results] = await pool.execute(sql, params);
    return results;
}

module.exports = {
    initializeDatabase,
    query,
    getPool: () => pool
};
