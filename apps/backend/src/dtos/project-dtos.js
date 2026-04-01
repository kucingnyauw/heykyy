class ProjectCreateUpdateDto {
  constructor(payload) {
    this.title = payload.title;
    this.summary = payload.summary ?? null;
    this.status = payload.status;
    this.demoUrl = payload.demoUrl ?? null;
    this.repoUrl = payload.repoUrl ?? null;
    this.isFeatured = Boolean(payload.isFeatured);
    this.categoryId = payload.categoryId ?? null;
    this.stackIds = Array.isArray(payload.stackIds) ? payload.stackIds : [];
    this.contentHtml = payload.contentHtml ?? "";
    this.metaTitle = payload.metaTitle ?? null;
    this.metaDesc = payload.metaDesc ?? null;
    this.existingImageIds = Array.isArray(payload.existingImageIds)
      ? payload.existingImageIds
      : [];
  }
}

class ProjectDto {
  constructor(project, hasLiked = false) {
    this.id = project.id;
    this.title = project.title;
    this.slug = project.slug;
    this.summary = project.summary;
    this.status = project.status;
    this.links = {
      demo: project.demoUrl,
      repository: project.repositoryUrl,
    };
    this.content = project.detail?.contentHtml ?? "";
    this.isFeatured = project.isFeatured;
    this.stats = {
      likes: project.likeCount ?? 0,
      views: project.viewCount ?? 0,
      hasLiked: Boolean(hasLiked),
      readTime: this.#calculateReadTime(project.detail?.contentHtml),
    };
    this.audio = project.audio
      ? {
          id: project.audio.id,
          url: project.audio.url,
        }
      : null;
    this.metadata = {
      title: project.metaTitle,
      description: project.metaDesc,
    };
    this.category = project.category
      ? {
          id: project.category.id,
          name: project.category.name,
        }
      : null;
    this.author = project.author
      ? {
          name: project.author.name,
          bio: project.author.about,
          avatar: project.author.profilePhoto?.url ?? null,
          role: project.author.role,
        }
      : null;
    this.stacks = (project.stacks || []).map((s) => ({
      id: s.stack?.id,
      name: s.stack?.name,
      icon: s.stack?.icon,
      url: s.stack?.url,
    }));
    this.thumbnails = (project.thumbnails || []).map((t) => ({
      id: t.asset?.id,
      url: t.asset?.url,
    }));
    this.timestamps = {
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  #calculateReadTime(html) {
    if (!html) return 0;
    const wordsPerMinute = 200;
    const cleanText = html.replace(/<[^>]*>/g, " ").trim();
    const wordCount = cleanText.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

class ProjectListDto {
  constructor(project) {
    this.id = project.id;
    this.title = project.title;
    this.slug = project.slug;
    this.summary = project.summary;
    this.isFeatured = project.isFeatured;
    this.thumbnail = project.thumbnails?.[0]?.asset?.url ?? null;
    this.category = project.category
      ? {
          name: project.category.name,
        }
      : null;
    this.stacks = (project.stacks || []).map((s) => ({
      name: s.stack?.name,
      icon: s.stack?.icon,
    }));
    this.stats = {
      views: project.viewCount ?? 0,
      likes: project.likeCount ?? 0,
    };
    this.author = project.author?.name ?? null;
    this.createdAt = project.createdAt;
    this.updatedAt = project.updatedAt;
  }
}

export { ProjectCreateUpdateDto, ProjectDto, ProjectListDto };
