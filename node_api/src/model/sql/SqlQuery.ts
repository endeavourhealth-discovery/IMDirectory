export class SqlQuery {
  alias: string = ""
  withs: string[] = []
  selects: string[] = []
  from: string = ""
  joins: string[] = []
  whereBool: string = "AND"
  wheres: string[] = []
}

