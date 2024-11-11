import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

type Attribute = { [key: string]: any };

type ResponseState =
  | { success: string; status: number }
  | { error: string; status: number };

const dbPath = './lib/furniture.db';

// Creating a new database instance
const db = new sqlite3.Database(dbPath, (err: Error | null) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON;', (err: Error | null) => {
      if (err) console.error('Failed to enable foreign keys:', err.message);
    });
  }
});

/**
 * Fetch all rows from a specified table
 * @param {string} table - The table name
 * @returns {Object} - Error message or rows of data
 */
export const getRowsData = (table: string) => {
  return new Promise<{ rows: any[] }>((resolve, reject) => {
    db.all(`SELECT * FROM ${table}`, (err: Error | null, rows: any[]) => {
      if (err) return reject({ error: err.message, status: 500 });
      return resolve({ rows });
    });
  });
};

/**
 * Fetch all rows from a specified table with references
 * @param {T} params - The parameters including table names
 * @returns {Promise<{ rows: any[] }>} - Rows of data
 */
export const getRowsDataWithReferences = <T extends Attribute>(params: T) => {
  const tables: string[] = [];
  const queries: any[] = [];
  
  // Categorize tables and other params
  Object.entries(params).map(([key, value]) => {
    return key.includes('table') ? tables.push(value) : queries.push({ [key]: value });
  });

  return new Promise<{ rows: any[] }>((resolve, reject) => {

    const stmt = queries.length < 0 ?
      `SELECT ${tables[0]}.* ${tables[1]}.name, ${tables[0]}.name  FROM Materials m, Suppliers s WHERE s.id = m.sid`:

      `SELECT ${tables[0]}.*` + 

      `${tables.map((table, i) => {
        if (i == 0) return null;
        return `${table}.name AS ${table.slice(0, -1)}_name`;
      }).join(', ')}` +
      ` FROM ${tables.map(table => table).join(', ')}` + 
      ` WHERE ${tables[1]}.id = ${tables[0]}.${tables[1].charAt(0)}id`;

    db.all(stmt, (err: Error | null, rows: any[]) => {
      if (err) return reject({ error: err.message, status: 500 });
      return resolve({ rows });
    });
  });
};

/**
 * Fetch a single row data by ID from a specified table.
 * @param {string} table - The table name
 * @param {string} id - The row ID
 * @returns {Object} - Promise resolving to a success message or an error
 */
export const getRowData = (table: string, id: string) => {
  return new Promise<{ row: any }>((resolve, reject) => {
    db.get(`SELECT * FROM ${table} WHERE id = ?`, id, (err: Error | null, row: any) => {
      if (err) return reject({ error: err.message, status: 500 });
      if (!row) return reject({ error: 'Not found.', status: 404 });

      return resolve({ row });
    });
  });
};

/**
 * Update row data in a specified table
 * @param {string} table - The table name
 * @param {Object} attribute - Object of data
 * @returns {Object} - Promise resolving to a success message or an error
 */
export const updateRowData = <T extends Attribute>(table: string, attribute: T) => {
  const id = Object.values(attribute)[0];
  const values = Object.values(attribute)[1];

  const keyArr = Object.keys(values)[0].split('_');
  const key = keyArr.slice(2, keyArr.length).join('_');
  const value = Object.values(values)[0];

  return new Promise<ResponseState>((resolve, reject) => {
    // Prepare a statement to check if a row with the same id already exists
    const checkStmt = `SELECT COUNT(*) as count FROM ${table} WHERE id = ?`;
    db.get(checkStmt, id, (err: Error | null, countRow: any) => {
      if (err) return reject({ error: err.message, status: 500 });

      // Reject if any row already exists with the same ID.
      if (countRow.count <= 0) return reject({ error: 'No data found', status: 400 });

      const stmt = `UPDATE ${table} SET ${key} = ? WHERE id = ?`;
  
      db.run(stmt, [value, id],
        (err: Error | null) => {
          if (err) return reject({ error: err.message, status: 400 });
  
          if (err) {  
            db.finalize();
            return reject({ error: 'Failed to update data', status: 400 });
          }
          
          return resolve({ success: 'Successfully updated data.', status: 200 });
        }
      );
    });
  });
};

/**
 * Delete a row from a specified table by ID
 * @param {string} table - The table name
 * @param {string} id - The row ID
 * @returns {Object} - Promise resolving to a success message or an error
 */
export const deleteRowData = (table: string, id: string) => {
  return new Promise<ResponseState>((resolve, reject) => {
    const stmt = `DELETE FROM ${table} WHERE id = ?`;

    db.run(stmt, id, function (this: any, err: Error | null) {
      if (err) return reject({ error: err.message, status: 500 });
      if (this.changes <= 0) return reject({ error: 'No data is being deleted.', status: 400 });

      db.finalize((finalizeErr: Error | null) => {
        if (finalizeErr) return 
      })

      return resolve({ success: 'Successfully removed data.', status: 200 });
    });
  });
};

/**
 * Insert new data into the specified table
 * @param {string} table - The table name
 * @param {Object} attribute - Object of data
 * @returns {Object} - Promise resolving to a success message or an error
 */
export const appendData = <T extends Attribute>(table: string, attribute: T) => {
  const keys = Object.keys(attribute);
  const values = Object.values(attribute);

  return new Promise<ResponseState>((resolve, reject) => {
    // Prepare a statement to check if a row with the same id already exists
    const checkStmt = `SELECT COUNT(*) as count FROM ${table} WHERE id = ?`;

    // Execute the query to check for existing rows with the same ID.
    db.get(checkStmt, values[0], (err: Error | null, countRow: any) => {
      if (err) return reject({ error: err.message, status: 500 });

      // Reject if any row already exists with the same ID.
      if (countRow.count >= 1) return reject({ error: 'Data already exists', status: 400 });

      // If no existing row, prepare an INSERT statement. 
      const insertStmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')});`);

      insertStmt.run(...values, function (insertErr: Error | null) {
        if (insertErr) {  
          insertStmt.finalize();
          return reject({ error: 'Failed to append data', status: 400 });
        }
        
        insertStmt.finalize((finalizeErr: Error | null) => {
          if (finalizeErr) return reject({ error: finalizeErr.message, status: 400 });
          return resolve({ success: 'Successfully appended data.', status: 200 });
        });
      });
    });
  });
};

/**
 * Append a reference to a specified table
 * @param {string} table - The table name
 * @param {Attribute} attribute - Object containing pid and mid
 * @returns {Object} - Promise resolving to a success message or an error
 */
export const appendReference = async <T extends Attribute>(table: string, attribute: T): Promise<ResponseState> => {
  const { pid, mid } = attribute; // Ensure the attribute has 'pid' and 'mid'
  console.log(pid);
  console.log(mid);

  return new Promise<ResponseState>((resolve, reject) => {
    // Prepare the SQL statement with placeholders
    const stmt = db.prepare(`INSERT INTO ${table} (pid, mid) VALUES (?, ?)`, (err: Error | null) => {
      if (err) {
        // Handle prepare errors
        return reject({ error: err.message, status: 400 });
      }
    });

    // Execute the prepared statement with actual values
    stmt.run(pid, mid, function (runErr: Error | null) {
      if (runErr) {
        // Handle run errors
        stmt.finalize();
        return reject({ error: runErr.message, status: 400 });
      }

      stmt.finalize((finalizeErr: Error | null) => {
        if (finalizeErr) return reject({ error: finalizeErr.message, status: 400 });
        return resolve({ success: 'Successfully appended reference.', status: 200 });
      });

    });
  });
};

// Database initialization and table creation
db.serialize(() => {
  // db.run('delete from materials');

  // Create Suppliers table
  db.run(`
    CREATE TABLE IF NOT EXISTS Suppliers (
      id TEXT UNIQUE,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      PRIMARY KEY (id)
    );
  `, (err: Error) => {
    if (err) console.error('Error creating Suppliers table:', err.message);
  });

  // Create Materials table
  db.run(`
    CREATE TABLE IF NOT EXISTS Materials (
      id TEXT UNIQUE,
      sid TEXT DEFAULT 'No Supplier',
      name TEXT NOT NULL,
      price REAL DEFAULT 0 CHECK (price >= 0),
      qty INT DEFAULT 0 CHECK (qty >= 0),
      PRIMARY KEY (id),
      FOREIGN KEY (sid) REFERENCES Suppliers (id) ON DELETE SET NULL ON UPDATE CASCADE
    );
  `, (err: Error) => {
    if (err) console.error('Error creating Materials table:', err.message);
  });

  // Create Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS Products (
      id TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT NULL CHECK (category IN ('sofas', 'chairs', 'tables', 'beds', 'dressers', 'cabinets')),
      size REAL,
      intended_use TEXT CHECK (intended_use IN ('home', 'office')),
      description TEXT,
      color TEXT,
      is_saleable INT CHECK (is_saleable >= 0 AND is_saleable <= 1),
      PRIMARY KEY (id)
    );
  `, (err: Error) => {
    if (err) console.error('Error creating Products table:', err.message);
  });

  // Create Customers table
  db.run(`
    CREATE TABLE IF NOT EXISTS Customers (
      id TEXT UNIQUE,
      title TEXT CHECK (title IN ('mr', 'ms', 'mrs', 'Undefined')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      payment TEXT CHECK (payment IN ('credit_card', 'apple_pay', 'samsung_pay', 'fps')),
      account TEXT,
      PRIMARY KEY (id)
    );
  `, (err: Error) => {
    if (err) console.error('Error creating Customers table:', err.message);
  });

  // Create Stores table
  db.run(`
    CREATE TABLE IF NOT EXISTS Stores (
      id TEXT UNIQUE,
      name TEXT NOT NULL,
      PRIMARY KEY (id)
    );
  `, (err: Error) => {
    if (err) console.error('Error creating Stores table:', err.message);
  });

  // Create Furniture_Materials table with proper foreign keys
  db.run(`
    CREATE TABLE IF NOT EXISTS Furniture_Materials (
      pid TEXT,
      mid TEXT,
      FOREIGN KEY (pid) REFERENCES Products (id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (mid) REFERENCES Materials (id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `, (err: Error) => {
    if (err) console.error('Error creating Furniture_Materials table:', err.message);
  });
});

// Close the database connection gracefully on application termination
process.on('SIGINT', () => {
  db.close((err: Error) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    } else {
      console.log('\nDatabase connection closed.');
      process.exit(0);
    }
  });
});