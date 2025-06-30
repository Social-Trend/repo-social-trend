import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  meta?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private addLog(level: LogEntry['level'], message: string, meta?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    };

    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${entry.level.toUpperCase()}] ${entry.timestamp} - ${message}`, meta || '');
    }
  }

  info(message: string, meta?: any) {
    this.addLog('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.addLog('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.addLog('error', message, meta);
  }

  getLogs(level?: LogEntry['level'], limit = 100): LogEntry[] {
    let filtered = this.logs;
    
    if (level) {
      filtered = this.logs.filter(log => log.level === level);
    }
    
    return filtered.slice(-limit);
  }

  getErrorCount(timeWindow = 60 * 60 * 1000): number {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.logs.filter(log => 
      log.level === 'error' && new Date(log.timestamp) > cutoff
    ).length;
  }
}

export const logger = new Logger();

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[level](`${req.method} ${req.path} ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
}

// Error handling middleware
export function errorLogger(error: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(`Unhandled error: ${error.message}`, {
    error: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(error);
}