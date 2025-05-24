import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredVars = ['POSTGRES_DB_NAME', 'POSTGRES_DB_USERNAME', 'POSTGRES_DB_PASSWORD'];
for (const varName of requiredVars) {
    if (!process.env[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
}

const postgresDb = new Sequelize(
    process.env.POSTGRES_DB_NAME, 
    process.env.POSTGRES_DB_USERNAME, 
    process.env.POSTGRES_DB_PASSWORD, 
    {
        host: process.env.POSTGRES_DB_HOST,
        port: parseInt(process.env.POSTGRES_DB_PORT) || 5432,
        dialect: "postgres",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export const syncPostgresDatabase = async () => {
    try {
        console.log(`Connecting to PostgreSQL: ${process.env.POSTGRES_DB_USERNAME}@${process.env.POSTGRES_DB_HOST}:${process.env.POSTGRES_DB_PORT}/${process.env.POSTGRES_DB_NAME}`);
        await postgresDb.authenticate();
        console.log('PostgreSQL connection has been established successfully.');
        await postgresDb.sync({ alter: true });
        console.log('PostgreSQL models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to PostgreSQL database:', error.message);
        throw error;
    }
};

export default postgresDb;
