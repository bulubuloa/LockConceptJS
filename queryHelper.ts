import { CustomError } from './CustomError';
import { ErrorType } from './ErrorType';
import { HttpMessageSentArgs } from './HttpMessageSentArgs';
import { RenewTokenHelper } from './RenewTokenHelper';

export const RETRY_RENEW_TOKEN_MAX = 5;

export enum HttpMethod {
  get,
  postJson
}

export async function get<T> (url: string, params: string) : Promise<T> {
  let args: HttpMessageSentArgs;
  let retry = 0;
  do {
    args = await onSendRequest(HttpMethod.get, url, params);
    args.retryCount = retry++;
    await onSent(args);
  } while (args?.error !== undefined && args?.retryCount < RETRY_RENEW_TOKEN_MAX);

  return args.httpResponse?.data as T;
}

export async function postJson<T> (url: string, requestData: unknown) : Promise<T> {
  let args: HttpMessageSentArgs;
  let retry = 0;
  do {
    args = await onSendRequest(HttpMethod.postJson, url, requestData);
    args.retryCount = retry++;
    await onSent(args);
  } while (args?.error !== undefined && args?.retryCount < RETRY_RENEW_TOKEN_MAX);

  return args.httpResponse?.data as T;
}

async function onSendRequest (method: HttpMethod, url: string, params: string | unknown) : Promise<HttpMessageSentArgs> {
  let options: HttpOptions | undefined;
  let response: HttpResponse | undefined;
  let error: CustomError | undefined;
  try {
    options = await buildHeader(method, url, params);
    response = await request(options);

    if (response.status < 200 || response.status > 299) {
      if (response.status === 401) {
        error = new CustomError(ErrorType.UnauthorizedException);
      } else {
        error = new CustomError(ErrorType.Exception);
      }
    }
  } catch (err) {
    error = new CustomError(ErrorType.Exception);
    error.originalError = error;
  }

  const args = new HttpMessageSentArgs(options, response);
  args.error = error;

  return args;
}

async function onSent (args: HttpMessageSentArgs) : Promise<HttpMessageSentArgs> {
  try {
    if (args.error) {
      if (args.error.type === ErrorType.UnauthorizedException) {
        console.warn('Starting renew token....');
        const helper = RenewTokenHelper.getInstance();
        helper.cleanToken();
        await helper.renewingToken();
      }

      // TODO: Implement later
    }
  } catch (err) {
    args.error = new CustomError(ErrorType.Exception);
  }
  return args;
}

async function buildHeader (method: HttpMethod, url: string, params: string | unknown) : Promise<HttpOptions> {
  const accessToken = 'TestTOKEN'
  const defaultHeader : { [key: string]: string } = {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Local-Time': new Date().toISOString(),
    Authorization: `Bearer ${accessToken}`
  };
  if (method === HttpMethod.get) {
    return {
      url: `${url}?${params}`,
      method: 'GET',
      headers: defaultHeader
    };
  } else if (method === HttpMethod.postJson) {
    defaultHeader['Content-Type'] = 'application/json';
    return {
      url: `${url}`,
      method: 'POST',
      headers: defaultHeader,
      data: params
    };
  }

  return {
    url: `${url}`
  };
}
