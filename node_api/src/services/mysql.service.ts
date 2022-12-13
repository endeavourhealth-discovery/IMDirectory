import mysql, { Connection, RowDataPacket } from "mysql2";
import Env from "@/services/env.service";

export class MysqlService {
  private conn: Connection | undefined;

  public execute(sql: string, params: any[]): Promise<RowDataPacket[]> {
    return new Promise((resolve, reject) => {
      this.getConnection().query(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        } else {
          const rows = <RowDataPacket[]>result;
          resolve(rows);
        }
      });
    });
  }

  private getConnection(): Connection {
    if (!this.conn) {
      this.conn = mysql.createConnection({
        host: Env.MYSQL_HOST,
        user: Env.MYSQL_USER,
        password: Env.MYSQL_PASS,
        database: Env.MYSQL_DB
      });
    }

    return this.conn;
  }
}
