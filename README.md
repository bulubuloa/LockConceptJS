## RenewTokenHelper

The RenewTokenHelper class is designed to manage the renewal of an authentication token in a safe and efficient manner, ensuring that concurrent requests for token renewal do not cause multiple renewals to occur simultaneously. This is achieved by using a combination of the Singleton pattern, a locking mechanism, and a queue to handle multiple requests.

## Key Features and Explanation

### Singleton Pattern:
- Ensures that only one instance of RenewTokenHelper exists at any given time.
- This is achieved using a private constructor and a static method getInstance() which returns the single instance of the class.
```
private static instance: RenewTokenHelper;

private constructor() { }

public static getInstance(): RenewTokenHelper {
 if (!RenewTokenHelper.instance) {
 RenewTokenHelper.instance = new RenewTokenHelper();
 }
 return RenewTokenHelper.instance;
}
```

### Token Renewal Management:
- The class handles the token renewal process, ensuring that only one renewal occurs at a time even if multiple requests are made simultaneously.
- It uses a flag isRenewing to indicate whether a renewal is currently in progress.
```
private isRenewing = false;
```

### Waiting Queue:
- If a renewal is already in progress, any additional requests are added to a waiting queue.
- Each request in the queue will be resolved or rejected once the renewal process completes.

```
private waiting: WaitingPromise[] = [];
```
### Token Renewal Process:
- The renewingToken method checks if a renewal is already in progress or if the token is already set. If not, it calls the renewToken method.
```
public async renewingToken(): Promise<boolean> {
 if (this.token) {
 return this.isRenewing;
 }
 return this.renewToken();
}
```
### Renew Token Method:
- This method manages the actual token renewal process. It sets the isRenewing flag to true and attempts to renew the token using oidcService.renewToken().
- If the renewal is successful, it resolves all promises in the waiting queue. If it fails, it rejects all promises in the queue.
```
private async renewToken(): Promise<boolean> {
 if (this.isRenewing) {
 return new Promise((resolve, reject) => this.waiting.push({ resolve, reject }));
 }

 this.isRenewing = true;

 try {
 const successful = await Promise.race([
 oidcService.renewToken(),
 this.createTimeoutPromise(),
 ]);

 this.token = 'Renewed';

 while (this.waiting.length > 0) {
 const { resolve } = this.waiting.shift()!;
 resolve(successful);
 }

 return successful;
 } catch (error) {
 while (this.waiting.length > 0) {
 const { reject } = this.waiting.shift()!;
 reject(error);
 }
 throw error;
 } finally {
 this.isRenewing = false;
 }
}

```

### Timeout Mechanism:
- The class includes a timeout mechanism to ensure that if the renewal process takes too long, it will fail and reject all waiting promises.
```sh
private createTimeoutPromise(): Promise<never> {
 return new Promise((_, reject) =>
 setTimeout(() => reject(new Error('Token renewal timed out')), this.timeout)
 );
}
```

## License

The RenewTokenHelper class is a robust utility for managing the renewal of authentication tokens in applications where multiple concurrent requests might occur. By using a Singleton pattern, a locking mechanism, and a queue, it ensures that only one renewal process occurs at a time, efficiently handling multiple simultaneous requests and providing a consistent state for the token renewal process.

author: HoangQuach

MIT
