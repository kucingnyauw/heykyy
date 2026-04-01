import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { AppDialog, AppInput } from "@heykyy/components";

/**
 * Dialog component for generating project content using AI.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Function to handle dialog close
 * @param {Function} props.onGenerate - Function to trigger AI generation
 * @param {boolean} props.isPending - Loading state for the generation process
 * @returns {JSX.Element}
 */
const AiAssistantDialog = ({ open, onClose, onGenerate, isPending }) => {
  const [promptText, setPromptText] = useState("");

  useEffect(() => {
    if (!open) {
      setPromptText("");
    }
  }, [open]);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      dialogTitle="AI Creative Assistant"
      actions={[
        {
          label: "Generate content",
          onClick: () => onGenerate(promptText),
          variant: "filled",
          disabled: promptText.length < 10 || isPending,
          loading: isPending,
        },
      ]}
    >
      <Box sx={{ p: 2 }}>
        <AppInput
          autoFocus
          multiline
          minRows={4}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g. A fintech dashboard..."
        />
      </Box>
    </AppDialog>
  );
};

export default AiAssistantDialog;