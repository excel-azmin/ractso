import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class RequestEventEmitter extends EventEmitter {
  constructor() {
    super();
  }
}
