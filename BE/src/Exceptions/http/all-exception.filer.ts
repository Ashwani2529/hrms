import { AbstractHttpAdapter } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Catch, HttpException, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import {
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
} from '@prisma/client/runtime/library';
import { WsException } from '@nestjs/websockets/errors/ws-exception';
import { error } from 'console';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: AbstractHttpAdapter) {}
  catch(exception: HttpException | WsException, host: ArgumentsHost): void {
    let errorMessage: unknown;
    let httpStatus: number;
    const httpAdapter = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    Logger.log('Exception caught', exception.name);
    Logger.error(exception);
    if (exception instanceof PrismaClientRustPanicError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientValidationError) {
      httpStatus = 422;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientInitializationError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof WsException) {
      httpStatus = 400;
      errorMessage = exception.getError();
      console.log('Here');
    } else {
      if (exception instanceof HttpException) {
        httpStatus = exception.getStatus();
        errorMessage = exception.getResponse();
      } else {
        httpStatus = 500;
        errorMessage = [
          'Sorry! something went to wrong on our end, Please try again later',
        ];
      }
    }
    const isProd = process.env.NODE_ENV === 'production';
    const errorResponse = {
      // errors: isProd
      //   ? 'Error while processing request'
      //   : typeof errorMessage === 'string'
      //     ? [errorMessage]
      //     : errorMessage,
      errors: typeof errorMessage === 'string'
          ? [errorMessage]
          : errorMessage
    };
    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
