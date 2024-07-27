import mysql from 'mysql2/promise';

export const getConnection = async (): Promise<mysql.Connection> => {
    return mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456789',
      database: 'consentimientos',
    });
  };