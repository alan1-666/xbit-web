export class ServiceConfig {
  private static _token: string = ''
  private static _refreshToken: string = ''

  public static get token(): string {
    return this._token
  }
  public static set token(val: string) {
    this._token = val
  }
  public static get isLogin(): boolean {
    return !!this._token
  }

  public static get refreshToken(): string {
    return this._refreshToken
  }
  public static set refreshToken(val: string) {
    this._refreshToken = val
  }
}
