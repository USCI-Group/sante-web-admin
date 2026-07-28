//import type { Ingredient } from './ingredient'
import type { Tax } from './tax'

// Define the type for the menu title
export interface Menu {
    id: string
    name: string
    description: string
    cost: number
    base_price: number
    price: number
    image_url: string
    created_at: string
    product_category: {
        id: string
        name: string
        description: string
    }[]
    product_sub_category: {
        id: string
        name: string
        description: string
    }[]
    customization_groups: CustomizationGroup[]
    modifier_groups: ModifierGroup[]
    ingredients: Ingredient[]
    meta: Meta
}

export interface Product {
    id: string
    business_id: string
    sku?: string
    name: string
    description: string
    cost: number
    base_price?: number
    price: number
    kcal?: number
    image_url?: string
    is_store_outlet: boolean
    is_grab_food: boolean
    is_shopee_food: boolean
    grab_food_info?: GrabFoodInfo
    shopee_food_info?: ShopeeFoodInfo
    is_active?: boolean
    sort_order?: number
    created_at: string
    product_category: {
        id: string | null
        name: string
        description: string
    }[]
    product_sub_category: {
        id: string | null
        name: string
        description: string
    }[]
    modifier_groups: ModifierGroup[]
    ingredients: Ingredient[]
    experience_points?: number
    modifier_options_id?: string
    taxes?: Tax[]
    meta: Meta
}

export interface GrabFoodInfo {
	grab_food_price: number
}
export interface ShopeeFoodInfo {
	shopee_food_price: number
}

export interface ModifierGroup {
  id?: string
  external_id?: string
  name: string
  input_type: string
  business_id: string
  max_selection?: number
  created_at?: string
  updated_at?: string
  modifier_options: ModifierGroupOption[]
}

export interface ModifierGroupOption {
  id?: string
  external_id?: string
  name: string
  price_adjustment: number
  sort_order: number
  is_active?: boolean
	ingredient_mappings: ModifierIngredientMapping[]
}

export interface CustomizationGroup {
  id: string | null
  name: string
  description: string
  input_type: string
  is_required: boolean
  options: CustomizationGroupOption[]
}

export interface CustomizationGroupOption {
  id: string | null
  name: string
  description: string
  price_adjustment: number
  is_default: boolean
}

export interface ProductCategory {
    id: string;
    external_id?: string;
    name: string;
    description: string;
    business_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    image_url?: string;
    banner_url?: string;
}
  
export interface CategoryResponse {
    message: string;
    business_id: string;
    meta: {
      page: number;
      page_size: number;
      total_pages: number;
      total: number;
    };
    data: ProductCategory[];
}

export interface ProductSubCategory {
  id: string;
  name: string;
  description: string;
  business_id: string;
}

export interface ProductSubCategoryResponse {
  message: string;
  data: ProductSubCategory[];
}

export interface RecipeResponse {
  message: string;
  data: {
    id: string;
    product_name: string;
    recipe_name: string;
    recipe_description: string;
    steps: RecipeSteps[];
  }[];
}

export interface RecipeSteps {
  id: string;
  name: string;
  instructions: string;
  precedence: number;
}

export interface Ingredient {
  id: string;
  business_id: string;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
  image_url: string;
  sort_order?: number;
  created_at?: string;
}

export interface ProductIngredientMapping {
  id: string;
  product_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  name: string;
}

export interface Meta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StockReport {
  id: string;
  outlet_id: string;
  ingredient_id: string;
  ingredient?: Ingredient;
  sales: number;
  purchases: number;
  transfer_in: number;
  transfer_out: number;
  wastage: number;
  opening: number;
  opening_by_system: number;
  closing: number;
  closing_by_system: number;
  variance: number;
  created_at: string;
}

export interface ModifierIngredientMapping {
	id?: string;
	ingredient_id: string;
  ingredient?: Ingredient;
	modifier_options_id: string;
	unit: string;
	quantity: number;
	created_at?: string;
}

export interface ProductWastageItemStat {
	product_id: string;
	product_name: string;
	total_wastage: number;
	wastage_stats: {
		[key: string]: number;
	};
	sort_order: number;
}
export interface ProductWastageStats {
	headers: string[];
	product_wastage_items: ProductWastageItemStat[];
}