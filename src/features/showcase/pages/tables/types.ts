export interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  status: "active" | "draft" | "archived";
  avatar: string;
  thumbnail: string | string[];
  color: string;
  isFeatured: boolean;
  isVerified: boolean;
  publishedAt: string;
  stock: number;
  price: number;
  completionRate: number;
  role: "admin" | "editor" | "superadmin" | "viewer";
  isSelected: boolean;
  notes: string;
  author: {
    name?: string;
    avatarUrl?: string;
    subtitle?: string;
    status?: "online" | "offline" | "busy" | "away";
    verified?: boolean;
  };
  rating: number;
  trend: number[];
  apiKey: string;
  tags: string[];
}
