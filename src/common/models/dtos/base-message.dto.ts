export abstract class BaseMessageDto {
  createdAt: string;
  expiresAt: string;
  messageType: string;

  constructor(messageType: string) {
    this.messageType = messageType;
    this.createdAt = new Date().toISOString();
    this.expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
  }
  isExpired(): boolean {
    return new Date() > new Date(this.expiresAt);
  }

  getRemainingTime(): number {
    const now = new Date();
    const expiration = new Date(this.expiresAt);
    return Math.max(0, expiration.getTime() - now.getTime());
  }

  getRemainingTimeFormatted(): string {
    const remaining = this.getRemainingTime();
    if (remaining <= 0) {
      return 'expired';
    }

    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}
