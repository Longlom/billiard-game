
class Table {
  width: number;
  height: number;
  padding: number;
  tableColor: string;
  borderColor: string;
  constructor(width: number, height: number, padding: number, tableColor: string, borderColor: string) {
    this.width = width;
    this.height = height;
    this.padding = padding;
    this.tableColor = tableColor;
    this.borderColor = borderColor;
  }
}

export default Table;
