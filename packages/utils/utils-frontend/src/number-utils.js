export class NumberUtils {
    static compact(value) {
      if (value == null || isNaN(value) || value < 0) return "0";
  
      return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
  
    static views(value) {
      return `${this.compact(value)}`;
    }
  
    static likes(value) {
      return `${this.compact(value)}`;
    }
  
    static followers(value) {
      return `${this.compact(value)}`;
    }
  }
  
 