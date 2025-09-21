import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const statusCode = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const error =
            typeof exceptionResponse === 'string'
                ? { statusCode, message: exceptionResponse }
                : (exceptionResponse as object);
        return httpAdapter.reply(ctx.getResponse(), error, statusCode);
    }
}
