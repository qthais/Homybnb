import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
export interface GrpcError {
  code: number; // gRPC status code (e.g., 6 for ALREADY_EXISTS)
  details: string; // Error message from gRPC
  metadata?:Metadata
}
@Injectable()
export class GrpcExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        console.error('🔥 gRPC Exception Interceptor:', error);

        if (error instanceof RpcException) {
          const grpcError = error.getError() as GrpcError;

          switch (grpcError.code) {
            case status.ALREADY_EXISTS:
              return throwError(() => new RpcException({
                code: status.ALREADY_EXISTS,
                message: grpcError.details || 'Email already in use',
              }));
            case status.NOT_FOUND:
              return throwError(() => new RpcException({
                code: status.NOT_FOUND,
                message: grpcError.details || 'User not found',
              }));
            case status.UNAUTHENTICATED:
              return throwError(() => new RpcException({
                code: status.UNAUTHENTICATED,
                message: grpcError.details || 'Unauthorized',
              }));
            case status.PERMISSION_DENIED:
              return throwError(() => new RpcException({
                code: status.PERMISSION_DENIED,
                message: grpcError.details || 'Permission denied',
              }));
            default:
              return throwError(() => new RpcException({
                code: status.INTERNAL,
                message: grpcError.details || 'Unknown error',
              }));
          }
        }

        return throwError(() => new RpcException({ code: status.INTERNAL, message: 'Internal Server Error' }));
      }),
    );
  }
}
