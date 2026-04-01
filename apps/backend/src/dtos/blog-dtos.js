class BlogCreateUpdateDto {
  constructor(payload) {
    this.title = payload.title;
    this.summary = payload.summary ?? null;
    this.status = payload.status ?? "DRAFT";
    this.tags = Array.isArray(payload.tags) ? payload.tags : [];
    this.isFeatured = Boolean(payload.isFeatured);
    this.categoryId = payload.categoryId ?? null;
    this.contentHtml = payload.contentHtml ?? "";
    this.metaTitle = payload.metaTitle ?? null;
    this.metaDesc = payload.metaDesc ?? null;
  }
}

class BlogDto {
  constructor(blog, hasLiked = false, commentCount = 0) {
    this.id = blog.id;
    this.title = blog.title;
    this.slug = blog.slug;
    this.summary = blog.summary;
    this.status = blog.status;
    this.tags = Array.isArray(blog.tags) ? blog.tags : [];
    this.content = blog.detail?.contentHtml ?? "";
    this.isFeatured = blog.isFeatured;

    this.stats = {
      likes: blog.likeCount ?? 0,
      views: blog.viewCount ?? 0,
      comments: commentCount,
      hasLiked: Boolean(hasLiked),
      readTime: this.#calculateReadTime(blog.detail?.contentHtml),
    };

    this.audio = blog.audio
      ? {
          id: blog.audio.id,
          url: blog.audio.url,
        }
      : null;

    this.metadata = {
      title: blog.metaTitle,
      description: blog.metaDesc,
    };

    this.category = blog.category
      ? {
          id: blog.category.id,
          name: blog.category.name,
        }
      : null;

    this.author = blog.author
      ? {
          name: blog.author.name,
          bio: blog.author.about,
          avatar: blog.author.profilePhoto?.url ?? null,
          role: blog.author.role,
        }
      : null;

    this.thumbnail = blog.thumbnail
      ? {
          id: blog.thumbnail.id,
          url: blog.thumbnail.url,
        }
      : null;

    this.timestamps = {
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
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

class BlogListDto {
  constructor(blog) {
    this.id = blog.id;
    this.title = blog.title;
    this.slug = blog.slug;
    this.summary = blog.summary;
    this.isFeatured = blog.isFeatured;
    this.status = blog.status;
    this.tags = Array.isArray(blog.tags) ? blog.tags : [];
    this.thumbnail = blog.thumbnail?.url ?? null;

    this.category = blog.category
      ? {
          name: blog.category.name,
        }
      : null;

    this.stats = {
      views: blog.viewCount ?? 0,
      likes: blog.likeCount ?? 0,
      readTime: this.#calculateReadTime(blog.detail?.contentHtml),
    };

    this.author = blog.author
      ? {
          name: blog.author.name,
          avatar: blog.author.profilePhoto?.url ?? null,
        }
      : null;

    this.createdAt = blog.createdAt;
    this.updatedAt = blog.updatedAt;
  }

  #calculateReadTime(html) {
    if (!html) return 0;
    const wordsPerMinute = 200;
    const cleanText = html.replace(/<[^>]*>/g, " ").trim();
    const wordCount = cleanText.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

export { BlogCreateUpdateDto, BlogDto, BlogListDto };
