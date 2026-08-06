<script setup lang="ts">
import { h, ref, onMounted, watch, computed, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { useMenu } from '@/composables/useMenu'
import TagsCombobox from '~/components/custom/tags/TagsCombobox.vue'
import TaxCombobox from '~/components/custom/tags/TaxCombobox.vue'
import type { ProductCategory, ProductSubCategory, Product, CustomizationGroup, ModifierGroup, GrabFoodInfo, ShopeeFoodInfo } from '@/types/menu'
import type { Tax } from '@/types/tax'
import { useToast } from '~/components/ui/toast/use-toast'
import { Label } from '@/components/ui/label'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import IngredientDialog from '../product-edit/ingredients-dialog.vue'
import ModifierDialog from '../product-edit/modifier-dialog.vue'
import { useProductStore } from '@/stores/ProductStore'
import { useDateFormat } from '@vueuse/core'
import type { Ingredient } from '@/types/menu'
import { useRouter } from 'vue-router'
import FileInput from '~/components/custom/fileinput/fileinput.vue'
import { useOutlets } from '~/composables/useOutlets'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


const router = useRouter()
const productStore = useProductStore()
const {addProduct, uploadProductImage, syncProductToOutlet} = useMenu()
const { getOutletsOptions } = useOutlets()
const { toast } = useToast()
const { me, getMe } = useUsers()

const outlets = ref<{ value: string, label: string }[]>([])
const selectedOutletIDs = ref<string[]>([])

// Define props with modelValue for v-model support
const props = defineProps<{

}>()

const imageFile = ref<File | null>(null)

// Define emit for v-model support
const emit = defineEmits<{
  //(e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

const assignModifierGroupDialog = ref(false)
const assignIngredientsDialog = ref(false)

// core place to store the data of the form 
const formDataMapping = reactive({
    'Product Name': '',
    'Product SKU': '',
    'Product Description': '',
    'Product Cost': 0,
    // 'Product Base Price': 0,
    'Product Selling Price': 0,
    'Product Kcal': 0,
    'Sort Order': 0,
    'Product Category': [] as ProductCategory[],
    'Product Subcategory': [] as ProductSubCategory[],
    'Product Taxes': [] as Tax[],
    'Grabfood Info': {} as GrabFoodInfo,
    'Shopeefood Info': {} as ShopeeFoodInfo,
    'Display in Store Outlet': true,
    'Grabfood Product': false,
    'Shopeefood Product': false,
    'Product Customizations': [] as CustomizationGroup[],
    'Product Modifier': [] as ModifierGroup[],
    'Product Ingredients': [] as Ingredient[],
    'Product Images': [] as File[],
})

const productData = ref<Product | null>(null) ;

const validationSchema = {
    category: {
        condition: () => formDataMapping['Product Category'].length === 0,
        message: 'Please select at least one category'
    },
    subcategory: {
        condition: () => formDataMapping['Product Subcategory'].length === 0,
        message: 'Please select at least one subcategory'
    },
    name : {
        condition: () => formDataMapping['Product Name']?.trim() === '',
        message: 'Please enter a product name'
    },
    description: {
        condition: () => formDataMapping['Product Description']?.trim() === '',
        message: 'Please enter a product description'
    },
    cost: {
        condition: () => isNaN(Number(formDataMapping['Product Cost'])) || Number(formDataMapping['Product Cost']) < 0,
        message: 'Please enter a valid product cost, and must be greater than 0'
    },
    // base_price: {
    //     condition: () => isNaN(Number(formDataMapping['Product Base Price'])) || Number(formDataMapping['Product Base Price']) < 0,
    //     message: 'Please enter a valid product base price, and must be greater than 0'
    // },
    price: {
        condition: () => isNaN(Number(formDataMapping['Product Selling Price'])) || Number(formDataMapping['Product Selling Price']) < 0,
        message: 'Please enter a valid product price, and must be greater than 0'
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
        business_id: me.value?.business_id|| '',
        sku: formDataMapping['Product SKU']?.trim() || undefined,
        name: formDataMapping['Product Name']?.trim() || '',
        description: formDataMapping['Product Description']?.trim() || '',
        cost: Number(formDataMapping['Product Cost']) || 0,
        // base_price: Number(formDataMapping['Product Base Price']) || 0,
        price: Number(formDataMapping['Product Selling Price']) || 0,
        kcal: Number(formDataMapping['Product Kcal']) || 0,
        sort_order: Number(formDataMapping['Sort Order']) || 0,
        product_category: formDataMapping['Product Category'] || [],
        product_sub_category: formDataMapping['Product Subcategory'] || [],
        is_store_outlet: formDataMapping['Display in Store Outlet'] as boolean,
        is_grab_food: formDataMapping['Grabfood Product'] as boolean,
        is_shopee_food: formDataMapping['Shopeefood Product'] as boolean,
        grab_food_info: formDataMapping['Grabfood Info'] || undefined,
        shopee_food_info: formDataMapping['Shopeefood Info'] || undefined,
        modifier_groups: formDataMapping['Product Modifier'] || [],
        taxes: formDataMapping['Product Taxes'] || [],
        ingredients: formDataMapping['Product Ingredients'] || [],
        created_at: productStore.product?.created_at || '',
        image_url: '',
        meta: {
            total: 0,
            page: 1,
            page_size: 10,
            total_pages: 1,
        },
    }
    try {
        const response = await addProduct(product)

        // sync outlets if display in store outlet is checked
        if (product.is_store_outlet) {
            const validOutletIDs = outlets.value.map(o => o.id)
            const activeSelectedOutletIDs = selectedOutletIDs.value.filter(id => id && validOutletIDs.includes(id))
            const unselectedOutlets = outlets.value.filter(o => !activeSelectedOutletIDs.includes(o.id))

            for (const outletId of activeSelectedOutletIDs) {
                await syncProductToOutlet({
                    business_id: me.value?.business_id || '',
                    outlet_id: outletId,
                    product_id: response.id,
                    is_add: true
                })
            }
            for (const outlet of unselectedOutlets) {
                await syncProductToOutlet({
                    business_id: me.value?.business_id || '',
                    outlet_id: outlet.id,
                    product_id: response.id,
                    is_add: false
                })
            }
        }

        toast({
            title: 'Product Created',
            description: 'Product created successfully',
            variant: 'success'
        })

        // upload the image file (0 as for now only one image is allowed)
        const imageFile = formDataMapping['Product Images'][0]
        if(imageFile){
            await uploadProductImage(response.id, imageFile)
        }

        emit('success')
        // push and reload the page
        await router.push('/Product/products')
        window.location.reload() 
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to create product',
            variant: 'destructive'
        })
    }
}

const assignModifierGroup = () => {
    console.log("assignModifierGroupDialog", assignModifierGroupDialog.value)
    assignModifierGroupDialog.value = !assignModifierGroupDialog.value

}

const assignIngredients = () => {
    console.log("assignIngredientsDialog", assignIngredientsDialog.value)
    assignIngredientsDialog.value = !assignIngredientsDialog.value
}

const deleteModifier = (modifierId: string) => {
    console.log("deleteModifier", modifierId)
    formDataMapping['Product Modifier'] = formDataMapping['Product Modifier'].filter((modifier) => modifier.id !== modifierId)
}

const deleteIngredient = (ingredientID: string) => {
    console.log("deleteIngredient", ingredientID)
    formDataMapping['Product Ingredients'] = formDataMapping['Product Ingredients'].filter((ingredient) => ingredient.id !== ingredientID)
}

// Still keep onMounted for initial load if dialog is already open
onMounted(async () => {
    await getMe()
    const businessId = me.value?.business_id || ''
    if (businessId) {
        try {
            const outletsOptions = await getOutletsOptions(businessId)
            outlets.value = outletsOptions || []
            // Select all outlets by default for new products
            selectedOutletIDs.value = (outletsOptions || []).map(o => o.id)
        } catch (err) {
            console.error("Failed to load outlets options:", err)
        }
    }
})

const handleCancel = () => {
    router.push('/product/products')
}

const handleChangeBoolean = (key: keyof typeof formDataMapping) => {
    if (typeof formDataMapping[key] === 'boolean') {
        (formDataMapping[key] as boolean) = !formDataMapping[key]
    }
}

</script>

<template>
    <div class="product-creation p-6">
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
                            <div class="flex px-2.5 py-[5px] h-[34px] min-w-[150px] bg-[#00A859] rounded-md justify-center items-center gap-2">
                                <Icon icon="heroicons:document" class="w-6 h-6 text-white" />
                                <p class="text-white text-sm">Product Creation</p>
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
                                        v-model="formDataMapping['Product Name']" 
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product SKU <span class="text-xs text-gray-400 font-normal ml-1">(Optional, for POS Sync)</span></p>
                                    <Input 
                                        class="w-full" 
                                        placeholder="e.g. 2101"
                                        v-model="formDataMapping['Product SKU']" 
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Description <span class="text-red-500">*</span></p>
                                    <Input 
                                        class="w-full" 
                                        v-model="formDataMapping['Product Description']" 
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Cost <span class="text-red-500">*</span></p>
                                    <Input 
                                        class="w-full" 
                                        v-model="formDataMapping['Product Cost']" 
                                        type="number"
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Selling Price <span class="text-red-500">*</span></p>
                                    <Input 
                                        class="w-full" 
                                        v-model="formDataMapping['Product Selling Price']" 
                                        type="number"
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Kcal</p>
                                    <Input 
                                        class="w-full" 
                                        v-model="formDataMapping['Product Kcal']" 
                                        type="number"
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Sort Order <span class="text-red-500">*</span></p>
                                    <Input 
                                        class="w-full" 
                                        v-model="formDataMapping['Sort Order']" 
                                        type="number"
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <Label class="text-gray-600 text-sm font-medium leading-tight">Product Category <span class="text-red-500">*</span></Label>
                                    <TagsCombobox 
                                        v-model="formDataMapping['Product Category']"
                                        :options="[]"
                                        placeholder="Select categories"
                                        :disabled="false"
                                        type="category"
                                        :isFullWidth="true"
                                        :widthDropdownMenu="'w-[500px]'"
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <Label class="text-gray-600 text-sm font-medium leading-tight">Product Subcategory <span class="text-red-500">*</span></Label>
                                    <TagsCombobox 
                                        v-model="formDataMapping['Product Subcategory']"
                                        :options="[]"
                                        placeholder="Select subcategories"
                                        :disabled="false"
                                        type="subcategory"
                                        :isFullWidth="true"
                                        :widthDropdownMenu="'w-[500px]'"
                                    />
                                </div>

                                <div class="flex flex-col justify-center items-start">
                                    <p class="justify-start text-gray-600 text-sm font-medium leading-tight">Product Taxes</p>
                                    <TaxCombobox 
                                        v-model="formDataMapping['Product Taxes']"
                                        placeholder="Select taxes"
                                        :isFullWidth="true"
                                    />
                                </div>

                                <br>
                                <div class="flex flex-col justify-center items-star">
                                    <div class="flex items-center justify-between w-full">
                                        <p class="text-gray-600 text-sm font-medium leading-tight">Display in Store Outlet</p>
                                        <Switch 
                                            v-model="formDataMapping['Display in Store Outlet'] as boolean" 
                                            :checked="formDataMapping['Display in Store Outlet'] as boolean"
                                            @update:checked="handleChangeBoolean('Display in Store Outlet')"                  
                                        />
                                    </div>
                                    <div v-if="formDataMapping['Display in Store Outlet']" class="pl-4 mt-3 border-l-2 border-green-500 space-y-2 mb-2">
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

                                <div class="flex flex-col justify-center items-star">
                                    <div class="flex items-center justify-between w-full">
                                        <p class="text-gray-600 text-sm font-medium leading-tight">Grabfood Product</p>
                                        <Switch 
                                            v-model="formDataMapping['Grabfood Product'] as boolean" 
                                            :checked="formDataMapping['Grabfood Product'] as boolean"
                                            @update:checked="handleChangeBoolean('Grabfood Product')"                  
                                        />
                                    </div>
                                </div>

                                <div class="flex flex-col justify-center items-star">
                                    <div class="flex items-center justify-between w-full">
                                        <p class="text-gray-600 text-sm font-medium leading-tight">Shopeefood Product</p>
                                        <Switch 
                                            v-model="formDataMapping['Shopeefood Product'] as boolean" 
                                            :checked="formDataMapping['Shopeefood Product'] as boolean"
                                            @update:checked="handleChangeBoolean('Shopeefood Product')"                  
                                        />
                                    </div>
                                </div>

                                <!-- Grabfood Price -->
                            <transition name="fade">
                                <div v-if="formDataMapping['Grabfood Product'] as boolean" class="w-full mt-3 flex flex-col items-end">
                                    <label for="grabfood-price" class="block text-xs font-medium text-green-700 mb-1 ml-2">Grabfood Price</label>
                                    <div class="flex items-center gap-2 w-full">
                                        <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-400 text-sm">RM</span>
                                        <input
                                            id="grabfood-price"
                                            type="number"
                                            min="0"
                                            placeholder="Enter Grabfood price..."
                                            v-model="formDataMapping['Grabfood Info'].grab_food_price as number"
                                            class="w-full rounded-r-md border border-gray-300 py-2 px-3 text-sm focus:border-green-500 focus:ring-green-500 transition outline-none bg-white disabled:bg-gray-50"
                                        />
                                    </div>
                                    <small class="text-gray-500 mt-1 ml-2">This price will be used on Grabfood integration.</small>
                                </div>
                            </transition>
                            
                            <!-- Shopeefood Price -->
                            <transition name="fade">
                                <div v-if="formDataMapping['Shopeefood Product'] as boolean" class="w-full mt-3 flex flex-col items-end">
                                    <label for="shopeefood-price" class="block text-xs font-medium text-green-700 mb-1 ml-2">Shopeefood Price</label>
                                    <div class="flex items-center gap-2 w-full">
                                        <span class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-400 text-sm">RM</span>
                                        <input
                                            id="shopeefood-price"
                                            type="number"
                                            min="0"
                                            placeholder="Enter Shopeefood price..."
                                            v-model="formDataMapping['Shopeefood Info'].shopee_food_price as number"
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
                                                <SelectItem value="kg">kg</SelectItem>
                                                <SelectItem value="g">g</SelectItem>
                                                <SelectItem value="L">L</SelectItem>
                                                <SelectItem value="ml">ml</SelectItem>
                                                <SelectItem value="cm">cm</SelectItem>
                                                <SelectItem value="m">m</SelectItem>
                                                <SelectItem value="inch">inch</SelectItem>
                                                <SelectItem value="pcs">pcs</SelectItem>
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
                            <div class="p-2.5 flex-1">
                                <!-- Content here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Save and Cancel button -->
                <div class="w-full flex flex-row justify-end gap-2">
                    <Button @click="handleCancel" class="w-[10%] rounded-lg bg-white border border-[#00A859] text-[#00A859] space-y-1 ">
                        Cancel
                    </Button>
                    <Button @click="submitForm" class="w-[10%] btn-primary">
                        Save
                    </Button>
                </div>
            </div>



        </div>

        <ModifierDialog                      
            v-if="assignModifierGroupDialog" 
            v-model="assignModifierGroupDialog" 
            :selected-modifiers="formDataMapping['Product Modifier']"
            @selected-modifiers="(modifiers) => formDataMapping['Product Modifier'] = modifiers" 
        />

        <IngredientDialog                      
            v-if="assignIngredientsDialog" 
            v-model="assignIngredientsDialog" 
            @selected-ingredients="(ingredients) => formDataMapping['Product Ingredients'] = ingredients" 
            :selectedIngredients="formDataMapping['Product Ingredients']"
        />

    </div>
    

</template>

