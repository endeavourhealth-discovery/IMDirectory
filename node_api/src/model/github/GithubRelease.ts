export default class GithubRelease {
  version: string;
  title: string;
  createdDate: string;
  publishedDate: string;
  releaseNotes: string[];
  author: string;
  url: string;

  constructor(version: string, title: string, createdDate: Date, publishedDate: Date, releaseNotes: string, author: string, url: string) {
    this.version = version;
    this.title = title;
    this.createdDate = this.processDate(new Date(createdDate));
    this.publishedDate = this.processDate(new Date(publishedDate));
    this.releaseNotes = this.processReleaseNotes(releaseNotes);
    this.author = author;
    this.url = url;
  }

  processReleaseNotes(releaseNotes: string): string[] {
    return releaseNotes.split("\r\n").map(item => item.replaceAll("-   ", "").trim());
  }

  processDate(date: Date): string {
    return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }
}
