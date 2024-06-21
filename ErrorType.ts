export enum ErrorType {
  // General
  Exception = 'Exception',

  // No internet
  ConnectionException = 'ConnectionException',

  // Cannot reach host
  ApiUnavailableException = 'ApiUnavailableException',

  // Token expired
  UnauthorizedException = 'UnauthorizedException'
}