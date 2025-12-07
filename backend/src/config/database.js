require('dotenv').config();
const sql = require('mssql');

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getPool = () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log('SQL Server connected successfully');
        return pool;
      })
      .catch((err) => {
        console.error('SQL Server connection error:', err.message);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

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
      },
    };
  },
};

const testConnection = async () => {
  try {
    console.log('Database Config Debug:');
    console.log('   DB_HOST:', process.env.DB_HOST || 'localhost');
    console.log('   DB_USER:', process.env.DB_USER || 'NOT SET');
    console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
    console.log('   DB_NAME:', process.env.DB_NAME || 'shopeelike');

    const sqlPool = await getPool();
    await sqlPool.request().query('SELECT 1 AS ok');
    console.log('SQL Server database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

const initDatabase = async () => {
  const maxRetries = parseInt(process.env.DB_INIT_MAX_RETRIES || '20', 10);
  const delayMs = parseInt(process.env.DB_INIT_RETRY_DELAY_MS || '3000', 10);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const isConnected = await testConnection();
    if (isConnected) {
      return;
    }

    if (attempt < maxRetries) {
      console.warn(
        `Database not ready (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
    }
  }

  console.error(
    'Failed to connect to database after multiple attempts. Please check your configuration.'
  );
  process.exit(1);
};

module.exports = {
  pool,
  getPool,
  testConnection,
  initDatabase,
};
