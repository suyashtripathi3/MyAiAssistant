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
  process.env.MYSQL_DATABASE,   // e.g. ai_assistant
  process.env.MYSQLUSER,        // Railway se milega (root nahi hamesha)
  process.env.MYSQL_ROOT_PASSWORD,    // Railway se milega
  {
    host: process.env.MYSQLHOST, // e.g. containers-us-west-123.railway.app
    port: process.env.MYSQLPORT || 3306, 
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Railway/PlanetScale ke liye SSL required
      },
    },
  }
);

export default sequelize;
