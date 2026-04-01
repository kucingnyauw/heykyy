/**
 * @typedef {Object} UserSocialLink
 * @property {string} platform - The descriptive name of the social platform.
 * @property {string} icon - The visual identifier for the platform icon.
 * @property {string} url - The direct link to the user's social profile.
 */

/**
 * Data Transfer Object for an authenticated user session.
 * Includes unique identifiers and slugs for routing and profile identification.
 */
export class AuthDto {
  /**
   * @param {Object} user - The Prisma user entity including profilePhoto and social relations.
   */
  constructor(user) {
    this.id = user.id;
    this.slug = user.slug;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.about = user.about || null;
    this.avatar = user.profilePhoto?.url || null;

    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

/**
 * Data Transfer Object for User Activity.
 * Digunakan untuk memformat riwayat aktivitas menjadi kalimat yang manusiawi.
 */
export class ActivityDto {
  /**
   * @param {Object} data - Objek mentah dari service
   * @param {Date} data.timestamp - Waktu kejadian
   * @param {string} data.action - Deskripsi aksi (misal: "menyukai blog 'React'")
   * @param {string} [data.targetUrl] - Link opsional menuju konten terkait
   */
  constructor(data) {
    this.timestamp = data.timestamp;
    // Format: "Kamu telah [aksi]"
    this.sentence = data.sentence;
    this.url = data.url;

  }
}


