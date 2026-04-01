export const handleSuccess = (response, onSuccess) => {
    if (!response) return null;
    const { success, data, pagination } = response;
    if (success && typeof onSuccess === "function") return onSuccess(data, pagination);
    return null;
  };
  
  export const handleError = (error, onError) => {
    if (!error) return null;
    const message =
      error?.response?.data?.message || error.message || "Terjadi kesalahan";
    const errors = error?.response?.data?.errors || null;
    if (typeof onError === "function") return onError(message, errors);
    return { message, errors };
  };
  

  export const detectLanguage = (code) => {
    code = code.trim();
    if (!code) return "text";
  
    // Python
    if (/^\s*(def |import |print\()/m.test(code)) return "python";
  
    // JS / TS
    if (/console\.log|function|let |const |import .* from|export /m.test(code)) return "javascript";
  
    // Java / Kotlin / Dart
    if (/List<\w+>|Map<\w+,\s*\w+>|class\s+\w+|public |void |System\.out\.println/m.test(code)) return "java";
  
    // C / C++
    if (/#include|int main|printf|scanf/m.test(code)) return "c";
  
    // Bash / Shell
    if (/^#!.*(bash|sh)|echo |export |cd |sudo /m.test(code)) return "bash";
  
    // Dockerfile
    if (/^(FROM|RUN|CMD|ENTRYPOINT|EXPOSE|ENV|WORKDIR|COPY|ADD)\b/m.test(code)) return "docker";
  
    // YAML
    if (/^\s*\w+:\s+.+/m.test(code)) return "yaml";
  
    // JSON
    if (/^\s*[\{\[][\s\S]*[\}\]]\s*$/m.test(code)) return "json";
  
    // SQL
    if (/SELECT |INSERT |UPDATE |DELETE |FROM |WHERE /i.test(code)) return "sql";
  
    // HTML / Markup
    if (/<\/?\w+>/m.test(code)) return "markup";
  
    // CSS / SCSS
    if (/\w+\s*{[^}]*}/m.test(code)) return "css";
  
    // Markdown
    if (/^#+\s/.test(code)) return "markdown";
  
    // Ruby
    if (/def |puts |end|class /m.test(code)) return "ruby";
  
    // Go
    if (/func |package |import /m.test(code)) return "go";
  
    // Rust
    if (/fn |let mut |struct |impl /m.test(code)) return "rust";
  
    return "text";
  };