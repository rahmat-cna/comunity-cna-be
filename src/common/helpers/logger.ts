import { LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger implements LoggerService {
  private logFile = path.join(process.cwd(), 'logs', 'app.log');

  constructor() {
    // bikin folder logs kalau belum ada
    if (!fs.existsSync(path.dirname(this.logFile))) {
      fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    }
  }

  log(message: any, context?: string) {
    this.write('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.write('ERROR', message, context, trace);
  }

  warn(message: any, context?: string) {
    this.write('WARN', message, context);
  }

  debug?(message: any, context?: string) {
    this.write('DEBUG', message, context);
  }

  verbose?(message: any, context?: string) {
    this.write('VERBOSE', message, context);
  }

  private write(level: string, message: any, context?: string, trace?: string) {
    const logLine = `[${new Date().toISOString()}] [${level}]${
      context ? ' [' + context + ']' : ''
    } ${message} ${trace ? '\n' + trace : ''}\n`;

    fs.appendFileSync(this.logFile, logLine, { encoding: 'utf8' });
  }
}
