import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, VendorRegisterDto } from './dto';
import { SESSION_COOKIE, SESSION_TTL_DAYS } from './crypto';
import { RequestContextStore } from '../common/request-context/request-context';

// @fastify/cookie augments these at runtime; type them locally to stay strict.
type CookieReply = FastifyReply & {
  setCookie(name: string, value: string, opts: Record<string, unknown>): unknown;
  clearCookie(name: string, opts?: Record<string, unknown>): unknown;
};
type CookieRequest = FastifyRequest & { cookies: Record<string, string | undefined> };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setSession(res: FastifyReply, token: string): void {
    (res as CookieReply).setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    });
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: FastifyReply) {
    const { token, user } = await this.auth.registerCustomer(dto);
    this.setSession(res, token);
    return { user };
  }

  @Post('vendor/register')
  async registerVendor(
    @Body() dto: VendorRegisterDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { token, user, vendor } = await this.auth.registerVendor(dto);
    this.setSession(res, token);
    return { user, vendor };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const { token, user } = await this.auth.login(dto.email, dto.password);
    this.setSession(res, token);
    return { user };
  }

  @Post('logout')
  async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const token = (req as CookieRequest).cookies?.[SESSION_COOKIE];
    await this.auth.logout(token);
    (res as CookieReply).clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  async me() {
    const { userId } = RequestContextStore.get();
    if (!userId) throw new UnauthorizedException();
    return this.auth.me(userId);
  }
}
