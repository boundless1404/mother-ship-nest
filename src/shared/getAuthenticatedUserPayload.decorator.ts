import { AuthPayload, PlatformRequest } from './../lib/types';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAuthPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as PlatformRequest;
    if (data) {
      const authPayloadProp = data as string;
      return request.authPayload
        ? request.authPayload[authPayloadProp]
        : undefined;
    }

    return {
      userData: request.authPayload?.userData,
      profile: request.authPayload?.profile,
      apiData: request.authPayload?.apiData,
    } as AuthPayload;
  },
);
