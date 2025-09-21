import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FollowersModule } from './followers/followers.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { HashtagsModule } from './hashtags/hashtags.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { CdcModule } from './cdc/cdc.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        // url: configService.get('DATABASE_URL'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        // ssl: {
        //   rejectUnauthorized: true,
        //   ca: fs.readFileSync('ca_cert.crt').toString(),
        // },
        synchronize: true,
      }),
      
      inject: [ConfigService],
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // folder tempat file disimpan
      serveRoot: '/uploads',                      // prefix url -> http://localhost:5000/uploads/...
    }),

    ElasticsearchModule.register({
      node: 'http://localhost:9200',
    }),

    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),

    AuthModule,
    UserModule,
    FollowersModule,
    PostsModule,
    LikesModule,
    CommentsModule,
    HashtagsModule,
    // SearchModule,
    // CdcModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
