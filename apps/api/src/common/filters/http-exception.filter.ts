import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const message =
      exception instanceof HttpException
        ? (() => {
            const res = exception.getResponse();
            return typeof res === 'string'
              ? res
              : ((res as { message?: string }).message ?? exception.message);
          })()
        : 'Error interno del servidor';

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status] ?? 'Unknown',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
