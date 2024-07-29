import mysql from 'mysql2/promise';

export const getConnection = async (): Promise<mysql.Connection> => {
    return mysql.createConnection({
      host: 'localhost',
      port: 3306,

      user: 'root',
      password: '1234',
      database: 'consentimientos',
    });
  };