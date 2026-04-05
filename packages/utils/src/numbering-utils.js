export class NumberUtils {
    static _compact(value) {
      if (value == null || isNaN(value) || value < 0) return "0";
  
      return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
  
    static views(value) {
      return `${this._compact(value)}`;
    }
  
    static likes(value) {
      return `${this._compact(value)}`;
    }
  
    static followers(value) {
      return `${this._compact(value)}`;
    }
  }
  
 