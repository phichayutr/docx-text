import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  })

  const config = new DocumentBuilder()
    .setTitle('Doc Convert API')
    .setDescription('HTML to PDF/DOCX conversion using LibreOffice headless')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(3001)
  console.log('Backend running on http://localhost:3001')
  console.log('Swagger docs at http://localhost:3001/docs')
}
bootstrap()
