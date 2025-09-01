require('dotenv').config();
import Dexie from 'dexie';

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);


const db = new Dexie('myDB');
db.version(1).stores({
  users: '++id,name,email,synced'
});


module.exports = sequelize;


export default db;