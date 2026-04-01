import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  useTheme,
  Typography,
  Card,
  useMediaQuery,
  alpha,
  FormHelperText,
  Divider,
} from "@mui/material";
import {
  FilledButton,
  OutlinedButton,
  IconButton,
  AppInput,
  AppAutoComplete,
  AppGridLayout,
  AppFlexLayout,
  AppLoading,
  AppSwitch,
  AppPopper,
  TextButton,
  AppSnackBar,
} from "@heykyy/components";
import { useForm, Controller } from "react-hook-form";
import { BLOG_STATUS, TAGS_OPTIONS } from "@heykyy/constant";
import {
  getBlog,
  createBlogs,
  updateBlogs,
} from "../../services/blogs-service";
import { generateBlogCaseStudy } from "../../services/assistant-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  File,
  Send,
  UploadCloud,
  X,
  Image as ImageIcon,
  FileText,
  Settings,
  Sparkle,
  Search,
  MoreVertical,
  LayoutTemplate,
} from "lucide-react";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import CategoryDropdown from "../../ui-components/CategoryList";
import TextEditor from "../../ui-components/TextEditor/TextEditor";

import SectionHeader from "./components/SectionHeader";
import BlogStructureExample from "./components/BlogStructureExample";
import SeoPreviewCard from "./components/SeoPreviewCard";
import AiAssistantDialog from "./components/AiAssistantDialog";
import ImagePreviewDialog from "./components/ImagePreviewDialog";

/**
 * Main component for creating and editing blog posts.
 * Provides a comprehensive interface for content management, SEO optimization,
 * AI assistance, and handles form validation based on the post's publishing status.
 *
 * @returns {JSX.Element} The blog post editor interface.
 */
const BlogsPost = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { slug, mode } = useParams();
  const isEdit = mode === "update";

  const [preview, setPreview] = useState(null);
  const [previewImageDialog, setPreviewImageDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const openMore = Boolean(anchorEl);

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    trigger,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      title: "",
      summary: "",
      contentHtml: "",
      status: BLOG_STATUS.DRAFT,
      tags: [],
      metaTitle: "",
      metaDesc: "",
      isFeatured: false,
      categoryId: "",
      file: null,
    },
  });

  const watchedTitle = watch("title");
  const watchedMetaTitle = watch("metaTitle");
  const watchedMetaDesc = watch("metaDesc");
  const isPublished = watch("status") === BLOG_STATUS.PUBLISHED;

  const shouldBlock = isDirty;
  const { markAsSaved } = useUnsavedChangesGuard(shouldBlock);

  /**
   * Opens the additional actions menu on mobile view.
   *
   * @param {React.MouseEvent<HTMLElement>} e - The mouse event triggered by clicking the action button.
   */
  const handleOpenMore = useCallback((e) => setAnchorEl(e.currentTarget), []);

  /**
   * Closes the additional actions menu on mobile view.
   */
  const handleCloseMore = useCallback(() => setAnchorEl(null), []);

  /**
   * Dynamically constructs validation rules for form fields.
   * Fields become strictly required when the post status is set to 'PUBLISHED'.
   *
   * @param {string} name - The human-readable name of the field for error messages.
   * @param {number} min - The minimum character length required.
   * @param {number} max - The maximum character length allowed.
   * @param {boolean} [isAlwaysRequired=false] - If true, enforces the required rule regardless of the publish status.
   * @returns {Object} An object containing React Hook Form validation rules.
   */
  const requiredIfPublished = useCallback(
    (name, min, max, isAlwaysRequired = false) => {
      const rules = {};
      if (isPublished || isAlwaysRequired) {
        rules.required = `${name} is required${
          isPublished && !isAlwaysRequired ? " for publishing" : ""
        }`;
      }
      if (min) {
        rules.minLength = {
          value: min,
          message: `${name} must be at least ${min} characters`,
        };
      }
      if (max) {
        rules.maxLength = {
          value: max,
          message: `${name} must not exceed ${max} characters`,
        };
      }
      if (!isAlwaysRequired && !isPublished) {
        rules.validate = (value) => {
          if (
            !value ||
            value === "" ||
            value === "<p></p>" ||
            value === "<p><br></p>"
          ) {
            return true;
          }
          const plainText = value.replace(/(<([^>]+)>)/gi, "").trim();
          if (plainText.length < min)
            return `${name} must be at least ${min} characters`;
          if (plainText.length > max)
            return `${name} must not exceed ${max} characters`;
          return true;
        };
      }
      return rules;
    },
    [isPublished]
  );

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["blogsDetail", slug],
    queryFn: () => getBlog(slug),
    enabled: isEdit && !!slug,
    staleTime: 30 * 60 * 1000,
  });

  const blogMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateBlogs(blogsData.id, payload) : createBlogs(payload),
    onSuccess: () => {
      markAsSaved();
      queryClient.invalidateQueries(["blogs"]);
      navigate("/blogs", { replace: true });
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const asistantMutation = useMutation({
    mutationFn: (prompt) => generateBlogCaseStudy(prompt),
    onSuccess: (data) => {
      setDialogOpen(false);
      reset((prev) => ({
        ...prev,
        title: data?.title || prev.title,
        summary: data?.summary || prev.summary,
        contentHtml: data?.content || prev.contentHtml,
        metaTitle: data?.meta?.title || prev.metaTitle,
        metaDesc: data?.meta?.description || prev.metaDesc,
      }));
    },
    onError: (message) => {
      setDialogOpen(false);
      setSnackbar({ open: true, message, variant: "error" });
    },
  });

  useEffect(() => {
    if (blogsData && isEdit) {
      const thumbnailUrl = blogsData?.thumbnail?.url;
      setPreview(thumbnailUrl);

      reset({
        title: blogsData?.title || "",
        summary: blogsData?.summary || "",
        contentHtml: blogsData?.content || "",
        status: blogsData?.status || BLOG_STATUS.DRAFT,
        tags: blogsData?.tags || [],
        metaTitle: blogsData?.metadata?.title || "",
        metaDesc: blogsData?.metadata?.description || "",
        isFeatured: blogsData?.isFeatured || false,
        categoryId: blogsData?.category?.id || "",
        file: thumbnailUrl || null,
      });
    }
  }, [blogsData, isEdit, reset]);

  /**
   * Processes the selected file from the file input, creates a local preview URL,
   * and updates the form state.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   * @param {Function} onChange - The form controller's onChange callback to update the file state.
   */
  const handleImageChange = useCallback((e, onChange) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  /**
   * Executes the mutation to save or update the blog post data.
   *
   * @param {Object} data - The validated form data payload.
   */
  const onSubmit = useCallback(
    (data) => {
      blogMutation.mutate(data);
    },
    [blogMutation]
  );

  /**
   * Displays an error notification when form validation fails upon submission.
   */
  const onFormError = useCallback(() => {
    setSnackbar({
      open: true,
      message: "Please check the form for errors.",
      variant: "error",
    });
  }, []);

  /**
   * Overrides the current status to 'DRAFT' and attempts to submit the form.
   * Ensures that at least the title field is valid before submission.
   */
  const handleSaveDraft = useCallback(async () => {
    setValue("status", BLOG_STATUS.DRAFT, { shouldValidate: true });
    if (await trigger("title")) handleSubmit(onSubmit, onFormError)();
  }, [setValue, trigger, handleSubmit, onSubmit, onFormError]);

  const seoUrl = useMemo(() => {
    return `https://${import.meta.env.VITE_BASE_URL}/blog/${
      watchedTitle || "blog-post"
    }`;
  }, [watchedTitle]);

  const displayMetaTitle = useMemo(() => {
    if (!watchedMetaTitle) return "Google Search Title Preview";
    return watchedMetaTitle.length > 60
      ? `${watchedMetaTitle.substring(0, 60)}...`
      : watchedMetaTitle;
  }, [watchedMetaTitle]);

  const displayMetaDesc = useMemo(() => {
    if (!watchedMetaDesc)
      return "This is how your description will look in search engines...";
    return watchedMetaDesc.length > 160
      ? `${watchedMetaDesc.substring(0, 160)}...`
      : watchedMetaDesc;
  }, [watchedMetaDesc]);

  const submitBtnText = useMemo(() => {
    if (isEdit) return isPublished ? "Update Post" : "Update Draft";
    return isPublished ? "Publish Post" : "Create Draft";
  }, [isEdit, isPublished]);

  return (
    <>
      {(blogMutation.isPending || isLoading) && <AppLoading />}

      <form onSubmit={handleSubmit(onSubmit, onFormError)}>
        <AppFlexLayout direction="column" gap={4} align="flex-start">
          <AppFlexLayout
            justify="space-between"
            align={isMobile ? "flex-start" : "center"}
            gap={4}
            sx={{ width: "100%" }}
          >
            <AppFlexLayout
              direction="column"
              align="flex-start"
              gap={1}
              sx={{ flex: 6, minWidth: 0 }}
            >
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{ fontWeight: 900, letterSpacing: "-0.04em", mb: 0.5 }}
              >
                {isEdit
                  ? "Refine and Polish Your Story"
                  : "Craft a Compelling New Post"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {isEdit
                  ? `You're currently editing "${watchedTitle}". Take a moment to polish your writing, refine your ideas, and ensure your content is perfectly crafted before publishing.`
                  : "Start writing your next blog post — share your unique insights, detail your experiences, and tell a story that truly resonates with your audience."}
              </Typography>
            </AppFlexLayout>

            {isMobile ? (
              <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                <IconButton
                  icon={<MoreVertical size={22} />}
                  onClick={handleOpenMore}
                />
                <AppPopper
                  open={openMore}
                  anchorEl={anchorEl}
                  onClose={handleCloseMore}
                  placement="bottom-end"
                >
                  <AppFlexLayout direction="column" align="stretch" gap={0.5}>
                    {!isEdit && (
                      <TextButton
                        size="xs"
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          borderRadius: theme.shape.borderRadius,
                        }}
                        onClick={() => {
                          setDialogOpen(true);
                          handleCloseMore();
                        }}
                      >
                        AI Assistant
                      </TextButton>
                    )}
                    <TextButton
                      size="xs"
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: theme.shape.borderRadius,
                      }}
                      onClick={() => {
                        handleSaveDraft();
                        handleCloseMore();
                      }}
                    >
                      Save Draft
                    </TextButton>
                    <TextButton
                      size="xs"
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: theme.shape.borderRadius,
                      }}
                      onClick={() => {
                        handleSubmit(onSubmit, onFormError)();
                        handleCloseMore();
                      }}
                    >
                      {submitBtnText}
                    </TextButton>
                  </AppFlexLayout>
                </AppPopper>
              </Box>
            ) : (
              <AppFlexLayout
                direction="row"
                justify="flex-end"
                gap={2}
                sx={{ flex: 4, minWidth: 0 }}
              >
                {!isEdit && (
                  <OutlinedButton
                    size="xs"
                    onClick={() => setDialogOpen(true)}
                    startIcon={<Sparkle fill="currentColor" size={18} />}
                  >
                    AI Assistant
                  </OutlinedButton>
                )}
                <OutlinedButton
                  size="xs"
                  onClick={handleSaveDraft}
                  startIcon={<File fill="currentColor" size={18} />}
                >
                  Save Draft
                </OutlinedButton>
                <FilledButton
                  size="xs"
                  type="submit"
                  disabled={blogMutation.isPending || isLoading}
                  startIcon={<Send size={18} />}
                >
                  {submitBtnText}
                </FilledButton>
              </AppFlexLayout>
            )}
          </AppFlexLayout>

          <AppGridLayout
            columns={{ xs: "1fr", lg: "1fr 380px" }}
            gap={4}
            align="start"
            sx={{ width: "100%", minWidth: 0 }}
          >
            <AppFlexLayout direction="column" gap={4} align="stretch">
              <Card
                sx={{
                  p: 4,
                  width: "100%",
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[5],
                }}
              >
                <SectionHeader
                  title="Core Content"
                  icon={LayoutTemplate}
                  subtitle="Write the main content of your post."
                />
                <AppFlexLayout direction="column" gap={3.5} align="stretch">
                  <Controller
                    name="title"
                    control={control}
                    rules={requiredIfPublished("Title", 3, 150, !isEdit)}
                    render={({ field }) => (
                      <AppInput
                        minRows={2}
                        label="Title"
                        placeholder="Article Title"
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={!!errors.title}
                        helperText={errors.title?.message}
                      />
                    )}
                  />
                  <Controller
                    name="summary"
                    control={control}
                    rules={requiredIfPublished("Summary", 10, 300)}
                    render={({ field }) => (
                      <AppInput
                        label="Summary"
                        placeholder="Brief intro..."
                        multiline
                        minRows={4}
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={!!errors.summary}
                        helperText={errors.summary?.message}
                      />
                    )}
                  />
                </AppFlexLayout>
              </Card>

              <Card
                sx={{
                  p: 4,
                  width: "100%",
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[5],
                }}
              >
                <SectionHeader
                  title="Post Details"
                  icon={FileText}
                  subtitle="Add supporting details and expand on your ideas."
                />
                <BlogStructureExample />

                <Controller
                  name="contentHtml"
                  control={control}
                  rules={requiredIfPublished("Content", 20, 50000)}
                  render={({ field }) => (
                    <Box sx={{ mt: 1 }}>
                      <TextEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                      {errors.contentHtml && (
                        <FormHelperText error sx={{ mt: 1, px: 1 }}>
                          {errors.contentHtml.message}
                        </FormHelperText>
                      )}
                    </Box>
                  )}
                />
              </Card>

              <Card
                sx={{
                  p: 4,
                  width: "100%",
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[5],
                }}
              >
                <SectionHeader
                  title="SEO & Discovery"
                  icon={Search}
                  subtitle="Control how your post appears in search results."
                />
                <AppGridLayout
                  columns={{ xs: "1fr", md: "1.2fr 1fr" }}
                  gap={4}
                  sx={{ minWidth: 0 }}
                >
                  <AppFlexLayout direction="column" gap={2.5} align="stretch">
                    <Controller
                      name="metaTitle"
                      control={control}
                      rules={requiredIfPublished("Meta Title", 10, 60)}
                      render={({ field }) => (
                        <AppInput
                          label="Meta Title"
                          value={field.value || ""}
                          onChange={field.onChange}
                          error={!!errors.metaTitle}
                          helperText={errors.metaTitle?.message}
                        />
                      )}
                    />
                    <Controller
                      name="metaDesc"
                      control={control}
                      rules={requiredIfPublished("Meta Description", 20, 160)}
                      render={({ field }) => (
                        <AppInput
                          label="Meta Description"
                          multiline
                          minRows={6}
                          value={field.value || ""}
                          onChange={field.onChange}
                          error={!!errors.metaDesc}
                          helperText={errors.metaDesc?.message}
                        />
                      )}
                    />
                  </AppFlexLayout>
                  <SeoPreviewCard
                    seoUrl={seoUrl}
                    displayMetaTitle={displayMetaTitle}
                    displayMetaDesc={displayMetaDesc}
                  />
                </AppGridLayout>
              </Card>
            </AppFlexLayout>

            <AppFlexLayout direction="column" gap={4} align="stretch">
              <Card
                sx={{
                  p: 4,
                  width: "100%",
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[5],
                }}
              >
                <SectionHeader
                  title="Configuration"
                  icon={Settings}
                  subtitle="Manage post settings."
                />
                <AppFlexLayout direction="column" gap={3.5} align="stretch">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <AppAutoComplete
                        label="Status"
                        options={Object.values(BLOG_STATUS)}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  <Controller
                    name="categoryId"
                    control={control}
                    rules={{
                      required: isPublished
                        ? "Category is required for publishing"
                        : false,
                    }}
                    render={({ field }) => (
                      <CategoryDropdown
                        label="Category"
                        type="BLOG"
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={!!errors.categoryId}
                        helperText={errors.categoryId?.message}
                      />
                    )}
                  />
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <AppAutoComplete
                        label="Tags"
                        multiple
                        freeSolo
                        options={TAGS_OPTIONS}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  <Divider sx={{ borderStyle: "dashed" }} />
                  <AppFlexLayout justify="space-between" align="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Featured Blog
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Highlight on home page
                      </Typography>
                    </Box>
                    <Controller
                      name="isFeatured"
                      control={control}
                      render={({ field }) => (
                        <AppSwitch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                  </AppFlexLayout>
                </AppFlexLayout>
              </Card>

              <Card
                sx={{
                  p: 4,
                  width: "100%",
                  borderRadius: theme.shape.borderRadius,
                  boxShadow: theme.shadows[5],
                }}
              >
                <SectionHeader
                  title="Banner Image"
                  icon={ImageIcon}
                  subtitle="Upload a featured image."
                />
                <Controller
                  name="file"
                  control={control}
                  rules={{
                    required:
                      isPublished && !preview
                        ? "Banner image is required for publishing"
                        : false,
                  }}
                  render={({ field: { onChange }, fieldState: { error } }) => (
                    <Box>
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "16/9",
                          borderRadius: "12px",
                          border: `2px dashed ${
                            error
                              ? theme.palette.error.main
                              : theme.palette.divider
                          }`,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          position: "relative",
                          overflow: "hidden",
                          display: "flex",
                          cursor: preview ? "zoom-in" : "pointer",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "0.2s",
                          "&:hover": {
                            borderColor: error
                              ? theme.palette.error.main
                              : theme.palette.primary.main,
                          },
                        }}
                        onClick={() => {
                          if (!preview) return;
                          setPreviewImageDialog(true);
                        }}
                      >
                        {preview ? (
                          <>
                            <img
                              src={preview}
                              alt="Banner"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <Box
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                zIndex: 10,
                              }}
                            >
                              <IconButton
                                size="xs"
                                icon={<X size={16} />}
                                onClick={() => {
                                  setPreview(null);
                                  onChange(null);
                                }}
                                sx={{
                                  bgcolor: theme.palette.error.main,
                                  color: "white",
                                  borderRadius: "50%",
                                  "&:hover": {
                                    bgcolor: theme.palette.error.dark,
                                  },
                                }}
                              />
                            </Box>
                          </>
                        ) : (
                          <Box
                            component="label"
                            sx={{
                              textAlign: "center",
                              cursor: "pointer",
                              p: 3,
                              width: "100%",
                            }}
                          >
                            <UploadCloud
                              size={32}
                              color={
                                error
                                  ? theme.palette.error.main
                                  : theme.palette.primary.main
                              }
                            />
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{
                                mt: 1,
                                fontWeight: 600,
                                color: error ? "error.main" : "inherit",
                              }}
                            >
                              Upload Banner
                            </Typography>
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, onChange)}
                            />
                          </Box>
                        )}
                      </Box>
                      {error && (
                        <FormHelperText
                          error
                          sx={{ mt: 1, textAlign: "center", fontWeight: 500 }}
                        >
                          {error.message}
                        </FormHelperText>
                      )}
                    </Box>
                  )}
                />
              </Card>
            </AppFlexLayout>
          </AppGridLayout>
        </AppFlexLayout>
      </form>

      <AiAssistantDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGenerate={(prompt) => asistantMutation.mutate(prompt)}
        isPending={asistantMutation.isPending}
      />

      <ImagePreviewDialog
        open={previewImageDialog && !!preview}
        onClose={() => setPreviewImageDialog(false)}
        preview={preview}
      />

      <AppSnackBar
        variant={snackbar.variant}
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        autoHideDuration={3000}
      />
    </>
  );
};

export default React.memo(BlogsPost);
