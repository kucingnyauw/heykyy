import React, { useMemo, useState, useCallback, memo } from "react";
import { Box, useTheme, alpha, Typography } from "@mui/material";
import parse, { domToReact } from "html-react-parser";
import {
  SyntaxHighlighter,
  dracula,
  tomorrow,
  detectLanguage,
} from "@heykyy/utils-frontend";
import { IconButton } from "@heykyy/components";
import { Copy, Check } from "lucide-react";

// Helper dipindah ke luar agar tidak dibuat ulang setiap render
const extractText = (nodes = []) =>
  nodes
    .map((node) => {
      if (node.type === "text") return node.data;
      if (node.children) return extractText(node.children);
      return "";
    })
    .join("");

// Komponen terpisah agar state 'copied' terisolasi per-code-block
const CodeBlock = memo(({ raw, language, isDark, theme }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Clipboard failed");
    }
  }, [raw]);

  return (
    <Box
      sx={{
        my: 2, // Dikurangi dari 4
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDark
          ? alpha(theme.palette.background.default, 0.4)
          : alpha(theme.palette.grey[50], 0.8),
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.2)"
          : "0 4px 20px rgba(0,0,0,0.02)",
      }}
    >
      {/* Header Code Block */}
      <Box
        sx={{
          px: 1.5, // Dikurangi dari 2
          py: 0.75, // Dikurangi dari 1
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: isDark 
            ? alpha(theme.palette.background.paper, 0.4) 
            : theme.palette.common.white,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: theme.palette.text.secondary,
            fontSize: "0.7rem",
          }}
        >
          {language}
        </Typography>

        <IconButton
          size="medium"
          onClick={handleCopy}
          icon={copied ? <Check size={14} color={theme.palette.success.main} /> : <Copy size={14} />}
          sx={{ color: copied ? "success.main" : "text.secondary" }}
        />
      </Box>

      {/* Code Area */}
      <SyntaxHighlighter
        language={language}
        style={isDark ? dracula : tomorrow}
        wrapLongLines
        customStyle={{
          margin: 0,
          padding: theme.spacing(1.5), // Dikurangi dari 2.5
          fontSize: "0.9rem",
          lineHeight: 1.5,
          background: "transparent",
        }}
      >
        {raw}
      </SyntaxHighlighter>
    </Box>
  );
});

const HtmlContent = ({ html = "" }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const content = useMemo(() => {
    return parse(html, {
      replace(domNode) {
        /* ================= IFRAME ================= */
        if (domNode.name === "iframe") {
          const src = domNode.attribs?.src || "";
          const allowedHosts = [
            "youtube.com",
            "www.youtube.com",
            "youtu.be",
            "player.vimeo.com",
          ];
          const isAllowed = allowedHosts.some((host) => src.includes(host));

          if (!isAllowed) return null;

          return (
            <Box
              sx={{
                my: 2, // Dikurangi dari 4
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1],
              }}
            >
              <Box
                component="iframe"
                src={src}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                sx={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "16/9",
                  border: 0,
                }}
              />
            </Box>
          );
        }

        /* ================= PRE (CODE BLOCK) ================= */
        if (domNode.name === "pre") {
          const raw = extractText(domNode.children)
            .replace(/&nbsp;/g, " ")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .trim();

          const className = domNode.attribs?.class || "";
          let language = detectLanguage(raw) || "javascript";
          
          if (className.includes("language-")) {
            language = className.replace("language-", "").split(" ")[0];
          }

          return <CodeBlock raw={raw} language={language} isDark={isDark} theme={theme} />;
        }

        /* ================= INLINE CODE ================= */
        if (domNode.name === "code" && domNode.parent?.name !== "pre") {
          return (
            <Box
              component="code"
              sx={{
                px: 0.5,
                py: 0.2,
                borderRadius: 1,
                fontSize: "0.85em",
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: isDark ? theme.palette.primary.light : theme.palette.primary.dark,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {domToReact(domNode.children)}
            </Box>
          );
        }
      },
    });
  }, [html, theme, isDark]);

  return (
    <Box
      sx={{
        width: "100%",
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.text.primary,
        lineHeight: 1.7,
        wordBreak: "break-word",

        /* ====== PARAGRAPH ====== */
        "& p": {
          fontSize: { xs: "1rem", md: "1.1rem" }, // Sedikit dikecilkan agar proporsional dengan spacing baru
          fontWeight: 400,
          color: alpha(theme.palette.text.primary, 0.85),
          mb: "1em", // Dikurangi dari 1.5em
          lineHeight: 1.7,
        },

        /* ====== HEADINGS ====== */
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          fontFamily: theme.typography.fontFamily,
          fontWeight: 800,
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          mt: "1.5em", // Dikurangi dari 2em
          mb: "0.5em", // Dikurangi dari 0.75em
          color: theme.palette.text.primary,
        },
        "& h1": { fontSize: { xs: "1.8rem", md: "2.2rem" }, mt: "0.5em" },
        "& h2": { fontSize: { xs: "1.5rem", md: "1.75rem" } },
        "& h3": { fontSize: { xs: "1.25rem", md: "1.4rem" } },
        "& h4": { fontSize: "1.1rem" },

        /* ====== LISTS ====== */
        "& ul, & ol": {
          fontSize: { xs: "1rem", md: "1.1rem" },
          color: alpha(theme.palette.text.primary, 0.85),
          pl: 2.5, // Dikurangi dari 3
          mb: "1em", // Dikurangi dari 1.5em
          "& li": {
            mb: "0.25em", // Dikurangi dari 0.5em
            "&::marker": {
              color: theme.palette.primary.main,
            },
          },
        },

        /* ====== IMAGES ====== */
        "& img": {
          display: "block",
          maxWidth: "100%",
          height: "auto",
          my: "1.5em", // Dikurangi dari 3em
          mx: "auto",
          borderRadius: 2,
          boxShadow: isDark 
            ? "0 4px 20px rgba(0,0,0,0.3)" 
            : "0 4px 20px rgba(0,0,0,0.05)",
        },

        /* ====== BLOCKQUOTES ====== */
        "& blockquote": {
          my: "1.5em", // Dikurangi dari 2.5em
          mx: 0,
          py: 0.5, // Dikurangi dari 1
          px: 2, // Dikurangi dari 3
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          borderRadius: "0 8px 8px 0",
          "& p": {
            fontSize: { xs: "1.1rem", md: "1.2rem" },
            lineHeight: 1.6,
            fontStyle: "italic",
            color: alpha(theme.palette.text.primary, 0.7),
            mb: 0,
          },
        },

        /* ====== DIVIDERS ====== */
        "& hr": {
          my: 3, // Dikurangi dari 6
          border: 0,
          textAlign: "center",
          "&:before": {
            content: '"⋯"',
            fontSize: "1.5rem",
            letterSpacing: "0.5em",
            color: theme.palette.divider,
          },
        },

        /* ====== LINKS ====== */
        "& a": {
          color: theme.palette.primary.main,
          textDecoration: "none",
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderBottomColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        },

        /* ====== TABLES ====== */
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          my: "1.5em", // Dikurangi dari 2.5em
          fontSize: "0.95rem",
        },
        "& th, & td": {
          border: `1px solid ${theme.palette.divider}`,
          p: 1, // Dikurangi dari 1.5
          textAlign: "left",
        },
        "& th": {
          backgroundColor: alpha(theme.palette.text.primary, 0.03),
          fontWeight: 700,
        },
      }}
    >
      {content}
    </Box>
  );
};

export default memo(HtmlContent);