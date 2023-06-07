import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  AuthenticatedApiData,
  AuthenticatedUserData,
  PlatformRequest,
} from 'src/lib/types';

export class IsAuthenticated implements CanActivate {
  constructor(private options: { isApiAccess?: boolean } = {}) {
    //
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.options.isApiAccess) {
      return this.checkApiAccess(context);
    }
    return this.checkUserAccess(context);
  }

  private checkApiAccess(context: ExecutionContext) {
    const apiData = this.getContextData(
      context,
      'apiData',
    ) as AuthenticatedApiData;
    const isAuthenticated = !!apiData && !!apiData.appId;

    return isAuthenticated;
  }

  private checkUserAccess(context: ExecutionContext) {
    const userData = this.getContextData(
      context,
      'userData',
    ) as AuthenticatedUserData;
    const isAuthenticated = !!userData && !!userData.id;

    return isAuthenticated;
  }

  private getContextData(
    context: ExecutionContext,
    dataProp: 'userData' | 'apiData',
  ) {
    const req = context.switchToHttp().getRequest() as PlatformRequest;
    const authPayload = req.authPayload;
    const data = authPayload ? authPayload[dataProp] : undefined;
    return data;
  }
}
