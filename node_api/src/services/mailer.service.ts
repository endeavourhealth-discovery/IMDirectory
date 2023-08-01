import logger from "@/middlewares/logger.middleware";
import { MailOptions } from "@im-library/interfaces";
import nodemailer from "nodemailer";

export default class MailService {
  private transporter: nodemailer.Transporter | undefined;
  private static instance: MailService;

  private constructor() {}

  static getInstance() {
    if (!MailService.getInstance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  async createLocalConnection() {
    const account = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass }
    });
  }

  async createConnection() {
    this.transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: import.meta.env.SMTP_PORT,
      secure: import.meta.env.SMTP_TLS === "yes" ? true : false,
      auth: {
        user: import.meta.env.SMTP_USERNAME,
        pass: import.meta.env.SMTP_PASSWORD
      }
    });
  }

  async sendMail(requestId: string | number | string[], options: MailOptions) {
    if (!this.transporter) throw new Error("No connection initialised. Setup a connection first.");
    else {
      return await this.transporter
        .sendMail({
          from: options.from || import.meta.env.SMTP_SENDER,
          to: options.to,
          cc: options.cc,
          bcc: options.bcc,
          subject: options.subject,
          text: options.text,
          html: options.html
        })
        .then(info => {
          logger.info(`${requestId} - Mail sent successfully.`);
          logger.info(`${requestId} - [MailResponse]=${info.response} [MessageID]=${info.messageId}`);
          if (process.env.NODE_ENV !== "production") {
            logger.info(`${requestId} - Nodemailer ethereal URL: ${nodemailer.getTestMessageUrl(info)}`);
          }
          return info;
        });
    }
  }

  async verifyConnection() {
    if (!this.transporter) throw new Error("No connection initialised. Setup a connection first.");
    else return this.transporter.verify();
  }

  getTransporter() {
    return this.transporter;
  }
}
