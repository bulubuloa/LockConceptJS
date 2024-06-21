import { ErrorType } from "./ErrorType";

export class CustomError {
  public type: ErrorType;
  public code?: number;
  public message?: string;
  public originalError: unknown;

  public constructor (type: ErrorType) {
    this.type = type;
  }
}