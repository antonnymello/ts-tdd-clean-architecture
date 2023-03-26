export class AccessToken {
  static readonly expirationInMs = 30 * 60 * 1000; // 30 minutes

  constructor(private readonly value: string) {}
}
