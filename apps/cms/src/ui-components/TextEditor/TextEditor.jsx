import { useState, useEffect, useMemo, useRef } from "react";
import { Box, CircularProgress, useTheme, Typography } from "@mui/material";
import { uploadImageContent } from "../../services/content-service";
import { AppFlexLayout } from "@heykyy/components";
import ReactQuill, { Quill } from "react-quill";
import TextEditorWrapper from "./TextWrapper";

const TextEditor = ({ value, onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const quillRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  useMemo(() => {
    const Icons = Quill.import("ui/icons");
    Icons["undo"] = `<svg viewbox="0 0 18 18">
      <polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10"></polygon>
      <path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"></path>
    </svg>`;
    Icons["redo"] = `<svg viewbox="0 0 18 18">
      <polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon>
      <path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path>
    </svg>`;
    Icons["video"] = `<svg viewbox="0 0 18 18">
      <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
      <rect class="ql-fill" height="12" width="1" x="5" y="3"></rect>
      <rect class="ql-fill" height="12" width="1" x="12" y="3"></rect>
    </svg>`;
  }, []);

  useEffect(() => {
    if (value !== internalValue) setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const toolbar = document.querySelector(".ql-toolbar");
    if (toolbar) {
      const tooltips = {
        ".ql-undo": "Undo (Ctrl+Z)",
        ".ql-redo": "Redo (Ctrl+Y)",
        ".ql-header": "Text Style",
        ".ql-bold": "Bold (Ctrl+B)",
        ".ql-italic": "Italic (Ctrl+I)",
        ".ql-underline": "Underline (Ctrl+U)",
        ".ql-strike": "Strikethrough",
        ".ql-blockquote": "Quote",
        ".ql-code-block": "Insert Code Block",
        ".ql-list[value='ordered']": "Numbered List",
        ".ql-list[value='bullet']": "Bullet List",
        ".ql-indent[value='-1']": "Decrease Indent",
        ".ql-indent[value='+1']": "Increase Indent",
        ".ql-align": "Text Alignment",
        ".ql-link": "Insert Link",
        ".ql-image": "Upload Image",
        ".ql-video": "Embed YouTube Video",
        ".ql-clean": "Clear Formatting",
      };
      Object.keys(tooltips).forEach((selector) => {
        const el = toolbar.querySelector(selector);
        if (el) el.setAttribute("title", tooltips[selector]);
      });
    }
  }, []);

  const handleChange = (content) => {
    console.log(content);
    setInternalValue(content);
    if (onChange) onChange(content);
  };

const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      setIsUploading(true);
      try {
        const res = await uploadImageContent(file);
        const imageUrl = res.data;
        if (!imageUrl) throw new Error("Upload failed");
        quill.insertEmbed(range.index, "image", imageUrl);
        const nextIndex = range.index + 1;
      
        quill.setSelection(nextIndex) ;
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const videoHandler = () => {
    let url = prompt("Enter YouTube URL:");
    if (!url) return;

    if (url.includes("watch?v=")) {
      url = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      url = url.replace("youtu.be/", "youtube.com/embed/");
    }

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "video", url);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ["undo", "redo"],
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler,
          undo: function () {
            this.quill.history.undo();
          },
          redo: function () {
            this.quill.history.redo();
          },
        },
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
      },
    }),
    []
  );

  return (
    <AppFlexLayout
      direction="column"
      gap={3}
      align="stretch"
      sx={{ width: "100%" }}
    >
      <Box
        sx={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}
      >
        <TextEditorWrapper>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={internalValue}
            onChange={handleChange}
            modules={modules}
            readOnly={isUploading}
          />
          {isUploading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.4)",
                display: "flex",
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                backdropFilter: "blur(2px)",
              }}
            >
              <CircularProgress size={24} thickness={5} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, letterSpacing: "0.05em" }}
              >
                UPLOADING...
              </Typography>
            </Box>
          )}
        </TextEditorWrapper>
      </Box>
    </AppFlexLayout>
  );
};

export default TextEditor;
