import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
  setTokenInCookies(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
    });
  }
  clearTokenInCookies(res: Response) {
    res.clearCookie('token');
  }
}
