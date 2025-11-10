import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  try {
    console.log('🚀 Iniciando aplicación...');
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('✅ AppModule creado');

    // Validación global
    app.useGlobalPipes(new ValidationPipe());
    console.log('✅ Pipes configurados');

    // Servir archivos estáticos del frontend
    const publicPath = join(__dirname, '..', 'public');
    app.useStaticAssets(publicPath);
    console.log('✅ Archivos estáticos configurados');

    const port = process.env.PORT || 3000;
    console.log(`📡 Iniciando servidor en puerto ${port}...`);
    
    await app.listen(port);
    console.log(`✅ Aplicación corriendo en http://localhost:${port}`);
    console.log('✅ Sistema listo');
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();
