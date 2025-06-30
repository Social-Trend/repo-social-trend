import { Express, Request, Response } from 'express';
import { db } from './db';
import { logger } from './middleware/logger';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    server: 'up' | 'down';
  };
  errors?: string[];
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

const startTime = Date.now();

async function checkDatabase(): Promise<'up' | 'down'> {
  try {
    await db.execute('SELECT 1');
    return 'up';
  } catch (error) {
    logger.error('Database health check failed', error);
    return 'down';
  }
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  const total = usage.heapTotal;
  const used = usage.heapUsed;
  
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round((used / total) * 100)
  };
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const errors: string[] = [];
  
  // Check database
  const databaseStatus = await checkDatabase();
  if (databaseStatus === 'down') {
    errors.push('Database connection failed');
  }
  
  // Check recent error rate
  const recentErrors = logger.getErrorCount(5 * 60 * 1000); // Last 5 minutes
  if (recentErrors > 10) {
    errors.push(`High error rate: ${recentErrors} errors in last 5 minutes`);
  }
  
  const memory = getMemoryUsage();
  if (memory.percentage > 90) {
    errors.push(`High memory usage: ${memory.percentage}%`);
  }
  
  const status: HealthStatus = {
    status: errors.length === 0 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: databaseStatus,
      server: 'up'
    },
    uptime: Date.now() - startTime,
    memory,
    ...(errors.length > 0 && { errors })
  };
  
  return status;
}

export function setupHealthRoutes(app: Express) {
  // Liveness probe - simple check that server is running
  app.get('/health/live', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString()
    });
  });
  
  // Readiness probe - comprehensive health check
  app.get('/health/ready', async (req: Request, res: Response) => {
    try {
      const health = await getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      logger.error('Health check failed', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  });
  
  // Metrics endpoint for monitoring
  app.get('/health/metrics', async (req: Request, res: Response) => {
    try {
      const health = await getHealthStatus();
      const recentLogs = logger.getLogs(undefined, 50);
      
      res.status(200).json({
        ...health,
        logs: {
          recent: recentLogs,
          errorCount: logger.getErrorCount(60 * 60 * 1000), // Last hour
          errorCountLast5Min: logger.getErrorCount(5 * 60 * 1000)
        }
      });
    } catch (error) {
      logger.error('Metrics endpoint failed', error);
      res.status(500).json({
        error: 'Failed to fetch metrics'
      });
    }
  });
}