import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const CATEGORIES = ['ECONOMY', 'SEDAN', 'SUV', 'SEVEN_SEATER', 'ELECTRIC'] as const;
const TRANSMISSIONS = ['AUTOMATIC', 'MANUAL'] as const;
const FUELS = ['PETROL', 'CNG', 'DIESEL', 'HYBRID', 'ELECTRIC'] as const;

export class CreateVendorDto {
  @IsString() @MinLength(2) legalName!: string;
  @IsString() @MinLength(2) displayName!: string;
  @IsString() @MinLength(2) slug!: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsInt() @Min(0) @Max(5000) commissionBps?: number;
}

export class CreateVehicleDto {
  @IsString() @MinLength(1) make!: string;
  @IsString() @MinLength(1) model!: string;
  @IsInt() @Min(1990) @Max(2100) year!: number;
  @IsEnum(CATEGORIES) category!: (typeof CATEGORIES)[number];
  @IsOptional() @IsEnum(TRANSMISSIONS) transmission?: (typeof TRANSMISSIONS)[number];
  @IsOptional() @IsEnum(FUELS) fuelType?: (typeof FUELS)[number];
  @IsOptional() @IsInt() @Min(1) @Max(50) seats?: number;
  @IsOptional() @IsInt() @Min(0) @Max(20) bags?: number;
  @IsOptional() @IsString() plate?: string;
  /** Daily rate in integer UZS minor units (tiyin). */
  @IsInt() @Min(0) dailyRateUzs!: number;
  @IsOptional() @IsBoolean() popular?: boolean;
}
