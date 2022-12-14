export default class APIError extends Error {
  public constructor(public status: number, public summary: string, public message: string) {
    super(message);
    this.summary = summary;
    this.status = status;
  }

  get summaryMessage(): string {
    return `Error ${this.status} - ${this.summary}`;
  }

  get fullMessage(): string {
    return this.summaryMessage + ". " + this.message;
  }
}
