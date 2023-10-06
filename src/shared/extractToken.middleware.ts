import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { AuthPayload, PlatformRequest } from 'src/lib/types';
import { SharedService } from './shared.service';

@Injectable()
export class ExtractTokenMiddleWare implements NestMiddleware {
  constructor(private sharedService: SharedService) {
    //
  }
  async use(req: PlatformRequest, _: Response, next: (error?: any) => void) {
    try {
      const auth = req.headers['authorization'] || '';

      if (auth.length > 0) {
        const authToken = auth.split(' ')[1];
        const authPayload = (await this.sharedService.veryfyJwtToken(
          authToken,
        )) as AuthPayload;

        if (authPayload) {
          if ('userData' in authPayload && 'email' in authPayload.userData) {
            req.authPayload = authPayload;
          } else if (
            'apiData' in authPayload &&
            'appId' in authPayload.apiData
          ) {
            req.authPayload = authPayload;
          }
        }
      }

      // * Pass control to the next function.
      next();
    } catch (error) {
      // catch all errors
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }
  }
}
