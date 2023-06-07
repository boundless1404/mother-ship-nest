import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    //
  }
  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const httpContext = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const request = httpContext.getRequest();

    // const responseBody = {
    //     code: httpStatus,
    //     message: '',

    // }

    const responseBody = {
      timestamp: new Date().toISOString(),
      statusCode: httpStatus,
      ...('message' in exception ? { message: exception.message } : {}),
      path: httpAdapter.getRequestUrl(httpContext.getRequest()),
      ...('cause' in exception ? { cause: exception.cause } : {}),
      ...('stack' in exception ? { stack: exception.stack } : {}),
      ...('response' in exception ? { response: exception.response } : {}),
    };

    if (
      [HttpStatus.BAD_REQUEST, HttpStatus.INTERNAL_SERVER_ERROR].includes(
        httpStatus,
      )
    ) {
      Logger.error(
        `Execption has been thrown when accessing the path: ${responseBody.path}`,
        responseBody,
        { requstBody: { ...request.body }, requestMethod: request.method },
      );
      delete responseBody.stack;
      httpAdapter.reply(httpContext.getResponse(), responseBody, httpStatus);
    } else if (
      [HttpStatus.FORBIDDEN, HttpStatus.UNAUTHORIZED].includes(httpStatus)
    ) {
      Logger.error(
        `Execption has been thrown when accessing the path: ${responseBody.path}`,
        responseBody,
        { requstBody: { ...request.body }, requestMethod: request.method },
      );
      delete responseBody.stack;
      delete responseBody.cause;
      httpAdapter.reply(httpContext.getResponse(), responseBody, httpStatus);
    } else {
      httpAdapter.reply(
        httpContext.getResponse(),
        { message: responseBody.message },
        httpStatus,
      );
    }
  }
}
