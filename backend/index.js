import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import routes from './routes/routes.js';
import { syncMySQLDatabase } from './config/mysqlDatabase.js';
import { syncPostgresDatabase } from './config/postgresDatabase.js';
import './models/associations.js';  // Import associations to ensure they're set up

dotenv.config();

const app = express();

// Configure CORS for credentials
app.use(cors({
  // Allow requests from these origins (add your frontend URL)
  origin: [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  // Allow credentials (cookies)
  credentials: true,
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Allowed headers
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse cookies
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// Use routes
app.use(routes);

// Sync all databases before starting server
const initializeDatabases = async () => {
  try {
    console.log('Initializing databases...');
    console.log('Environment check:');
    console.log('- MySQL DB:', process.env.MYSQL_DB_NAME || 'NOT SET');
    console.log('- PostgreSQL DB:', process.env.POSTGRES_DB_NAME || 'NOT SET');
    
    // Sync MySQL database (for users, authentication & student activities)
    await syncMySQLDatabase();
    
    // Sync PostgreSQL database (for student proposals)
    await syncPostgresDatabase();
    
    console.log('All databases initialized successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    console.error('Please check your database credentials and ensure the databases are running.');
    process.exit(1);
  }
};

initializeDatabases().then(() => {
  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Student Activity Management System running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('- Authentication: /auth/*');
    console.log('- Student Activities (MySQL): /activities');
    console.log('- Student Proposals (PostgreSQL): /proposals');
    console.log('- Admin Panel: /admin/*');
  });
});