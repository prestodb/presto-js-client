export interface Table {
  tableCatalog: string
  tableSchema: string
  tableName: string
  tableType: string
}

export interface Column {
  tableCatalog: string
  tableSchema: string
  tableName: string
  columnName: string
  ordinalPosition: number
  columnDefault: unknown
  isNullable: boolean
  dataType: string
  comment: string
  extraInfo: unknown
}
