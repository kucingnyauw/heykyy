class EducationDto {
  constructor(education) {
    this.id = education.id;
    this.title = education.title;
    this.institution = education.institution;
    this.description = education.description;
    this.startYear = education.startYear;
    this.endYear = education.endYear;
    this.isCurrent = education.isCurrent;
    this.createdAt = education.createdAt;
    this.updatedAt = education.updatedAt;
  }
}

class EducationListDto {
  constructor(educations) {
    this.items = (educations || []).map(
      (education) => new EducationDto(education)
    );
  }
}

export { EducationDto, EducationListDto };
