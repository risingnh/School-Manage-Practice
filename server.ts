import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/auth.routes.js';
import { dashboardRouter } from './server/routes/dashboard.routes.js';
import { academicRouter } from './server/routes/academic.routes.js';
import { usersRouter } from './server/routes/users.routes.js';
import { auditRouter } from './server/routes/audit.routes.js';
import { notificationsRouter } from './server/routes/notifications.routes.js';
import { settingsRouter } from './server/routes/settings.routes.js';
import { attendanceRouter } from './server/routes/attendance.routes.js';
import { teacherActivitiesRouter } from './server/routes/teacher_activities.routes.js';
import { studentRouter } from './server/routes/student.routes.js';
import { guardianRouter } from './server/routes/guardian.routes.js';
import { examinationRouter } from './server/routes/examination.routes.js';
import { feesRouter } from './server/routes/fees.routes.js';
import { admissionsRouter } from './server/routes/admissions.routes.js';
import { documentsIdCardsRouter } from './server/routes/student-documents-idcards.routes.js';
import { promotionsTransfersRouter } from './server/routes/promotions-transfers.routes.js';
import { studentReportsRouter } from './server/routes/student-reports.routes.js';
import { communicationRouter } from './server/routes/communication.routes.js';
import { staffRouter } from './server/routes/staff.routes.js';
import { frontOfficeRouter } from './server/routes/front-office.routes.js';
import { inventoryRouter } from './server/routes/inventory.routes.js';
import { documentsRouter } from './server/routes/document.routes.js';
import { certificateRouter } from './server/routes/certificate.routes.js';
import { documentReportsRouter } from './server/routes/document-reports.routes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser & URL Encoded
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'online',
      system: 'Sygmate School Management System',
      version: '1.0.0-part1',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Sub-Routers
  app.use('/api/auth', authRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/academic', academicRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/audit-logs', auditRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/attendance', attendanceRouter);
  app.use('/api/activities', teacherActivitiesRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/guardian', guardianRouter);
  app.use('/api/examinations', examinationRouter);
  app.use('/api/fees', feesRouter);
  app.use('/api/admissions', admissionsRouter);
  app.use('/api/documents-idcards', documentsIdCardsRouter);
  app.use('/api/promotions-transfers', promotionsTransfersRouter);
  app.use('/api/student-reports', studentReportsRouter);
  app.use('/api/communication', communicationRouter);
  app.use('/api/staff', staffRouter);
  app.use('/api/front-office', frontOfficeRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/documents', documentsRouter);
  app.use('/api/certificates', certificateRouter);
  app.use('/api/document-reports', documentReportsRouter);
  app.use('/api/documents/reports', documentReportsRouter);

  // 404 Handler for unmatched API endpoints - Prevents falling through to Vite SPA index.html
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND'
    });
  });

  // Centralized Error Handling for API routes
  app.use('/api/*', (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[API Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error occurred.',
      code: err.code || 'SERVER_ERROR'
    });
  });

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sygmate Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Sygmate Server Startup Error]:', err);
  process.exit(1);
});
