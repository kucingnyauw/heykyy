export class LanguageUtil {
    /**
     * Detects the programming language of a given code snippet.
     * Supports: JSON, JS/TS, Go, Rust, Dart, Kotlin, Swift, Python,
     * PHP, Java, C/C++, SQL, HTML/Markup, Bash, Docker, YAML, Markdown.
     *
     * @param {string} code - Raw code snippet
     * @returns {string} Detected language identifier
     */
    static detectLanguage = (code) => {
      code = code.trim();
      if (!code) return "text";
  
      if (/^[\s\r\n]*[\{\[][\s\S]*[\}\]][\s\r\n]*$/.test(code)) {
        return "json";
      }
  
      if (
        /import\s+.*\s+from\s+['"]|export\s+(const|let|default|class)|const\s+\w+\s*=|let\s+\w+\s*=|=>|console\.log|document\.get|process\.env/m.test(
          code
        ) ||
        (code.includes("import") && code.includes(";"))
      ) {
        const isTypeScript =
          /(interface|type)\s+\w+\s*\{|:\s*\b(string|number|boolean|any|void|unknown|never)\b|as\s+(string|any|const)/m.test(
            code
          ) ||
          /public\s+|private\s+|protected\s+/.test(code);
  
        const isJava = /System\.out\.print|@Override/.test(code);
  
        if (isTypeScript && !isJava) return "typescript";
        return "javascript";
      }
  
      if (/package\s+\w+|func\s+\w+\(|go\s+func|chan\s+\w+|defer\s+|:=/m.test(code)) {
        return "go";
      }
  
      if (
        /fn\s+\w+\s*\(|let\s+mut\s+|impl\s+\w+|match\s+\w+\s*\{|pub\s+use|println!/m.test(
          code
        )
      ) {
        return "rust";
      }
  
      if (
        /void\s+main\(\)|Widget\s+build\(|extends\s+StatelessWidget|extends\s+StatefulWidget|final\s+.*\s*=\s*new/m.test(
          code
        )
      ) {
        return "dart";
      }
  
      if (
        /fun\s+\w+\s*\(|val\s+\w+\s*[:=]|var\s+\w+\s*[:=]|data\s+class|companion\s+object/m.test(
          code
        )
      ) {
        return "kotlin";
      }
  
      if (
        /func\s+\w+\s*\(|guard\s+let\s+|if\s+let\s+|@objc|override\s+func/m.test(
          code
        )
      ) {
        return "swift";
      }
  
      if (
        /^\s*(def\s+\w+\(|class\s+\w+\:|elif\s+|if\s+__name__\s*==|print\s*\()/m.test(
          code
        ) ||
        (/^\s*(import\s+\w+|from\s+\w+\s+import)/m.test(code) &&
          !code.includes(";"))
      ) {
        return "python";
      }
  
      if (/<\?php|(\$\w+\s*=)|foreach\s*\(.*as.*\)/m.test(code)) {
        return "php";
      }
  
      if (
        /public\s+class\s+\w+|public\s+static\s+void\s+main|System\.out\.print|@Override/m.test(
          code
        )
      ) {
        return "java";
      }
  
      if (/#include\s+<.*>|int\s+main\s*\(|printf\s*\(|std::cout/m.test(code)) {
        return "c";
      }
  
      if (
        /(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+(FROM|INTO|TABLE|SET)/i.test(
          code
        )
      ) {
        return "sql";
      }
  
      if (/<!DOCTYPE\s+html>|<\/\w+>|<[a-z][\s\S]*>/.test(code)) {
        return "markup";
      }
  
      if (/^#!.*(bash|sh)|echo\s+["']|export\s+\w+=|sudo\s+/m.test(code)) {
        return "bash";
      }
  
      if (/^(FROM|RUN|CMD|ENTRYPOINT|EXPOSE|ENV|WORKDIR|COPY|ADD)\s/m.test(code)) {
        return "docker";
      }
  
      if (
        /^\s*[\w-]+\s*:\s+[\w\d'"\-\[].*$/m.test(code) &&
        !code.includes("{") &&
        !code.includes(";")
      ) {
        return "yaml";
      }
  
      if (/^(#+\s|>\s|- \s|\* \s|\[.*\]\(.*\))/m.test(code)) {
        return "markdown";
      }
  
      return "text";
    };
  }