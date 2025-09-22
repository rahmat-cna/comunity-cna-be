import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';
import { DefaultExceptionsFilter } from './common/filters/default-exceptions.filter';
import { TypeORMExceptionFilter } from './common/filters/typeorm-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PgExceptionFilter } from './common/filters/pg-exception.filter';
import { FileLogger } from './common/helpers/logger';
import cookieParser from 'cookie-parser';

const port = process.env.PORT || 3000;


async function bootstrap() {
  // const app = await NestFactory.create(AppModule, {
  //   bufferLogs: true,
  // });
  const app = await NestFactory.create(AppModule);

  const loggerTransports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        nestWinstonModuleUtilities.format.nestLike('MCV', {
          prettyPrint: true,
        }),
      ),
    }),
  ];

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,          // wajib biar @Type jalan
      whitelist: true,          // optional, biar field asing dibuang
      forbidNonWhitelisted: true,
    }),
  );

  const httpAdapter = app.get(HttpAdapterHost);
  const logger = WinstonModule.createLogger({ transports: loggerTransports });

  app.useGlobalFilters(
    new DefaultExceptionsFilter(httpAdapter, logger),
    new TypeORMExceptionFilter(httpAdapter, logger),
    new PgExceptionFilter(httpAdapter, logger),
    new HttpExceptionFilter(httpAdapter),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new WrapResponseInterceptor(),
  );
  
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // HARUS spesifik, jangan '*'
    credentials: true,               // supaya cookie bisa dikirim
    allowedHeaders: ['Content-Type', 'Authorization'],          // masih bisa pakai '*'
  });

  // app.useLogger(new FileLogger()); // ganti logger default

  await app.listen(Number(port));
}
bootstrap();
