import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlatformAdminGuard } from '../common/auth/guards';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto';

/** Platform plane — white-glove vendor onboarding & approval. */
@ApiTags('admin/vendors')
@Controller('admin/vendors')
@UseGuards(PlatformAdminGuard)
export class AdminVendorsController {
  constructor(private readonly vendors: VendorsService) {}

  @Post()
  create(@Body() dto: CreateVendorDto) {
    return this.vendors.createVendor(dto);
  }

  @Get()
  list() {
    return this.vendors.listVendors();
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.vendors.approveVendor(id);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.vendors.suspendVendor(id);
  }
}
