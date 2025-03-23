import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Metadata, status } from '@grpc/grpc-js';
export interface GrpcError {
  code: number; // gRPC status code (e.g., 6 for ALREADY_EXISTS)
  details: string; // Error message from gRPC
  metadata?:Metadata
}
@Injectable()
export class GrpcErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        console.log(error)
        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';

        if (error.code !== undefined) {
          switch (error.code) {
            case status.ALREADY_EXISTS:
              httpStatus = HttpStatus.BAD_REQUEST;
              break;
            case status.NOT_FOUND:
              httpStatus = HttpStatus.NOT_FOUND;
              break;
            case status.UNAUTHENTICATED:
              httpStatus = HttpStatus.UNAUTHORIZED;
              message = 'Unauthorized!';
              break;
          }
          message = error.details || message;
        }

        return throwError(() => new HttpException({ message }, httpStatus));
      }),
    );
  }
}