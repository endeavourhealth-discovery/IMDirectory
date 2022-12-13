export default class APIError extends Error {
  public constructor(public status: number, public summary: string, public message: string) {
    super(message);
    this.summary = summary;
    this.status = status;
  }

  get summaryMessage() {
    return `Error ${this.status} - ${this.summary}`;
  }

  get fullMessage() {
    return this.summaryMessage + ". " + this.message;
  }
}
