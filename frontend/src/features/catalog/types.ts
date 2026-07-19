export type Category = {
  id: number;
  nameVi: string;
  nameEn: string;
};

export type ProductSummary = {
  id: number;
  nameVi: string;
  nameEn: string;
  price: number;
  inventoryQuantity: number;
  inStock: boolean;
  category: Category;
  primaryImageUrl: string | null;
};

export type ProductImage = {
  id: number;
  imageUrl: string;
  primaryImage: boolean;
  sortOrder: number;
};

export type ProductDetail = ProductSummary & {
  descriptionVi: string;
  descriptionEn: string;
  images: ProductImage[];
};
