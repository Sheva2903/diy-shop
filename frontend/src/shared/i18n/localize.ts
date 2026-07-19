export type BilingualContent = {
  nameVi: string;
  nameEn: string;
  descriptionVi?: string;
  descriptionEn?: string;
};

export function localizeName(content: BilingualContent, language: string): string {
  return language === "en" ? content.nameEn || content.nameVi : content.nameVi || content.nameEn;
}

export function localizeDescription(content: BilingualContent, language: string): string {
  return language === "en"
    ? content.descriptionEn || content.descriptionVi || ""
    : content.descriptionVi || content.descriptionEn || "";
}
