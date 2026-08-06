<script setup lang="ts">
import { h, ref, onMounted, watch, computed, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { useMenu } from '@/composables/useMenu'
import TagsCombobox from '~/components/custom/tags/TagsCombobox.vue'
import TaxCombobox from '~/components/custom/tags/TaxCombobox.vue'
import type { ProductCategory, ProductSubCategory, Product, CustomizationGroup, ModifierGroupOption } from '@/types/menu'
import type { Tax } from '@/types/tax'
import { useToast } from '~/components/ui/toast/use-toast'
import { Label } from '@/components/ui/label'
import Tooltip from '~/components/custom/Tooltip.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import ProductModifierDialog from './modifier-dialog.vue'

import { useProductStore } from '@/stores/ProductStore'
import { useRouter, useRoute } from 'vue-router'
import FileInput from '~/components/custom/fileinput/fileinput.vue'
import { useUsers } from '~/composables/useUsers'
import { useOutlets } from '~/composables/useOutlets'
import IngredientDialog from './ingredients-dialog.vue'
import { UnitMeasurementOptions } from '@/constants/common'
import type { Ingredient } from '@/types/menu'
const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const { getMe } = useUsers()
const { editProductByID, uploadProductImage, getModifierOptions, getAllMenuProducts, getProductOutlets, syncProductToOutlet } = useMenu()
const { getOutletsOptions } = useOutlets()
const { toast } = useToast()
const { myProfile } = useMyProfileStore()

const outlets = ref<{ value: string, label: string }[]>([])
const selectedOutletIDs = ref<string[]>([])
const originalOutletIDs = ref<string[]>([])

// Define props with modelValue for v-model support
const props = defineProps<{
}>()

//const imageFile = ref<File | null>(null)

// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()


const assignModifierGroupDialog = ref(false)
const assignIngredientsDialog = ref(false)
const selectedIngredients = ref<Ingredient[]>([])

// core place to store the data of the form 
const formDataMapping = reactive({
    'Product Modifier': productStore.product?.modifier_groups ? JSON.parse(JSON.stringify(productStore.product.modifier_groups)) : [],
    'Product Ingredients': productStore.product?.ingredients ? JSON.parse(JSON.stringify(productStore.product.ingredients)) : [],
    'Product ImageURL': productStore.product?.image_url || '',
    'Product Images': [] as File[],
    'Product Taxes': productStore.product?.taxes || [] as Tax[],
    'Modifier ID': productStore.product?.modifier_options_id || undefined,
})

const populateFormData = (product: Product) => {
    formDataMapping['Product Modifier'] = product.modifier_groups ? JSON.parse(JSON.stringify(product.modifier_groups)) : []
    formDataMapping['Product Ingredients'] = product.ingredients ? JSON.parse(JSON.stringify(product.ingredients)) : []
    formDataMapping['Product ImageURL'] = product.image_url || ''
    formDataMapping['Product Taxes'] = product.taxes || []
    formDataMapping['Modifier ID'] = product.modifier_options_id || undefined
    linkToModifier.value = !!product.modifier_options_id
}

watch(() => productStore.product, (newProd) => {
    if (newProd) {
        populateFormData(newProd)
    }
}, { immediate: true })

const linkToModifier = ref(productStore.product?.modifier_options_id ? true : false)
const modifiers = ref<ModifierGroupOption[]>([])

const validationSchema = {
    category: {
        condition: () => productStore.product?.product_category.length === 0,
        message: 'Please select at least one category'
    },
    subcategory: {
        condition: () => productStore.product?.product_sub_category.length === 0,
        message: 'Please select at least one subcategory'
    },
    name : {
        condition: () => productStore.product?.name?.trim() === '',
        message: 'Please enter a product name'
    },
    description: {
        condition: () => productStore.product?.description?.trim() === '' || (productStore.product?.description?.trim()?.length || 0) > 250,
        message: 'Please enter a product description, and must be less than 250 characters'
    },
    cost: {
        condition: () => isNaN(Number(productStore.product?.cost)) || Number(productStore.product?.cost) < 0,
        message: 'Please enter a valid product cost, and must be not negative'
    },
    price: {
        condition: () => isNaN(Number(productStore.product?.price)) || Number(productStore.product?.price) < 0,
        message: 'Please enter a valid product price, and must be not negative'
    },
}

const submitForm = async() => {
    // validate formData
    const errors = Object.entries(validationSchema)
    .filter(([_, { condition }]) => condition())
    .map(([_, { message }]) => message)
    
    if (errors.length > 0) {
        toast({
            title: 'Validation Errors',
            description: errors[0],
            variant: 'destructive'
        })
        return
    }
    // convert formData to Product type
    const product : Product = {
        id: productStore.product?.id || '',
        business_id: productStore.product?.business_id || myProfile.business_id || '',
        sku: productStore.product?.sku || undefined,
        name: productStore.product?.name?.trim() || '',
        description: productStore.product?.description?.trim() || '',
        cost: Number(productStore.product?.cost) || 0,
        base_price: Number(productStore.product?.price) || 0,
        price: Number(productStore.product?.price) || 0,
        kcal: Number(productStore.product?.kcal) || 0,
        sort_order: Number(productStore.product?.sort_order) || 0,
        product_category: productStore.product?.product_category || [],
        product_sub_category: productStore.product?.product_sub_category || [],
        is_active: productStore.product?.is_active as boolean,
        is_store_outlet: productStore.product?.is_store_outlet as boolean,
        is_grab_food: productStore.product?.is_grab_food as boolean,
        is_shopee_food: productStore.product?.is_shopee_food as boolean,
        grab_food_info: productStore.product?.grab_food_info || undefined,
        shopee_food_info: productStore.product?.shopee_food_info || undefined,
        modifier_groups: (formDataMapping['Product Modifier'] || []).map((m: any) => ({
            ...m,
            max_selection: Number(m.max_selection) || 1
        })),
        taxes: formDataMapping['Product Taxes'] || [],
        modifier_options_id: formDataMapping['Modifier ID'] ? formDataMapping['Modifier ID'] : undefined,
        ingredients: formDataMapping['Product Ingredients'].map((ingredient) => {
            return {
                // need convert to same due to format different
                ...ingredient,
                /* ingredient_id: ingredient.id,
                id: ingredient.id, */

            }
        }) || [],
        created_at: productStore.product?.created_at || '',
        meta: productStore.product?.meta || {
            total: 0,
            page: 0,
            page_size: 0,
            total_pages: 0
        }
    }
    try {
        await editProductByID(product)

        // sync outlets
        const additions = selectedOutletIDs.value.filter(id => !originalOutletIDs.value.includes(id))
        const removals = originalOutletIDs.value.filter(id => !selectedOutletIDs.value.includes(id))

        for (const outletId of additions) {
            await syncProductToOutlet({
                business_id: myProfile.business_id || '',
                outlet_id: outletId,
                product_id: product.id,
                is_add: true
            })
        }
        for (const outletId of removals) {
            await syncProductToOutlet({
                business_id: myProfile.business_id || '',
                outlet_id: outletId,
                product_id: product.id,
                is_add: false
            })
        }

        toast({
            title: 'Product Updated',
            description: 'Product updated successfully',
            variant: 'success'
        })
        // upload image
        const imageFile = formDataMapping['Product Images'][0]
        if(imageFile){
            if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(imageFile.type)) {
                throw new Error('Image format is not supported')
            }
            await uploadProductImage(product.id, imageFile)
        }

        emit('success')
        await router.push('/product/products')

    } catch (error: any) {
        toast({
            title: 'Error',
            description:  error.data?.message || error.message || 'Failed to update product',
            variant: 'destructive'
        })
    }
}

const assignModifierGroup = () => {
    assignModifierGroupDialog.value = !assignModifierGroupDialog.value
}

const assignIngredients = () => {
    selectedIngredients.value = formDataMapping['Product Ingredients'].map((ingredient: any) => {
        return {
            id: ingredient.ingredient_id,
            name: ingredient.name,
            description: ingredient.description,
            unit: ingredient.unit,
            price_per_unit: ingredient.price_per_unit,
            business_id: myProfile.business_id || '',
            quantity: ingredient.quantity,
            image_url: ingredient.image_url,
        }
    })
    assignIngredientsDialog.value = !assignIngredientsDialog.value
}

const updateSelectedIngredients = (ingredients: Ingredient[]) => {
    ingredients.forEach(ingredient => {
        // Check if the ingredient already exists in the array
        const existingIngredientIndex = formDataMapping['Product Ingredients'].findIndex(
            (item: any) => item.ingredient_id === ingredient.id
        );
        
        // If the ingredient already exists, skip adding it
        if (existingIngredientIndex !== -1) {
            return;
        }
        const productIngredientMapping = {
            ...ingredient,
            ingredient_id: ingredient.id,
        }
        formDataMapping['Product Ingredients'].push(productIngredientMapping)
    });

    formDataMapping['Product Ingredients'].forEach((mapping: any) => {
        const existingIngredientIndex = ingredients.findIndex(
            (ingredient: Ingredient) => ingredient.id === mapping.ingredient_id
        );
        // if doesn't exist in the selected ingredients, remove it
        if (existingIngredientIndex === -1) {
            formDataMapping['Product Ingredients'] = formDataMapping['Product Ingredients'].filter((item: any) => item.ingredient_id !== mapping.ingredient_id);
        }
    })
}

const deleteModifier = (modifierID: string) => {
    formDataMapping['Product Modifier'] = formDataMapping['Product Modifier'].filter((modifier) => modifier.id !== modifierID)
}

const deleteIngredient = (ingredientID: string) => {
    formDataMapping['Product Ingredients'] = formDataMapping['Product Ingredients'].filter((ingredient) => ingredient.id !== ingredientID)
}

// Still keep onMounted for initial load if dialog is already open
onMounted(async () => {
    await getMe()
    await fetchModifiers()
    
    const businessId = myProfile.business_id || ''
    if (businessId) {
        try {
            const outletsOptions = await getOutletsOptions(businessId)
            outlets.value = outletsOptions || []
        } catch (err) {
            console.error("Failed to load outlets options:", err)
        }
    }

    const productId = route.query.id as string
    if (productId) {
        try {
            const res = await getProductOutlets(productId)
            selectedOutletIDs.value = res.outlet_ids || []
            originalOutletIDs.value = [...(res.outlet_ids || [])]
        } catch (err) {
            console.error("Failed to load product outlets:", err)
        }
    }

    if (productId && (!productStore.product || productStore.product.id !== productId)) {
        try {
            const res: any = await getAllMenuProducts({
                business_id: myProfile.business_id || '',
                page: 1,
                page_size: 100
            })
            const products = res.data?.products || res.products || res.data || []
            const found = products.find((p: any) => p.id === productId)
            if (found) {
                productStore.setCurrentProduct(found)
                populateFormData(found)
            }
        } catch (err) {
            console.error("Failed to load product by ID:", err)
        }
    }
})

const fetchModifiers = async () => {
    try {
        const modifierOptions = await getModifierOptions(myProfile.business_id || '')
        modifiers.value = modifierOptions.data || []
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to get modifiers',
            variant: 'destructive'
        })
    }
}

const handleCancel = () => {
    router.push('/product/products')
}

</script>

<template>
<div class="w-full h-full p-6">
    <div class="w-full h-full rounded-xl border border-[#E9EAEB] p-6">
        <Breadcrumb class="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        <Icon icon="heroicons:home" class="w-6 h-6" />
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] min-w-[150px] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:shopping-bag" class="w-6 h-6" />
                            <p class="text-sm text-gray-500">Product Management</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] min-w-[150px] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:document" class="w-6 h-6" />
                            <p class="text-sm text-gray-500">Product Details</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] min-w-[150px] bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:clipboard" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Product Customizations</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <!-- Header title of page -->
        <div class="flex flex-row items-center my-8 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <span class="flex flex-col">
                    <h1 class="text-lg font-medium">Product Customizations</h1>
                    <span class="text-sm text-gray-500">Edit product from an initial idea to its final market launch.</span>
                </span>
            </div>
            
        </div>

        <!-- Product Input Body-->
        <div class="w-full bg-white min-h-[600px]">
            <!-- Responsive grid that changes based on screen size -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="w-full flex flex-col gap-4 md:gap-6">
                    <!-- Product Details-->
                    <div class="w-full flex flex-col rounded-md border border-[#E9EAEB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div class="bg-gray-50 p-3 border-b border-[#E9EAEB]">
                            <h3 class="font-medium text-gray-800">Product Details</h3>
                        </div>
                        <div class="p-2.5 flex-1 space-y-2">
                            <!-- Product details form-->
                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Name <span class="text-red-500">*</span></p>
                                <Input 
                                    class="w-full" 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.name" 
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product SKU <span class="text-xs text-gray-400 font-normal ml-1">(Optional, for POS Sync)</span></p>
                                <Input 
                                    class="w-full" 
                                    placeholder="e.g. 2101"
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.sku" 
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Description <span class="text-red-500">*</span></p>
                                <Input 
                                    class="w-full" 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.description" 
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Cost <span class="text-red-500">*</span></p>
                                <Input 
                                    class="w-full" 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.cost" 
                                    type="number"
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Price <span class="text-red-500">*</span></p>
                                <Input 
                                    class="w-full" 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.price" 
                                    type="number"
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Kcal</p>
                                <Input 
                                    class="w-full" 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.kcal" 
                                    type="number"
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Sort Order <span class="text-red-500">*</span></p>
                                <Input 
                                    class="w-full" 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.sort_order" 
                                    type="number"
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Category <span class="text-red-500">*</span></p>
                                <TagsCombobox 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.product_category as ProductCategory[]"
                                    :options="[]"
                                    placeholder="Select categories"
                                    :disabled="false"     
                                    type='category'
                                    :isFullWidth="true"
                                    :widthDropdownMenu="'w-[500px]'"
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Subcategory <span class="text-red-500">*</span></p>
                                <TagsCombobox 
                                    v-if="productStore.product !== null"
                                    v-model="productStore.product.product_sub_category as ProductSubCategory[]"
                                    :options="[]"
                                    placeholder="Select subcategories"
                                    :disabled="false"     
                                    type='subcategory'
                                    :isFullWidth="true"
                                    :widthDropdownMenu="'w-[500px]'"
                                />
                            </div>

                            <div class="flex flex-col justify-center items-start">
                                <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Taxes</p>
                                <TaxCombobox 
                                    v-if="productStore.product !== null"
                                    v-model="formDataMapping['Product Taxes']"
                                    placeholder="Select taxes"
                                    :isFullWidth="true"
                                />
                            </div>

                            <br>
                            <div class="flex flex-col justify-center items-star">
                                <div class="flex items-center justify-between w-full">
                                    <div class="flex items-center">
                                        <span
                                            class="inline-block w-3 h-3 rounded-full mr-2"
                                            :class="productStore.product?.is_active as boolean ? 'bg-green-500' : 'bg-yellow-400'"
                                        ></span>
                                        <p :class="['text-sm font-medium leading-tight', productStore.product?.is_active as boolean ? 'text-green-600' : 'text-yellow-600']">
                                            {{ productStore.product?.is_active as boolean ? 'Active' : 'Inactive' }}
                                        </p>
                                        <Tooltip 
                                            class="ml-10 pl-8"
                                            text="Enable this product to make it available on the menu in the following platform." 
                                            position="top"
                                            :isAbsolute="true"
                                        >
                                            <Icon icon="mdi:information-outline" class="w-5 h-5 text-gray-500 cursor-help ml-1" />
                                        </Tooltip>
                                    </div>
                                    <Switch 
                                        v-if="productStore.product !== null"
                                        v-model="productStore.product.is_active as boolean" 
                                        :checked="productStore.product.is_active as boolean"
                                        @update:checked="productStore.product.is_active = !productStore.product.is_active"                  
                                    />
                                </div>
                            </div>

                            <div class="flex flex-col justify-center items-star">
                                <div class="flex items-center justify-between w-full">
                                    <p :class="['text-sm font-medium leading-tight', productStore.product?.is_active as boolean ? 'text-gray-600' : 'text-gray-200']">Display in Store Outlet</p>
                                    <Switch 
                                        v-if="productStore.product !== null"
                                        :disabled="!productStore.product.is_active as boolean"
                                        v-model="productStore.product.is_store_outlet as boolean" 
                                        :checked="productStore.product.is_store_outlet as boolean"
                                        @update:checked="productStore.product.is_store_outlet = !productStore.product.is_store_outlet"                  
                                    />
                                </div>
                                <div v-if="productStore.product?.is_store_outlet" class="pl-4 mt-3 border-l-2 border-green-500 space-y-2 mb-2">
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Available Outlets</p>
                                    <div v-for="outlet in outlets" :key="outlet.id" class="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            :id="`outlet-${outlet.id}`" 
                                            :value="outlet.id" 
                                            v-model="selectedOutletIDs"
                                            class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <label :for="`outlet-${outlet.id}`" class="text-sm font-medium text-gray-700 cursor-pointer">
                                            {{ outlet.name }}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col justify-center items-star mb-2">
                                <div class="flex items-center justify-between w-full">
                                    <p :class="['text-sm font-medium leading-tight', productStore.product?.is_active as boolean ? 'text-gray-600' : 'text-gray-200']">Grabfood Product</p>
                                    <Switch 
                                        v-if="productStore.product !== null"
                                        :disabled="!productStore.product.is_active as boolean"
                                        v-model="productStore.product.is_grab_food as boolean" 
                                        :checked="productStore.product.is_grab_food as boolean"
                                        @update:checked="productStore.product.is_grab_food = !productStore.product.is_grab_food"                  
                                    />
                                </div>
                                
                            </div>

                            <div class="flex flex-col justify-center items-star">
                                <div class="flex items-center justify-between w-full">
                                    <p :class="['text-sm font-medium leading-tight', productStore.product?.is_active as boolean ? 'text-gray-600' : 'text-gray-200']">Shopeefood Product</p>
                                    <Switch 
                                        v-if="productStore.product !== null"
                                        :disabled="!productStore.product.is_active as boolean"
                                        v-model="productStore.product.is_shopee_food as boolean" 
                                        :checked="productStore.product.is_shopee_food as boolean"
                                        @update:checked="productStore.product.is_shopee_food = !productStore.product.is_shopee_food"                  
                                    />
                                </div>
                                
                            </div>

                            <!-- Grabfood Price -->
                            <transition name="fade">
                                <div v-if="productStore.product?.is_grab_food && productStore.product?.grab_food_info" class="w-full mt-3 flex flex-col items-end">
                                    <label for="grabfood-price" class="block text-xs font-medium text-green-700 mb-1 ml-2">Grabfood Price</label>
                                    <div class="flex items-center gap-2 w-full">
                                        <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-400 text-sm">RM</span>
                                        <input
                                            id="grabfood-price"
                                            type="number"
                                            min="0"
                                            placeholder="Enter Grabfood price..."
                                            v-model="productStore.product.grab_food_info.grab_food_price as number"
                                            class="w-full rounded-r-md border border-gray-300 py-2 px-3 text-sm focus:border-green-500 focus:ring-green-500 transition outline-none bg-white disabled:bg-gray-50"
                                        />
                                    </div>
                                    <small class="text-gray-500 mt-1 ml-2">This price will be used on Grabfood integration.</small>
                                </div>
                            </transition>
                            
                            <!-- Shopeefood Price -->
                            <transition name="fade">
                                <div v-if="productStore.product?.is_shopee_food && productStore.product?.shopee_food_info" class="w-full mt-3 flex flex-col items-end">
                                    <label for="shopeefood-price" class="block text-xs font-medium text-green-700 mb-1 ml-2">Shopeefood Price</label>
                                    <div class="flex items-center gap-2 w-full">
                                        <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-400 text-sm">RM</span>
                                        <input
                                            id="shopeefood-price"
                                            type="number"
                                            min="0"
                                            placeholder="Enter Shopeefood price..."
                                            v-model="productStore.product.shopee_food_info.shopee_food_price as number"
                                            class="w-full rounded-r-md border border-gray-300 py-2 px-3 text-sm focus:border-green-500 focus:ring-green-500 transition outline-none bg-white disabled:bg-gray-50"
                                        />
                                    </div>
                                    <small class="text-gray-500 mt-1 ml-2">This price will be used on Shopeefood integration.</small>
                                </div>
                            </transition>
                        </div>
                    </div>
                    
                    <!-- Product Gallery-->
                    <div class="w-full flex-1 flex flex-col rounded-md border border-[#E9EAEB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div class="bg-gray-50 p-3 border-b border-[#E9EAEB]">
                            <h3 class="font-medium text-gray-800">Product Gallery</h3>
                        </div>
                        <div class="p-4">
                            <FileInput 
                                :label="'Upload Product Images'"
                                :maxFiles="1"
                                :maxSize="1024 * 1024 *4"
                                :multiple="true"
                                :accept="'image/*'"
                                :isSubmitButton="false"
                                :previewUrls="formDataMapping['Product ImageURL']"
                                @selected-files="(files) => formDataMapping['Product Images'] = files"
                            />
                        </div>
                    </div>
                </div>
                
                <!-- Right column -->
                <div class="w-full flex flex-col gap-4 md:gap-6">
                    <!-- modifier -->
                    <div class="rounded-md border border-[#E9EAEB] w-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div class="bg-gray-50 p-3 border-b border-[#E9EAEB]">
                            <h3 class="font-medium text-gray-800">Modifier</h3>
                        </div>
                        <div class="pl-2.5 pt-2.5 pb-2.5 justify-start text-[#535862] text-sm font-medium leading-tight">
                            <p>Product Modifier</p>
                        </div>
                        <!-- modifier group and options -->
                        <div v-for="(modifier, index) in formDataMapping['Product Modifier']" class="p-2.5 flex-1 space-y-1.5">
                            <div class="p-2.5 w-full h-full grid grid-cols-2 gap-2.5 rounded-lg border border-[#E9EAEB]">
                                <div class="p-2.5 flex justify-between items-center w-full cursor-pointer rounded-lg border border-[#E9EAEB]">
                                    <p class="text-[#181D27] text-xs font-medium leading-none">{{ modifier.name }}</p>
                                    <Icon  @click="deleteModifier(modifier.id as string)" icon="heroicons:trash" class="w-4 h-4 text-gray-500" />
                                </div>
                                
                                <div class="w-full flex flex-row justify-start items-center">
                                    <div class="p-2.5 flex justify-between items-center rounded-lg border border-[#E9EAEB]">
                                        <p class="rounded-r-none border-r-0 text-xs">Quantity</p>
                                    </div>
                                    <Input
                                        v-model="modifier.max_selection"
                                        type="number"
                                        class="w-2/3 rounded-l-none"
                                    />
                                </div>
                            </div>
                            <!-- <div class="p-2.5 w-full h-full flex-col justify-start items-center space-y-2.5 rounded-lg border border-[#E9EAEB]">
                                <div class="flex justify-between items-center w-full cursor-pointer" @click="deleteModifier(modifier.id as string)">
                                    <p class="text-[#181D27] text-xs font-medium leading-none">{{ modifier.name }}</p>
                                    <Icon icon="heroicons:trash" class="w-4 h-4 text-gray-500" />
                                </div>
                                <li 
                                    v-for="(option, index) in modifier.modifier_options"
                                    :key="index"
                                    class="w-full text-[#181D27] text-xs font-normal leading-none pl-2"
                                >
                                    {{ option.name }}
                                </li>

                            </div> -->
                        </div>

                        <!-- add modifier -->
                        <Button @click="assignModifierGroup" class="ml-2.5 mr-2.5 mb-2.5 flex-1 rounded-lg bg-white border border-[#4ADE80] text-[#4ADE80] space-y-1 hover:border-[#059669] hover:text-[#059669]">
                            <Icon icon="heroicons:plus" class="w-4 h-4" />
                            Add Modifier
                        </Button>
                    </div>

                    <div class="rounded-md border border-[#E9EAEB] w-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div class="bg-gray-50 p-3 border-b border-[#E9EAEB]">
                            <h3 class="font-medium text-gray-800">Ingredients Variable</h3>
                        </div>
                        <div class="pl-2.5 pt-2.5 pb-2.5justify-start text-[#535862] text-sm font-medium leading-tight">
                            <p>Product Ingredients</p>
                        </div>
                        <!-- Ingredients Variable-->
                        <div v-for="(ingredient, index) in formDataMapping['Product Ingredients']" class="p-2.5 flex-1 space-y-1.5">
                            <div class="p-2.5 w-full h-full grid grid-cols-2 gap-2.5 rounded-lg border border-[#E9EAEB]">
                                <div class="p-2.5 flex justify-between items-center w-full cursor-pointer rounded-lg border border-[#E9EAEB]">
                                    <p class="text-[#181D27] text-xs font-medium leading-none">{{ ingredient.name }}</p>
                                    <Icon  @click="deleteIngredient(ingredient.id as string)" icon="heroicons:trash" class="w-4 h-4 text-gray-500" />
                                </div>
                                
                                <div class="w-full flex flex-row justify-start items-center">
                                    <Select v-model="formDataMapping['Product Ingredients'][index].unit">
                                        <SelectTrigger class="w-1/3 rounded-r-none border-r-0"> 
                                            <SelectValue placeholder="unit" />
                                        </SelectTrigger>
                                        <SelectContent class="min-w-0">
                                            <SelectItem v-for="unit in UnitMeasurementOptions" :key="unit" :value="unit">
                                                {{ unit }}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        v-model="formDataMapping['Product Ingredients'][index].quantity"
                                        type="number"
                                        class="w-2/3 rounded-l-none"
                                    />
                                </div>
                            

                            </div>
                        </div>

                        <!-- add modifier -->
                        <Button @click="assignIngredients" class="ml-2.5 mr-2.5 mb-2.5 flex-1 rounded-lg bg-white border border-[#4ADE80] text-[#4ADE80] space-y-1 hover:border-[#059669] hover:text-[#059669]">
                            <Icon icon="heroicons:plus" class="w-4 h-4" />
                            Add Ingredients
                        </Button>
                    </div>

                    <div class="w-full flex flex-col rounded-md border border-[#E9EAEB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div class="bg-gray-50 p-3 border-b border-[#E9EAEB]">
                            <h3 class="font-medium text-gray-800">Product Variable</h3>
                        </div>
                        <div class="pl-2.5 pt-2.5 justify-start text-[#535862] text-sm font-medium leading-tight">
                            <p>Product Variable</p>
                        </div>
                        <div class="p-2.5 flex-1">
                            <!-- Content here -->
                        </div>
                    </div>

                    <div class="w-full flex flex-col rounded-md border border-[#E9EAEB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div class="bg-gray-50 p-3 border-b border-[#E9EAEB]">
                            <div class="flex items-center">
                                <h3 class="font-medium text-gray-800">Link To Modifier</h3>
                                <Tooltip 
                                    class="ml-20 pl-10"
                                    text="Link this product to a modifier. 
                                    This Product will be considered as modifier in finance statistics.
                                    But will still go through purchase flow like a regular product." 
                                    position="top"
                                    :isAbsolute="true"
                                >
                                    <Icon icon="mdi:information-outline" class="w-5 h-5 text-gray-500 cursor-help ml-1" />
                                </Tooltip>
                            </div>
                        </div>
                        <div class="pl-2.5 pt-2.5 justify-start text-[#535862] text-sm font-medium leading-tight">
                        </div>
                        <div class="p-2.5 flex-1">
                            <!-- Content here -->
                            <div class="flex items-center gap-2">
                                <div class="flex items-center justify-between w-full">
                                    <p class="text-gray-600 text-sm font-medium leading-tight">Link to Modifier</p>
                                    <Switch 
                                        v-model="linkToModifier" 
                                        :checked="linkToModifier"
                                        @update:checked="linkToModifier = !linkToModifier"                  
                                    />
                                </div>
                                
                            </div>
                            <div class="my-4" v-if="linkToModifier">
                                <Select v-model="formDataMapping['Modifier ID']">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Modifier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem v-for="modifier in modifiers" :key="modifier.id" :value="String(modifier.id)">
                                            {{ modifier.name }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save and Cancel button -->
            <div class="w-full flex flex-row justify-end gap-2">
                <Button @click="handleCancel" class="w-[10%] rounded-lg bg-white border border-[#00A859] text-[#00A859] space-y-1 ">
                    Cancel
                </Button>
                <Button @click="submitForm" class="w-[10%] rounded-lg bg-[#00A859] border border-[#4ADE80] text-white space-y-1 hover:border-[#059669] hover:text-[#059669]">
                    Save
                </Button>
            </div>
        </div>

        <ProductModifierDialog 
            v-if="assignModifierGroupDialog" 
            v-model="assignModifierGroupDialog" 
            :selected-modifiers="formDataMapping['Product Modifier']"
            @selectedModifiers="(modifiers) => formDataMapping['Product Modifier'] = modifiers" 
            @selected-modifiers="(modifiers) => formDataMapping['Product Modifier'] = modifiers" 
        />
    
        <IngredientDialog                      
            v-if="assignIngredientsDialog" 
            v-model="assignIngredientsDialog" 
            :selected-ingredients="selectedIngredients"
            @selected-ingredients="updateSelectedIngredients" 
        />

    </div>
</div>


</template>

