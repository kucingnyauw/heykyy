import { CircularProgress, Box, FormHelperText } from "@mui/material";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { AppAutoComplete } from "@heykyy/components";
import { getsCategories } from "../services/category-services";

const CategoryDropdown = ({
  value,
  onChange,
  type,
  label = "Category",
  error,
  helperText,
  initialData,
}) => {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["category-list-infinite", type],
    queryFn: ({ pageParam = 1 }) => getsCategories(pageParam, 10, type?.toUpperCase()),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.metadata || {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!type,
    staleTime: 30 * 60 * 1000,
  });

  const options = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.data) || [];
    const fetchedOptions = items.map((item) => ({
      label: item.name,
      value: item.id,
    }));

    if (value && initialData) {
      const initialId = (initialData.id || initialData._id || initialData.value || "").toString();
      const currentValue = value.toString();

      const exists = fetchedOptions.find((o) => o.value.toString() === currentValue);

      if (!exists && initialId === currentValue) {
        return [
          { 
            label: initialData.name || initialData.label || "Selected Category", 
            value: currentValue 
          }, 
          ...fetchedOptions
        ];
      }
    }

    return fetchedOptions;
  }, [data, initialData, value]);

  const selectedOption = useMemo(() => {
    const currentValue = value?.toString();
    return options.find((o) => o.value.toString() === currentValue) || null;
  }, [options, value]);

  const handleScroll = useCallback((event) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 5 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Box sx={{ width: "100%" }}>
      <AppAutoComplete
        label={label}
        value={selectedOption}
        options={options}
        loading={isLoading}
        error={error}
        onChange={(e) => {
          const selectedValue = e.target.value;
          onChange(selectedValue?.value || "");
        }}
        ListboxProps={{
          onScroll: handleScroll,
          sx: { maxHeight: 250 }
        }}
        InputProps={{
          endAdornment: (isLoading || isFetchingNextPage) && (
            <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
              <CircularProgress color="inherit" size={16} />
            </Box>
          ),
        }}
      />
      {error && helperText && (
        <FormHelperText error sx={{ ml: 1, mt: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default CategoryDropdown;