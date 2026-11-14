import { Module } from '@nestjs/common';
import { NotaDespachoController } from './nota-despacho.controller';
import { NotaDespachoService } from './nota-despacho.service';

@Module({ controllers: [NotaDespachoController], providers: [NotaDespachoService] })
export class NotaDespachoModule {}
