// import { Router, Request, Response, NextFunction } from 'express';
// import { Pool } from 'pg';
// import { verifySupabaseToken, authorize, AuthRequest } from '../middleware/auth';
// import employeesRouter, { authorize } from './employees'; // Import from employees.ts
// import dotenv from 'dotenv';
// import * as path from 'path';

// dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// const router = Router();

// // Initialize PostgreSQL connection pool
// const pool = new Pool({
//   user: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || 'b5[6.mM2JNUAfB1(',
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT || '5433'),
//   database: process.env.DB_NAME || 'hrgenie',
//   ssl: process.env.DB_SSL === 'true'
// });

// // Get department statistics
// router.get('/stats/departments', verifyToken, authorize(['admin', 'hr']), async (req: any, res: Response) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         department,
//         COUNT(*) as employee_count,
//         AVG(salary) as avg_salary,
//         MIN(join_date) as earliest_join_date
//       FROM employee_details
//       GROUP BY department
//       ORDER BY department
//     `);

//     res.json(result.rows);
//   } catch (error: any) {
//     res.status(500).json({ error: error.message || 'Failed to fetch department statistics' });
//   }
// });

// router.use('/employees', employeesRouter);

// export default router;