import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { DefaultExceptionsFilter } from './default-exceptions.filter';
interface PostgresError extends Error {
    code?: string;
    detail?: string;
  }
@Catch(QueryFailedError)
export class PgExceptionFilter extends DefaultExceptionsFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const knownErrors = [
            '23503', // non existent key violates foreign key constraint
            '23505', // duplicate key value violates unique constraint
        ];
        const driverError = exception.driverError as PostgresError;

        if (driverError.code && knownErrors.includes(driverError.code)) {
        const responseBody = {
            statusCode: HttpStatus.BAD_REQUEST,
            message: [driverError.detail || 'Database error'],
            error: 'Bad Request',
        };
        return httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
        }

        return super.catch(exception, host);
    }
}
