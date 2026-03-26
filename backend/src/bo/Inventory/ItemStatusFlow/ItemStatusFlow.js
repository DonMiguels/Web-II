import { transitionItemStatus } from './methods/transitionItemStatus.js';

export class ItemStatusFlow {
  constructor() {
    this.transitionItemStatus = transitionItemStatus;
  }
}
