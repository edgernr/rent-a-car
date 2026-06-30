import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('vehicles')
  vehicles() {
    return this.catalog.vehicles();
  }

  @Get('routes')
  routes() {
    return this.catalog.routes();
  }

  @Get('addons')
  addons() {
    return this.catalog.addons();
  }
}
