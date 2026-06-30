import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VendorContextGuard } from '../common/auth/guards';
import { VendorsService } from './vendors.service';
import { CreateVehicleDto } from './dto';

/** Vendor plane — everything here is scoped to the caller's active vendor. */
@ApiTags('vendor')
@Controller('vendor')
@UseGuards(VendorContextGuard)
export class VendorController {
  constructor(private readonly vendors: VendorsService) {}

  @Get('vehicles')
  myVehicles() {
    return this.vendors.listMyVehicles();
  }

  @Post('vehicles')
  addVehicle(@Body() dto: CreateVehicleDto) {
    return this.vendors.createMyVehicle(dto);
  }
}
