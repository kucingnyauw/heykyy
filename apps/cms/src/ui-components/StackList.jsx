import React, { useMemo, useCallback, useRef, useEffect } from "react";
import {
  CircularProgress,
  Typography,
  useTheme,
  alpha,
  FormHelperText,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Box,
} from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getsTech } from "../services/tech-service";
import { AppDialog } from "@heykyy/components";
import { CheckCircle2, AlertCircle } from "lucide-react";

const StackListDialog = ({
  open,
  onClose,
  value = [],
  onChange,
  error,
  helperText,
  multiple = true,
}) => {
  const theme = useTheme();
  const loadMoreRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["tech-list-infinite"],
      queryFn: ({ pageParam = 1 }) => getsTech(pageParam, 10),
      getNextPageParam: (lastPage) => {
        const { currentPage, totalPages } = lastPage.metadata || {};
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      staleTime: 30 * 60 * 1000,
    });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !open) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "20px",
        threshold: 0.1,
      }
    );

    const currentSentinel = loadMoreRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, open, data]);

  const handleToggle = useCallback(
    (item) => {
      if (!multiple) {
        onChange({ id: item.id, name: item.name, icon: item.icon });
        return;
      }

      const exists = value.some((v) => v.id === item.id);
      onChange(
        exists
          ? value.filter((v) => v.id !== item.id)
          : [...value, { id: item.id, name: item.name, icon: item.icon }]
      );
    },
    [value, onChange, multiple]
  );

  const checkSelected = (itemId) => {
    if (!multiple) {
      return value?.id === itemId;
    }
    return Array.isArray(value) && value.some((v) => v.id === itemId);
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "500px",
        },
      }}
      actions={[{ label: "Done", variant: "filled", onClick: onClose }]}
      contentSx={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {error && helperText && (
        <Box
          sx={{
            p: 1.5,
            mx: 2,
            mt: 2,
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <AlertCircle size={16} color={theme.palette.error.main} />
          <FormHelperText error sx={{ m: 0, fontWeight: 500 }}>
            {helperText}
          </FormHelperText>
        </Box>
      )}

      <Box
        ref={scrollContainerRef}
        sx={{
          height: "auto",
          maxHeight: "450px",
          overflowY: "auto",
          width: "100%",
        }}
      >
        {isLoading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={32} thickness={5} />
          </Box>
        ) : items.length === 0 ? (
          <Typography sx={{ py: 4, color: "text.secondary" }} align="center">
            No technologies found.
          </Typography>
        ) : (
          <List sx={{ p: 0, width: "100%" }}>
            {items.map((item, index) => {
              const selected = checkSelected(item.id);
              return (
                <React.Fragment key={item.id}>
                  <ListItemButton
                    onClick={() => handleToggle(item)}
                    sx={{
                      py: 1.8,
                      px: 3,
                      bgcolor: selected
                        ? alpha(theme.palette.primary.main, 0.04)
                        : "transparent",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Avatar
                        src={item.icon}
                        variant="rounded"
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: "transparent",
                          borderRadius: 0,
                          "& img": { objectFit: "contain" },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      slotProps={{
                        primary: {
                          variant: "body2",
                          fontWeight: selected ? 700 : 500,
                          color: selected ? "primary.main" : "text.primary",
                        },
                      }}
                    />
                    {selected && (
                      <CheckCircle2
                        size={18}
                        color={theme.palette.primary.main}
                      />
                    )}
                  </ListItemButton>
                  {index < items.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}

            <Box
              ref={loadMoreRef}
              sx={{
                py: 2,
                display: "flex",
                justifyContent: "center",
                minHeight: 40,
              }}
            >
              {isFetchingNextPage && <CircularProgress size={20} />}
            </Box>
          </List>
        )}
      </Box>
    </AppDialog>
  );
};

export default StackListDialog;
