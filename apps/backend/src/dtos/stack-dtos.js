/**
 * Data Transfer Object for a single technology stack.
 * standardizes the delivery of tech metadata like names, icons, and official documentation links.
 */
class StackDto {
  /**
   * @param {Object} stack - The Prisma stack object.
   */
  constructor(stack) {
    this.id = stack.id;
    this.name = stack.name;
    this.icon = stack.icon;
    this.url = stack.url;
    this.createdAt = stack.createdAt;
    this.updatedAt = stack.updatedAt;
  }
}

/**
 * Collection DTO for handling multiple technology stacks.
 * Useful for providing a clean list of technologies for project tagging or skill displays.
 */
class StackListDto {
  /**
   * @param {Object[]} stacks - Array of stack objects from the database.
   */
  constructor(stacks) {
    /** @type {StackDto[]} */
    this.items = (stacks || []).map((stack) => new StackDto(stack));
  }
}

export { StackDto, StackListDto };