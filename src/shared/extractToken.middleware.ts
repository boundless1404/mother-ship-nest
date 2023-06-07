import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthPayload, PlatformRequest } from 'src/lib/types';
import { SharedService } from './shared.service';

@Injectable()
export class ExtractTokenMiddleWare implements NestMiddleware {
  constructor(private sharedService: SharedService) {
    //
  }
  async use(req: PlatformRequest, _: Response, next: (error?: any) => void) {
    const auth = req.headers.get('authorization');

    if (auth.length > 0) {
      const authToken = auth.split(' ')[0];
      const authPayload = (await this.sharedService.veryfyJwtToken(
        authToken,
      )) as unknown as AuthPayload;

      req.authPayload = authPayload;
    }

    // * Pass control to the next function.
    next();
  }
}
