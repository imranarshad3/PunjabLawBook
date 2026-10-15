import catalogue from "./catalogue.json";
const subjects: Record<number, string> = {
  6078: "Exam Guides",
  5966: "Exam Guides",
  4661: "Exam Guides",
  767: "Exam Guides",
  5327: "Criminal Law",
  253: "Criminal Law",
  2557: "Family Law",
  3712: "Legal Practice",
  6537: "Legal Reference",
  403: "Law of Evidence",
  5926: "Taxation Law",
};
export const products = [...catalogue.featured, ...catalogue.bestsellers].map(
  (book) => ({ ...book, category: subjects[book.id] }),
);
export type Product = (typeof products)[number];
export const categories = [...new Set(products.map((book) => book.category))];
