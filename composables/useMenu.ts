import type { Ingredient, Menu, ModifierGroup, Product, RecipeResponse, RecipeSteps, StockReport, ModifierIngredientMapping, ModifierGroupOption, ProductWastageStats } from '@/types/menu'
import type { ProductCategory, CategoryResponse, ProductSubCategoryResponse, ProductSubCategory } from '@/types/menu'
//import { categories } from '@vueuse/core/metadata.cjs'

export const useMenu = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const addProduct = async (product: Product) => {
        try {
            const customBody = {
                business_id: product.business_id,
                name: product.name,
                description: product.description,
                cost: product.cost,
                base_price: product.base_price,
                price: product.price,
                categories: product.product_category,
                sub_categories: product.product_sub_category,
                is_store_outlet: product.is_store_outlet,
                is_grab_food: product.is_grab_food,
                is_shopee_food: product.is_shopee_food,
                grab_food_info: product.grab_food_info,
                shopee_food_info: product.shopee_food_info,
                modifier_groups: product.modifier_groups,
                ingredients: product.ingredients,
                sort_order: product.sort_order,
            }
            const response = await $fetch<Product>(`/api/products/add-product`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                },
                body:customBody
            })

            return response
        } catch (error) {
            throw error
        }
    }

    const addCategory = async (category: ProductCategory) => {
        try{
            const customBody = {
                business_id: category.business_id,
                name: category.name,
                description: category.description,
            }

            const response = await $fetch<ProductCategory>(`/api/products/add-category`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                },
                body:customBody
            })

            return response
        } catch (error) {
            throw error
        }
    }

    const addSubCategory = async (subCategory: ProductSubCategory) => {
        try{
            const customBody = {
                business_id: subCategory.business_id,
                name: subCategory.name,
                description: subCategory.description,
            }

            const response =await $fetch(`/api/products/add-sub-category`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                },
                body:customBody
            })
            
            return response
        } catch (error) {
            throw error
        }
    }

    //get all menu products from server
    const getAllMenuProducts = async (body: {
        business_id: string,
        page: number,
        page_size: number,
        search?: string,
    }) => {
        try {
            const response = await $fetch(`/api/business/products/with-filters`, {
                method: 'POST',
                baseURL: baseUrl,
                body: body,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })
            /* const response = await $fetch(`/api/business/products/get-all-products/${businessID}/${page}/${pageSize}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            }) */

            return response
        } catch (error) {
            throw error
        }
    }

    //get all products from server
    const getAllProducts = async (businessID: string) => {
        try {
            const response = await $fetch(`/api/business/products/get-all-products/${businessID}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })

            return response
        } catch (error) {
            throw error
        }
    }

    const getAllCategories = async (businessID: string, page: number, pageSize: number) => {
        try{

            const response = await $fetch<CategoryResponse>(`/api/business/products/get-product-category/${businessID}/${page}/${pageSize}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })

            return response

        } catch (error: any) {
            return {
                data: [],
                meta: {
                    page: 1,
                    pageSize: 10,
                    total: 0,
                    totalPages: 0
                }
            }
        }
    }

    const getAllSubCategories = async (businessID: string, page: number, pageSize: number) => {
        try{
            var response = null
            if (page === null || page === undefined || pageSize === null || pageSize === undefined) {
                response = await $fetch<ProductSubCategoryResponse>(`/api/products/get-all-product-sub-category/${businessID}`, {
                    method: 'GET',
                    baseURL: baseUrl,
                    headers: {
                        Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                    }
                })
            } else{
                response = await $fetch<ProductSubCategoryResponse>(`/api/products/get-all-product-sub-category/${businessID}/${page}/${pageSize}`, {
                    method: 'GET',
                    baseURL: baseUrl,
                    headers: {
                        Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                    }
                })
            }
            return response

        } catch (error: any) {
            throw error
        }
    }

    const editProductByID = async (product: Product) => {
        try {
            // conversion of ingredients to product_ingredient_mapping
            /* const productIngredientMapping = product.ingredients.map((ingredient) => ({
                id: "00000000-0000-0000-0000-000000000000", 
                product_id: product.id,
                ingredient_id: ingredient.id,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                name: ingredient.name,
            })) */
            
            const customBody: any = {
                business_id: product.business_id,
                name: product.name,
                description: product.description,
                cost: product.cost,
                base_price: product.base_price,
                price: product.price,
                categories: product.product_category,
                sub_categories: product.product_sub_category,
                is_active: product.is_active,
                is_store_outlet: product.is_store_outlet,
                is_grab_food: product.is_grab_food,
                is_shopee_food: product.is_shopee_food,
                sort_order: product.sort_order,
                modifier_groups: product.modifier_groups,
                ingredients: product.ingredients,
                grab_food_info: product.grab_food_info,
                shopee_food_info: product.shopee_food_info,
            }

            if (product.modifier_options_id) {
                customBody.modifier_options_id = product.modifier_options_id
            }

            const response = await $fetch(`/api/products/update-product/${product.id}`, {
                method: 'PUT',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                },
                body:customBody
            })

            return response
        } catch (error: any) {
            throw error
        }
    }

    const deleteProductByID = async (product: Product, businessID: string) => {
        try {    
            const response = await $fetch(`/api/products/delete-product/${businessID}/${product.id}`, {
                method: 'DELETE',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })
            return response
        } catch (error: any) {
            throw error
        }
    }

    const editCategoryByID = async (category: ProductCategory) => {
        try {
            const customBody = {
                business_id: category.business_id,
                category_id: category.id,
                name: category.name,
                description: category.description,
            }
            const response = await $fetch(`/api/products/update-product-category`, {
                method: 'PUT',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                },
                body:customBody
            })
            return response
        } catch (error: any) {
            throw error
        }
    }

    const uploadCategoryImage = async (id: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('file', file)

            const res = await $fetch(`/api/products/category/upload-image`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const uploadCategoryBannerImage = async (id: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('file', file)

            const res = await $fetch(`/api/products/category/upload-banner`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteCategoryByID = async (category: ProductCategory) => {
        try {
            const response = await $fetch(`/api/products/delete-product-category/${category.business_id}/${category.id}`, {
                method: 'DELETE',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })
            return response
        } catch (error: any ){
            throw error
        }

    }

    const editSubCategoryByID = async (subCategory: ProductSubCategory) => {
        try {
            const customBody = {
                business_id: subCategory.business_id,
                product_sub_category_id: subCategory.id,
                name: subCategory.name,
                description: subCategory.description,
            }
            const response = await $fetch(`/api/products/update-product-sub-category`, {
                method: 'PUT',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().replace('Bearer ', '').trim()}`
                },
                body:customBody
            })
            return response
        } catch (error: any) {
            throw error
        }
    }

    const deleteSubCategoryByID = async (subCategory: ProductSubCategory) => {
        try{
            const response = await $fetch(`/api/products/delete-product-sub-category/${subCategory.business_id}/${subCategory.id}`, {
                method: 'DELETE',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().replace('Bearer ', '').trim()}`
                }
            })
            return response
        } catch (error:any){
            throw error
        }
    }

    const getAllRecipes = async (businessID: string, page: number, pageSize: number) => {
        try{
            const response = await $fetch<RecipeResponse>(`/api/recipes/get-all-recipes/${businessID}/${page}/${pageSize}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().replace('Bearer ', '').trim()}`
                }
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const uploadProductImage = async (id: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('file', file)

            const res = await $fetch(`/api/products/upload/image`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }
    
    const getAllIngredients = async (businessID: string) => {
        try{
            const response = await $fetch<{data: Ingredient[]}>(`/api/ingredients/get-all/${businessID}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response.data
        } catch (error: any){
            throw error
        }
    }

    const createIngredient = async (ingredient: Ingredient) => {
        try{
            const response = await $fetch<Ingredient>(`/api/ingredients/create`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: ingredient
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const updateIngredient = async (ingredient: Ingredient) => {
        try{
            const response = await $fetch<Ingredient>(`/api/ingredients/update/${ingredient.id}`, {
                method: 'PUT',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: ingredient
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const deleteIngredient = async (id: string) => {
        try{
            const response = await $fetch<Ingredient>(`/api/ingredients/delete/${id}`, {
                method: 'DELETE',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const uploadIngredientImage = async (id: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('file', file)

            const res = await $fetch(`/api/ingredients/upload/image`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getStockReports = async (body: {
        business_id: string,
        outlet_id?: string,
        outlet_group_id?: string,
        from_date?: string,
        to_date?: string
    }) => {
        try{
            const response = await $fetch<{data: StockReport[]}>(`/api/admin/outlet/stock/reports`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: body
            })
            return response.data
        } catch (error: any){
            throw error
        }
    }

    const getModifierList = async (businessID: string) => {
        try {
            const response = await $fetch(`/api/modifiers/get-all-modifier-groups/${businessID}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const createModifierGroup = async (modifierGroup: ModifierGroup) => {
        try{
            const response = await $fetch(`/api/modifiers/create-modifier-group`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: modifierGroup
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const deleteModifierGroup = async (id: string) => {
        
        try{
            const response = await $fetch(`/api/modifiers/delete-modifier-group/${id}`, {
                method: 'DELETE',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response
        } catch (error){
            throw error
        }
    }

    const editModifierGroup = async (modifierGroup: ModifierGroup) => {
        try{
            const response = await $fetch(`/api/modifiers/update-modifier-group/${modifierGroup.id}`, {
                method: 'PUT',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: modifierGroup
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const saveModifierIngredientsMappings = async (modifierIngredientMappings: ModifierIngredientMapping[]) => {
        try{
            const response = await $fetch(`/api/modifiers/assign-ingredients`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: {
                    modifier_ingredient_mappings: modifierIngredientMappings
                }
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const syncMenuToGrab = async (businessID: string) => {
        try{
            const response = await $fetch(`/api/internal-grabfood/sync-menu-to-grabfood/${businessID}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const getModifierOptions = async (businessID: string) => {
        try{
            const response = await $fetch<{data: ModifierGroupOption[]}>(`/api/products/get-modifier-options/${businessID}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const updateStockReport = async (body: {
        outlet_id: string,
        ingredient_id: string,
        date: Date,
        column: string,
        value: number
    }) => {
        try{
            const response = await $fetch(`/api/admin/outlets/stock-report/edit`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: body
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const getProductWastageStats = async (body: {
        business_id: string,
        outlet_id?: string,
        outlet_group_id?: string,
        from_date?: Date,
        to_date?: Date
    }) => {
        try{
            const response = await $fetch<ProductWastageStats>(`/api/admin/product-wastage-reports/get-all`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                body: body
            })
            return response
        } catch (error: any){   
            throw error
        }
    }

    const syncMenuToShopeeForAllOutlets = async (businessID: string) => {
        try{
            const response = await $fetch(`/api/shopeefood/menu/trigger-update-for-all-outlets/${businessID}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const syncMenuToShopee = async (outletID: string) => {
        try{
            const response = await $fetch(`/api/shopeefood/menu/trigger-update/${outletID}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
            })
            return response
        } catch (error: any){
            throw error
        }
    }

    const syncProductToOutlet = async (body: { business_id: string, outlet_id: string, product_id: string, is_add: boolean }) => {
        try {
            const response = await $fetch(`/api/products/sync-product-to-outlet`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                    'Content-Type': 'application/json'
                },
                body: body
            })
            return response
        } catch (error: any) {
            throw error
        }
    }

    const getProductOutlets = async (productId: string) => {
        try {
            const response = await $fetch<{ outlet_ids: string[] }>(`/api/products/get-product-outlets/${productId}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })
            return response
        } catch (error: any) {
            throw error
        }
    }

    return {
        getAllMenuProducts,
        addProduct,
        addCategory,
        addSubCategory,
        getAllCategories,
        getAllSubCategories,
        editProductByID,
        deleteProductByID,
        editCategoryByID,
        deleteCategoryByID,
        editSubCategoryByID,
        deleteSubCategoryByID,
        getAllRecipes,
        uploadProductImage,
        getAllIngredients,
        createIngredient,
        updateIngredient,
        deleteIngredient,
        uploadIngredientImage,
        getModifierList,
        createModifierGroup,
        deleteModifierGroup,
        editModifierGroup,
        getStockReports,
        saveModifierIngredientsMappings,
        getAllProducts,
        syncMenuToGrab,
        getModifierOptions,
        updateStockReport,
        getProductWastageStats,
        syncMenuToShopeeForAllOutlets,
        syncMenuToShopee,
        uploadCategoryImage,
        uploadCategoryBannerImage,
        syncProductToOutlet,
        getProductOutlets
    }

    
    
}