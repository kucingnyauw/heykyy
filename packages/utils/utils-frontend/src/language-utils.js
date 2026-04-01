/**
 * Detects the programming language of a given code snippet.
 * Updated to include Go, Rust, Swift, Kotlin, and Dart.
 */
export const detectLanguage = (code) => {
  const originalCode = code;
  code = code.trim();
  if (!code) return "text";

  // 1. JSON
  if (/^[\s\r\n]*[\{\[][\s\S]*[\}\]][\s\r\n]*$/.test(code)) return "json";

  // 2. JAVASCRIPT / TYPESCRIPT
  // 2. JAVASCRIPT / TYPESCRIPT
  if (
    /import\s+.*\s+from\s+['"]|export\s+(const|let|default|class)|const\s+\w+\s*=|let\s+\w+\s*=|=>|console\.log|document\.get|process\.env/m.test(
      code
    ) ||
    (code.includes("import") && code.includes(";"))
  ) {
    // Cek TypeScript lebih teliti:
    // 1. Interface/Type declaration
    // 2. Type annotation pada variabel/parameter (misal: ': string', ': number[]')
    // Kita tambahkan \b (word boundary) agar 'is:' tidak dianggap 'string'
    if (
      /(interface|type)\s+\w+\s*\{|:\s*\b(string|number|boolean|any|void|unknown|never)\b|as\s+(string|any|const)/m.test(
        code
      ) ||
      /public\s+|private\s+|protected\s+/.test(code) // Modifiers khusus TS/Java
    ) {
      // Pastikan bukan Java (karena Java juga punya public/private)
      if (!/System\.out\.print|@Override/.test(code)) {
        return "typescript";
      }
    }
    return "javascript";
  }

  // 3. GO (Golang) - NEW
  // Ciri khas: package, func, chan, defer, go func, :=
  if (/package\s+\w+|func\s+\w+\(|go\s+func|chan\s+\w+|defer\s+|:=/m.test(code))
    return "go";

  // 4. RUST - NEW
  // Ciri khas: fn (bukan func/function), let mut, impl, match, pub use, println!
  if (
    /fn\s+\w+\s*\(|let\s+mut\s+|impl\s+\w+|match\s+\w+\s*\{|pub\s+use|println!/m.test(
      code
    )
  )
    return "rust";

  // 5. DART (Flutter) - NEW
  // Ciri khas: void main(), Widget build, extends StatelessWidget/StatefulWidget
  if (
    /void\s+main\(\)|Widget\s+build\(|extends\s+StatelessWidget|extends\s+StatefulWidget|final\s+.*\s*=\s*new/m.test(
      code
    )
  )
    return "dart";

  // 6. KOTLIN (Android) - NEW
  // Ciri khas: fun (bukan fn/func), val/var, data class, companion object
  if (
    /fun\s+\w+\s*\(|val\s+\w+\s*[:=]|var\s+\w+\s*[:=]|data\s+class|companion\s+object/m.test(
      code
    )
  )
    return "kotlin";

  // 7. SWIFT (iOS) - NEW
  // Ciri khas: func, let/var, guard let, self., @objc
  if (
    /func\s+\w+\s*\(|guard\s+let\s+|if\s+let\s+|@objc|override\s+func/m.test(
      code
    )
  )
    return "swift";

  // 8. PYTHON
  if (
    /^\s*(def\s+\w+\(|class\s+\w+\:|elif\s+|if\s+__name__\s*==|print\s*\()/m.test(
      code
    ) ||
    (/^\s*(import\s+\w+|from\s+\w+\s+import)/m.test(code) &&
      !code.includes(";"))
  ) {
    return "python";
  }

  // 9. PHP
  if (/<\?php|(\$\w+\s*=)|foreach\s*\(.*as.*\)/m.test(code)) return "php";

  // 10. JAVA
  if (
    /public\s+class\s+\w+|public\s+static\s+void\s+main|System\.out\.print|@Override/m.test(
      code
    )
  )
    return "java";

  // 11. C / C++
  if (/#include\s+<.*>|int\s+main\s*\(|printf\s*\(|std::cout/m.test(code))
    return "c";

  // 12. SQL
  if (
    /(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+(FROM|INTO|TABLE|SET)/i.test(
      code
    )
  )
    return "sql";

  // 13. HTML / MARKUP
  if (/<!DOCTYPE\s+html>|<\/\w+>|<[a-z][\s\S]*>/.test(code)) return "markup";

  // 14. BASH
  if (/^#!.*(bash|sh)|echo\s+["']|export\s+\w+=|sudo\s+/m.test(code))
    return "bash";

  // 15. DOCKER
  if (/^(FROM|RUN|CMD|ENTRYPOINT|EXPOSE|ENV|WORKDIR|COPY|ADD)\s/m.test(code))
    return "docker";

  // 16. YAML
  if (
    /^\s*[\w-]+\s*:\s+[\w\d'"\-\[].*$/m.test(code) &&
    !code.includes("{") &&
    !code.includes(";")
  )
    return "yaml";

  // 17. MARKDOWN
  if (/^(#+\s|>\s|- \s|\* \s|\[.*\]\(.*\))/m.test(code)) return "markdown";

  return "text";
};
