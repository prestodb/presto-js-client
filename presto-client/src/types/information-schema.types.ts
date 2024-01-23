export interface Table {
  tableCatalog: string
  tableName: string
  tableSchema: string
  tableType: string
}

export interface Column {
  columnDefault: unknown
  columnName: string
  comment: string
  dataType: string
  extraInfo: unknown
  isNullable: boolean
  ordinalPosition: number
  tableCatalog: string
  tableName: string
  tableSchema: string
}
