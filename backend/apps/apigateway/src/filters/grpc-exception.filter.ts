import { Catch, RpcExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { Response } from 'express';
import { Metadata, status } from '@grpc/grpc-js';

// ✅ Ensure metadata is optional
export interface GrpcError {
  code: number; // gRPC status code (e.g., 6 for ALREADY_EXISTS)
  details: string; // Error message
  metadata?: Metadata; // ✅ Metadata is optional
}

@Catch(RpcException)
export class gRPCExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> { // ✅ Fix: return an Observable
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error = exception.getError() as GrpcError;
    console.error('🔥 gRPC Error:', error);

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    // ✅ Fix: Ensure error.code exists before switching
    if (typeof error === 'object' && error.code !== undefined) {
      switch (error.code) {
        case status.ALREADY_EXISTS:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = error.details || 'Email already in use';
          break;
        case status.NOT_FOUND:
          httpStatus = HttpStatus.NOT_FOUND;
          message = error.details || 'User not found';
          break;
        case status.UNAUTHENTICATED:
          httpStatus = HttpStatus.UNAUTHORIZED;
          message = error.details || 'Unauthorized';
          break;
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          message = error.details || 'Unknown error';
      }
    }

    // ✅ Fix: Return an Observable instead of directly sending response
    return throwError(() =>
      new RpcException({
        code: httpStatus,
        details: message,
      } as GrpcError),
    );
  }
}
