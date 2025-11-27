require('dotenv').config();
const sql = require('mssql');

// SQL Server connection configuration
const dbConfig = {
  server: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shopeelike',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise = null;

const getPool = () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        // eslint-disable-next-line no-console
        console.log('SQL Server connected successfully');
        return pool;
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('SQL Server connection error:', err.message);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

// Replace ? placeholders with @p1, @p2, ... for mssql
const prepareQuery = (query) => {
  const trimmed = query.trim().replace(/;$/, '');

  let type = 'other';
  if (/^(SELECT|WITH|EXEC)\b/i.test(trimmed)) {
    type = 'select';
  } else if (/^INSERT\b/i.test(trimmed)) {
    type = 'insert';
  } else if (/^(UPDATE|DELETE)\b/i.test(trimmed)) {
    type = 'write';
  }

  let paramIndex = 0;
  const text = trimmed.replace(/\?/g, () => {
    paramIndex += 1;
    return `@p${paramIndex}`;
  });

  return { text, type, paramCount: paramIndex };
};

const runQuery = async (rawQuery, params = [], transaction = null) => {
  const pool = await getPool();
  const { text, type, paramCount } = prepareQuery(rawQuery);

  const request = transaction ? new sql.Request(transaction) : pool.request();

  for (let i = 0; i < paramCount; i += 1) {
    request.input(`p${i + 1}`, params[i]);
  }

  const isInsert = type === 'insert';
  const queryText = isInsert ? `${text}; SELECT SCOPE_IDENTITY() AS insertId;` : text;

  const result = await request.query(queryText);

  if (type === 'select') {
    return [result.recordset || []];
  }

  if (isInsert) {
    const insertId =
      (result.recordset && result.recordset[0] && result.recordset[0].insertId) || null;

    return [
      {
        insertId,
        rowsAffected: result.rowsAffected,
        affectedRows: result.rowsAffected.reduce((sum, v) => sum + v, 0),
      },
    ];
  }

  return [
    {
      rowsAffected: result.rowsAffected,
      affectedRows: result.rowsAffected.reduce((sum, v) => sum + v, 0),
    },
  ];
};

// Emulate mysql2/promise pool interface
const pool = {
  execute: (query, params = []) => runQuery(query, params),
  query: (query, params = []) => runQuery(query, params),
  getConnection: async () => {
    const sqlPool = await getPool();
    let transaction = null;

    return {
      beginTransaction: async () => {
        if (transaction) return;
        transaction = new sql.Transaction(sqlPool);
        await transaction.begin();
      },
      commit: async () => {
        if (!transaction) return;
        await transaction.commit();
        transaction = null;
      },
      rollback: async () => {
        if (!transaction) return;
        try {
          await transaction.rollback();
        } finally {
          transaction = null;
        }
      },
      execute: (query, params = []) => runQuery(query, params, transaction),
      query: (query, params = []) => runQuery(query, params, transaction),
      release: () => {
        // mssql manages pooling itself; nothing to release explicitly
      },
    };
  },
};

const testConnection = async () => {
  try {
    // Debug: Log database configuration
    // eslint-disable-next-line no-console
    console.log('Database Config Debug:');
    // eslint-disable-next-line no-console
    console.log('   DB_HOST:', process.env.DB_HOST || 'localhost');
    // eslint-disable-next-line no-console
    console.log('   DB_USER:', process.env.DB_USER || 'NOT SET');
    // eslint-disable-next-line no-console
    console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    // eslint-disable-next-line no-console
    console.log('   DB_NAME:', process.env.DB_NAME || 'shopeelike');

    const sqlPool = await getPool();
    await sqlPool.request().query('SELECT 1 AS ok');
    // eslint-disable-next-line no-console
    console.log('SQL Server database connected successfully');
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', error.message);
    return false;
  }
};

const initDatabase = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to database. Please check your configuration.');
    process.exit(1);
  }
};

module.exports = {
  pool,
  testConnection,
  initDatabase,
};

