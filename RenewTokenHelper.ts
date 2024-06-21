type WaitingPromise = {
  resolve: (value: boolean) => void;
  reject: (reason?: unknown) => void;
};

export class RenewTokenHelper {
  private static instance: RenewTokenHelper;

  private waiting: WaitingPromise[] = [];
  private token: string | undefined;
  private isRenewing = false;
  private timeout = 60 * 1000;

  private constructor () {
  }

  public static getInstance (): RenewTokenHelper {
    if (!RenewTokenHelper.instance) {
      RenewTokenHelper.instance = new RenewTokenHelper();
    }
    return RenewTokenHelper.instance;
  }

  public cleanToken (): void {
    this.token = undefined;
  }

  public async renewingToken (): Promise<boolean> {
    if (this.token) {
      return this.isRenewing;
    }
    return this.renewToken();
  }

  private async renewToken (): Promise<boolean> {
    if (this.isRenewing) {
      // If already renewing, wait for the renewal to complete
      return new Promise((resolve, reject) => this.waiting.push({ resolve, reject }));
    }

    // Set the renewing flag
    this.isRenewing = true;

    try {
      // Call the provided renewToken function
      const successful = await Promise.race([
        // Calling method to renew token here
        // Eg: oidcService.renewToken(),
        this.createTimeoutPromise()
      ]);

      // Set the renewed token
      this.token = 'Renewed';

      // Resolve all waiting promises
      while (this.waiting.length > 0) {
        const { resolve } = this.waiting.shift()!;
        resolve(successful);
      }

      return successful;
    } catch (error) {
      // If renewal fails, reject all waiting promises
      while (this.waiting.length > 0) {
        const { reject } = this.waiting.shift()!;
        reject(error);
      }
      throw error;
    } finally {
      // Clear the renewing flag
      this.isRenewing = false;
    }
  }

  private createTimeoutPromise (): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Token renewal timed out')), this.timeout)
    );
  }
}
