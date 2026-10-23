export const categoryIcons = [
  ["book", "Books"], ["scale", "Justice"], ["gavel", "Criminal law"],
  ["landmark", "Courts"], ["family", "Family law"], ["receipt", "Taxation"],
  ["shield", "Protection"], ["briefcase", "Practice"], ["graduation", "Study"],
  ["scroll", "Legislation"], ["library", "Reference"], ["file", "Documents"],
] as const;
const names = new Set<string>(categoryIcons.map(([key]) => key));
export function categoryIconFor(name: string, savedIcon?: string | null) {
  if (savedIcon && names.has(savedIcon)) return savedIcon;
  const subject = name.toLowerCase();
  if (subject.includes("family")) return "family";
  if (subject.includes("criminal")) return "gavel";
  if (subject.includes("evidence")) return "shield";
  if (subject.includes("tax")) return "receipt";
  if (subject.includes("student") || subject.includes("exam")) return "graduation";
  if (subject.includes("reference")) return "library";
  return "book";
}
