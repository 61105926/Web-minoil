import { Module } from '@nestjs/common';
import { ProductosController, ProductosMobileController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  controllers: [ProductosController, ProductosMobileController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}

