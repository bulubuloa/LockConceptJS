import { CustomError } from './CustomError';

export class HttpMessageSentArgs {
  public httpOptions?: HttpOptions;
  public httpResponse?: HttpResponse;
  public retryCount?: number;
  public error?: CustomError;

  public constructor (httpOptions?: HttpOptions, httpResponse?: HttpResponse) {
    this.httpOptions = httpOptions;
    this.httpResponse = httpResponse;
  }
}
