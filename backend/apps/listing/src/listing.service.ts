import { Injectable } from '@nestjs/common';

@Injectable()
export class ListingService {
  getHello(): string {
    return 'Hello World!';
  }
}
