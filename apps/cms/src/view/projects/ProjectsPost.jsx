import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Box,
  useTheme,
  Typography,
  Card,
  useMediaQuery,
  alpha,
  Chip,
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
import { PROJECT_STATUS, MAX_UPLOAD } from "@heykyy/constant";
import {
  createProjects,
  updateProjects,
  getProject,
} from "../../services/projects-service";
import { generateProjectCaseStudy } from "../../services/assistant-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  File,
  Send,
  UploadCloud,
  X,
  Image as ImageIcon,
  LayoutTemplate,
  FileText,
  Settings,
  Sparkle,
  Search,
  Plus,
  MoreVertical,
  Cpu,
  Globe
} from "lucide-react";

import CategoryDropdown from "../../ui-components/CategoryList";
import StackListDialog from "../../ui-components/StackList";
import TextEditor from "../../ui-components/TextEditor/TextEditor";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";

import SectionHeader from "./components/SectionHeader";
import ProjectStructureExample from "./components/ProjectStructureExample";
import SeoPreviewCard from "./components/SeoPreviewCard";
import AiAssistantDialog from "./components/AiAssistantDialog";
import ImagePreviewDialog from "./components/ImagePreviewDialog";

/**
 * Main component for creating and updating project case studies.
 * Provides a comprehensive interface including AI assistance, SEO previews,
 * gallery management, and unsaved changes protection.
 *
 * @returns {JSX.Element} The project posting and editing interface.
 */
const ProjectsPost = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { slug, mode } = useParams();
  const isEdit = mode === "update";

  const [galleryItems, setGalleryItems] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageDialog, setPreviewImageDialog] = useState(false);
  const [openStackDialog, setOpenStackDialog] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const openMore = Boolean(anchorEl);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

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
      demoUrl: "",
      repoUrl: "",
      summary: "",
      contentHtml: "",
      status: PROJECT_STATUS.DRAFT,
      metaTitle: "",
      metaDesc: "",
      isFeatured: false,
      categoryId: "",
      stacks: [],
    },
  });

  const watchedTitle = watch("title");
  const watchedMetaTitle = watch("metaTitle");
  const watchedMetaDesc = watch("metaDesc");
  const isPublished = watch("status") === PROJECT_STATUS.PUBLISHED;

  const shouldBlock = isDirty;
  const { markAsSaved } = useUnsavedChangesGuard(shouldBlock);

  /**
   * Opens the additional actions menu popper for mobile view.
   *
   * @param {React.MouseEvent<HTMLElement>} event - The triggered mouse event.
   */
  const handleOpenMore = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    []
  );

  /**
   * Closes the additional actions menu popper.
   */
  const handleCloseMore = useCallback(() => setAnchorEl(null), []);

  /**
   * Generates validation rules conditionally based on the current publishing status.
   *
   * @param {string} name - Field display name for error messages.
   * @param {number} [min] - Minimum required character length.
   * @param {number} [max] - Maximum allowed character length.
   * @returns {Object} React Hook Form validation rules.
   */
  const requiredIfPublished = useCallback(
    (name, min, max) => {
      const rules = {};
      if (isPublished) {
        rules.required = `${name} is required for publishing`;
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
      return rules;
    },
    [isPublished]
  );

  const { data: projectData, isLoading } = useQuery({
    queryKey: ["projectDetail", slug],
    queryFn: () => getProject(slug),
    enabled: isEdit && !!slug,
    staleTime: 30 * 60 * 1000,
  });

  const projectMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? updateProjects({ id: projectData.id, ...payload })
        : createProjects(payload),
    onSuccess: () => {
      markAsSaved();
      queryClient.invalidateQueries(["projects"]);
      navigate("/projects", { replace: true });
    },
    onError: (message) => {
      setSnackbar({ open: true, message, variant: "error" });
    },
  });

  const asistantMutation = useMutation({
    mutationFn: (prompt) => generateProjectCaseStudy(prompt),
    onSuccess: (data) => {
      setDialogOpen(false);
      reset({
        ...watch(),
        title: data?.title || watch("title"),
        summary: data?.summary || watch("summary"),
        contentHtml: data?.content || watch("contentHtml"),
        metaTitle: data?.meta?.title || watch("metaTitle"),
        metaDesc: data?.meta?.description || watch("metaDesc"),
      });
    },
    onError: (message) => {
      setDialogOpen(false);
      setSnackbar({ open: true, message, variant: "error" });
    },
  });

  useEffect(() => {
    if (projectData && isEdit) {
      setGalleryItems(
        (projectData.thumbnails || []).map((img) => ({
          id: img.id,
          type: "SERVER",
          url: img.url,
        }))
      );
      reset({
        title: projectData?.title || "",
        demoUrl: projectData?.links?.demo || "",
        repoUrl: projectData?.links?.repository || "",
        summary: projectData?.summary || "",
        contentHtml: projectData?.content || "",
        status: projectData?.status || PROJECT_STATUS.DRAFT,
        metaTitle: projectData?.metadata?.title || "",
        metaDesc: projectData?.metadata?.description || "",
        isFeatured: projectData?.isFeatured || false,
        categoryId: projectData?.category?.id || "",
        stacks: projectData?.stacks || [],
      });
    }
  }, [projectData, isEdit, reset]);

  /**
   * Handles the primary form submission by verifying images and triggering the mutation.
   *
   * @param {Object} data - Processed form data from React Hook Form.
   */
  const onSubmit = useCallback(
    (data) => {
      if (isPublished && galleryItems.length === 0) {
        setSnackbar({
          open: true,
          message: "Please upload at least one image to publish.",
          variant: "error",
        });
        return;
      }
      projectMutation.mutate({ data, galleryItems });
    },
    [isPublished, galleryItems, projectMutation]
  );

  /**
   * Bypasses full validation to save the current form state as a draft project.
   */
  const handleSaveDraft = useCallback(async () => {
    setValue("status", PROJECT_STATUS.DRAFT);
    if (await trigger("title")) handleSubmit(onSubmit)();
  }, [setValue, trigger, handleSubmit, onSubmit]);

  /**
   * Processes multi-file selections and updates the local gallery state up to the maximum limit.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleFilesChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      const remainingSlots = MAX_UPLOAD - galleryItems.length;
      const filesToProcess = files.slice(0, remainingSlots);

      if (filesToProcess.length) {
        const newItems = filesToProcess.map((f) => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          type: "LOCAL",
          url: URL.createObjectURL(f),
          file: f,
        }));
        setGalleryItems((prev) => [...prev, ...newItems]);
      }
    },
    [galleryItems.length]
  );

  /**
   * Reorders the gallery array elements upon completing a drag-and-drop action.
   */
  const onDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _gallery = [...galleryItems];
    const draggedItemContent = _gallery[dragItem.current];
    _gallery.splice(dragItem.current, 1);
    _gallery.splice(dragOverItem.current, 0, draggedItemContent);
    setGalleryItems(_gallery);
    dragItem.current = null;
    dragOverItem.current = null;
  }, [galleryItems]);

  /**
   * Closes the application snackbar unless the user simply clicked away.
   *
   * @param {React.SyntheticEvent|Event} _ - The triggering event.
   * @param {string} reason - Provides the context of the close action.
   */
  const closeSnackbar = useCallback((_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const globalLoading = useMemo(
    () => projectMutation.isPending || isLoading,
    [projectMutation.isPending, isLoading]
  );

  const seoUrl = useMemo(() => {
  
    return `https://${import.meta.env.VITE_BASE_URL}/project/${watchedTitle || "project-slug"}`;
  }, [watchedTitle]);

  const displayMetaTitle = useMemo(() => {
    if (!watchedMetaTitle)
      return "Default meta title that provides clear page information when none is available";
    return watchedMetaTitle.length > 60
      ? `${watchedMetaTitle.substring(0, 60)}...`
      : watchedMetaTitle;
  }, [watchedMetaTitle]);

  const displayMetaDesc = useMemo(() => {
    if (!watchedMetaDesc)
      return "Default meta description providing a clear overview of the page content when none is available.";
    return watchedMetaDesc.length > 160
      ? `${watchedMetaDesc.substring(0, 160)}...`
      : watchedMetaDesc;
  }, [watchedMetaDesc]);

  const renderedGallery = useMemo(() => {
    return galleryItems.map((item, index) => (
      <Box
        key={item.id}
        draggable
        onDragStart={() => (dragItem.current = index)}
        onDragEnter={() => (dragOverItem.current = index)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => {
          setPreviewImage(item.url);
          setPreviewImageDialog(true);
        }}
        sx={(theme) => ({
          position: "relative",
          aspectRatio: "4 / 3",
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          cursor: "zoom-in",
          transition: "transform .12s ease",
          "&:hover": { transform: "scale(1.02)" },
          "&:hover .overlay": { opacity: 1 },
        })}
      >
        <Box
          component="img"
          src={item.url}
          alt="Project gallery"
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Box
          className="overlay"
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,.35)",
            opacity: 0,
            transition: "opacity .15s ease",
          }}
        />
        {index === 0 && (
          <Chip
            label="Cover"
            size="small"
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              fontSize: "10px",
              fontWeight: 700,
              height: 20,
            }}
          />
        )}
        <IconButton
        size="medium"
          icon={<X size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            setGalleryItems((prev) => prev.filter((i) => i.id !== item.id));
          }}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            p: 0.5,
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.error.main, 0.9),
            zIndex: 99,
            "&:hover": {
              bgcolor: theme.palette.error.main,
            },
          }}
        />
      </Box>
    ));
  }, [galleryItems, onDragEnd, theme.palette.error.main]);

  return (
    <>
      {globalLoading && <AppLoading />}

      <form onSubmit={handleSubmit(onSubmit)}>
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
                {isEdit ? "Refine Your Project" : "Create a New Project"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {isEdit
                  ? `You're making updates to "${watchedTitle}". Keep refining the details to ensure everything is accurate and presentation-ready.`
                  : "Start shaping your next project — add the essentials, showcase your work, and prepare it for discovery."}
              </Typography>
            </AppFlexLayout>

            {isMobile ? (
              <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                <IconButton
                size="medium"
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
                        onClick={() => {
                          setDialogOpen(true);
                          handleCloseMore();
                        }}
                        sx={{
                          justifyContent: "flex-start",
                          textAlign: "left",
                          borderRadius: theme.shape.borderRadius,
                        }}
                      >
                        AI Assistant
                      </TextButton>
                    )}
                    <TextButton
                      onClick={() => {
                        handleSaveDraft();
                        handleCloseMore();
                      }}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: theme.shape.borderRadius,
                      }}
                    >
                      Save Draft
                    </TextButton>
                    <TextButton
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        borderRadius: theme.shape.borderRadius,
                      }}
                      onClick={() => {
                        handleSubmit(onSubmit)();
                        handleCloseMore();
                      }}
                    >
                      {isEdit ? "Update Project" : "Publish Project"}
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
                    size="extraSmall"
                    onClick={() => setDialogOpen(true)}
                    startIcon={<Sparkle fill="currentColor" size={18} />}
                  >
                    AI Assistant
                  </OutlinedButton>
                )}
                <OutlinedButton
                  size="extraSmall"
                  onClick={handleSaveDraft}
                  startIcon={<File fill="currentColor" size={18} />}
                >
                  Save Draft
                </OutlinedButton>
                <FilledButton
                  size="extraSmall"
                  type="submit"
                  disabled={globalLoading}
                  startIcon={<Send size={18} />}
                >
                  {isEdit ? "Update Project" : "Publish Project"}
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
                  title="Essentials"
                  subtitle="Define the core identity of your project, including its name, purpose, and primary overview."
                  icon={LayoutTemplate}
                />

                <AppFlexLayout direction="column" gap={3.5} align="stretch">
                  <Controller
                    name="title"
                    control={control}
                    rules={{
                      required: "Title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters",
                      },
                      maxLength: {
                        value: 150,
                        message: "Title must not exceed 150 characters",
                      },
                    }}
                    render={({ field }) => (
                      <AppInput
                        minRows={2}
                        label="Title"
                        placeholder="Project Title"
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
                    rules={requiredIfPublished("Summary", 20, 300)}
                    render={({ field }) => (
                      <AppInput
                        label="Elevator Pitch"
                        placeholder="Briefly describe the why and what in 2–3 sentences..."
                        multiline
                        minRows={6}
                        value={field.value || ""}
                        onChange={field.onChange}
                        error={!!errors.summary}
                        helperText={errors.summary?.message}
                      />
                    )}
                  />
                  <AppGridLayout columns={{ xs: "1fr", md: "1fr 1fr" }} gap={3}>
                    <Controller
                      name="demoUrl"
                      control={control}
                      render={({ field }) => (
                        <AppInput
                          label="Live Demo URL"
                          placeholder="https://yourproject.com"
                          startIcon={<Globe size={18} />}
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <Controller
                      name="repoUrl"
                      control={control}
                      render={({ field }) => (
                        <AppInput
                          label="Repository URL"
                          placeholder="https://github.com/username/project"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </AppGridLayout>
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
                  title="Project Details"
                  icon={FileText}
                  subtitle="Describe your process, challenges, and the solutions that shaped this project."
                />

                <ProjectStructureExample />

                <Controller
                  name="contentHtml"
                  control={control}
                  rules={requiredIfPublished("Case study content", 20, 50000)}
                  render={({ field }) => (
                    <Box sx={{ mt: 2 }}>
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
                  subtitle="Optimize how your project appears in search results and social previews."
                  icon={Search}
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
                          placeholder="Search engine title..."
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
                          placeholder="Summarize for search results..."
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
                  title="Visibility"
                  subtitle="Control who can access this project and where it can be viewed."
                  icon={Settings}
                />

                <AppFlexLayout direction="column" gap={3.5} align="stretch">
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <AppAutoComplete
                        label="Status"
                        options={Object.values(PROJECT_STATUS)}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  <Controller
                    name="categoryId"
                    control={control}
                    rules={requiredIfPublished("Category")}
                    render={({ field }) => (
                      <CategoryDropdown
                        label="Category"
                        value={field.value}
                        onChange={field.onChange}
                        type="PROJECT"
                        error={!!errors.categoryId}
                        helperText={errors.categoryId?.message}
                      />
                    )}
                  />
                  <Divider sx={{ borderStyle: "dashed" }} />
                  <AppFlexLayout justify="space-between" align="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Featured Project
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Highlight this project on the homepage
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
                  title="Tech Stack"
                  subtitle="Select the main technologies used to build this project."
                  icon={Cpu}
                />

                <Controller
                  name="stacks"
                  control={control}
                  rules={{
                    validate: (val) =>
                      !isPublished ||
                      (val && val.length > 0) ||
                      "Add at least one technology before publishing",
                  }}
                  render={({ field }) => (
                    <Box>
                      <Box
                        onClick={() => setOpenStackDialog(true)}
                        sx={{
                          p: 2.5,
                          borderRadius: theme.shape.borderRadius,
                          border: `2px dashed ${
                            errors.stacks
                              ? theme.palette.error.main
                              : theme.palette.divider
                          }`,
                          bgcolor: alpha(theme.palette.divider, 0.02),
                          cursor: "pointer",
                          minHeight: 110,
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1.2,
                          transition: "all .15s ease",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                          },
                        }}
                      >
                        {!field.value?.length ? (
                          <AppFlexLayout
                            direction="column"
                            align="center"
                            justify="center"
                            gap={0.5}
                            sx={{ width: "100%" }}
                          >
                            <Plus size={18} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Click to add technologies
                            </Typography>
                          </AppFlexLayout>
                        ) : (
                          field.value.map((item) => (
                            <Chip
                              key={item.id}
                              label={item.name}
                              size="small"
                              onDelete={(e) => {
                                e.stopPropagation();
                                field.onChange(
                                  field.value.filter((v) => v.id !== item.id)
                                );
                              }}
                            />
                          ))
                        )}
                      </Box>
                      {errors.stacks && (
                        <FormHelperText error sx={{ ml: 1, mt: 1 }}>
                          {errors.stacks.message}
                        </FormHelperText>
                      )}
                      <StackListDialog
                        open={openStackDialog}
                        onClose={() => setOpenStackDialog(false)}
                        value={field.value}
                        onChange={field.onChange}
                      />
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
                  title={`Gallery (${galleryItems.length}/${MAX_UPLOAD})`}
                  subtitle="Upload images to showcase your project and highlight key features."
                  icon={ImageIcon}
                />

                <AppGridLayout
                  columns="repeat(auto-fill, minmax(160px, 1fr))"
                  gap={1.5}
                >
                  {galleryItems.length < MAX_UPLOAD && (
                    <Box
                      component="label"
                      sx={(theme) => ({
                        aspectRatio: "4 / 3",
                        borderRadius: "12px",
                        border: `2px dashed ${theme.palette.divider}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      })}
                    >
                      <UploadCloud
                        size={22}
                        color={theme.palette.primary.main}
                      />
                      <Typography
                        variant="caption"
                        sx={{ mt: 0.5, fontWeight: 600 }}
                      >
                        Upload
                      </Typography>
                      <input
                        hidden
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFilesChange}
                      />
                    </Box>
                  )}
                  {renderedGallery}
                </AppGridLayout>
              </Card>
            </AppFlexLayout>
          </AppGridLayout>
        </AppFlexLayout>
      </form>

      <ImagePreviewDialog
        open={previewImageDialog && !!previewImage}
        preview={previewImage}
        onClose={() => setPreviewImageDialog(false)}
      />

      <AiAssistantDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGenerate={(prompt) => asistantMutation.mutate(prompt)}
        isPending={asistantMutation.isPending}
      />

      <AppSnackBar
        variant={snackbar.variant}
        open={snackbar.open}
        message={snackbar.message}
        onClose={closeSnackbar}
        autoHideDuration={3000}
      />
    </>
  );
};

export default React.memo(ProjectsPost);