export class AppResponse<T> {
  message: string;
  data: T;
  timestamp: number;
  errorCode?: number;

  constructor(data: T, message?: string) {
    if (!message) {
      message = 'Success';
    }
    this.message = message;
    this.data = data;
    this.timestamp = new Date().getTime();
  }
}
