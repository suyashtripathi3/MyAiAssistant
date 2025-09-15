// import { Sequelize } from "sequelize";
// import dotenv from "dotenv";
// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.MYSQL_DATABASE, // ai_assistant
//   process.env.MYSQL_USER, // root
//   process.env.MYSQL_PASSWORD, // Suyash032003
//   {
//     host: process.env.MYSQL_HOST, // localhost
//     dialect: "mysql",
//     logging: false, // optional: queries console me nahi dikhaye
//   }
// );

// export default sequelize;

import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,   // Database Name
  process.env.MYSQL_USER,       // Username
  process.env.MYSQL_PASSWORD,   // Password
  {
    host: process.env.MYSQL_HOST, // sql213.infinityfree.com
    port: process.env.MYSQL_PORT, // 3306
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
