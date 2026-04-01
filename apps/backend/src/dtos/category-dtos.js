/**
 * @typedef {('BLOG'|'PROJECT')} CategoryType
 */

/**
 * @typedef {Object} CategoryData
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {CategoryType} type
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * DTO for single category response.
 * Used for detailed information or as a building block for lists.
 */
class CategoryDto {
  /**
   * @param {CategoryData} category
   */
  constructor(category) {
    this.id = category.id;
    this.name = category.name;
    this.slug = category.slug;
    this.type = category.type;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}

/**
 * DTO for category list response.
 * Encapsulates an array of categories for a clean API structure.
 */
class CategoryListDto {
  /**
   * @param {CategoryData[]} categories
   */
  constructor(categories) {
    /** @type {CategoryDto[]} */
    this.items = (categories || []).map(
      (category) => new CategoryDto(category)
    );
  }
}

export { CategoryDto, CategoryListDto };