class AssetCreateDto {
    constructor(payload) {
      this.url = payload.url;
      this.fileName = payload.fileName;
      this.fileType = payload.fileType;
      this.fileSize = payload.fileSize;
      this.checksum = payload.checksum;
    }
  }
  
  class AssetDto {
    constructor(asset) {
      this.id = asset.id;
      this.url = asset.url;
      this.fileName = asset.fileName;
      this.fileInfo = {
        type: asset.fileType,
        size: asset.fileSize,
        sizeFormatted: this.#formatBytes(asset.fileSize),
        extension: asset.fileName.split('.').pop(),
      };
      this.createdAt = asset.createdAt;
    }
  
    #formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
  }
  
  class AssetListDto {
    constructor(asset) {
      this.id = asset.id;
      this.fileName = asset.fileName;
      this.url = asset.url;
      this.fileInfo = {
        type: asset.fileType,
        size: asset.fileSize,
        sizeFormatted: this.#formatBytes(asset.fileSize),
        extension: asset.fileName.split('.').pop(),
      };
      
      // Menentukan Source (Relasi)
      this.source = this.#determineSource(asset);
      
      this.owner = asset.user ? {
        name: asset.user.name,
        email: asset.user.email
      } : null;
      
      this.createdAt = asset.createdAt;
    }
  
    #determineSource(asset) {
      if (asset.blogThumbnail?.length > 0) return "Blog Thumbnail";
      if (asset.blogAudios?.length > 0) return "Blog Audio";
      if (asset.projectThumbs?.length > 0) return "Project Thumbnail";
      if (asset.projectAudios?.length > 0) return "Project Audio";
      if (asset.userProfile?.length > 0) return "User Profile";
      if (asset.certificateFiles?.length > 0 || asset.certificateImg?.length > 0) return "Certificate";
      if (asset.cvFiles?.length > 0) return "CV";
      
      return "Unused / General";
    }
  
    #formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
  }
  
  export { AssetCreateDto, AssetDto, AssetListDto };