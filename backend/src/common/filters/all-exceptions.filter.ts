import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;
    let message = '服务器内部错误';
    if (typeof body === 'string') message = body;
    if (body && typeof body === 'object' && 'message' in body) {
      const value = (body as { message: string | string[] }).message;
      message = Array.isArray(value) ? value.join('; ') : value;
    }
    response.status(status).json({ code: status, message, data: null });
  }
}
