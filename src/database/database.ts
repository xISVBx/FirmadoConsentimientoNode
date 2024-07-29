import mysql from 'mysql2/promise';

export const getConnection = async (): Promise<mysql.Connection> => {
  const host = process.env.DB_HOST || "";
  const port = parseInt(process.env.DB_PORT || "3306");
  const user = process.env.DB_USER || "";
  const password = process.env.DB_PASS || "";
  const database = process.env.DB_DATABASE || "";

  if (!host || isNaN(port) || !user || !password || !database) {
    throw new Error('Invalid database configuration');
  }

  return mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });
};
