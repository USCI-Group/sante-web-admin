<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useToast } from '~/components/ui/toast/use-toast'
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useMenu } from '@/composables/useMenu'
import type { Product } from '@/types/menu'
import { useProductStore } from '@/stores/ProductStore'
import { useDateFormat } from '@vueuse/core'
import type { Ingredient } from '@/types/ingredient'
import { useRouter } from 'vue-router'

const router = useRouter()
const { myProfile, checkPermission } = useMyProfileStore()

const productStore = useProductStore()
const { toast } = useToast()

const props =defineProps<{}>()

// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:product', value: Product): void
}>()

const editProduct = () => {
    router.push({
        path: '/product/products/product-edit',
        query: {
            id: productStore.product?.id
        }
    })
    
}

const ingredients = ref<Ingredient[]>([
    {
        id: '1',
        name: 'Milk',
        small_scale_unit: 'kg',
        small_scale_quantity: 1.5
    },
    {
        id: '2',
        name: 'Wheat',
        small_scale_unit: 'kg',
        small_scale_quantity: 11.78
    },
    {
        id: '3',
        name: 'Eggs',
        small_scale_unit: 'kg',
        small_scale_quantity: 12.0
    },
    {
        id: '4',
        name: 'Soy',
        small_scale_unit: 'kg',
        small_scale_quantity: 7.8
    },
    {
        id: '5',
        name: 'Peanuts',
        small_scale_unit: 'kg',
        small_scale_quantity: 12.0
    },
    {
        id: '6',
        name: 'Tree Nuts',
        small_scale_unit: 'kg',
        small_scale_quantity: 7.8
    },
    
    
])

onMounted(async () => {
})

</script>


<template>
    <div class="w-full h-full p-6">
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
                        <NuxtLink to="/product/products">
                            <div class="flex px-2.5 py-[5px] h-[34px] w-fit rounded-md justify-center items-center gap-2">
                                <Icon icon="heroicons:shopping-bag" class="w-6 h-6" />
                                <p class="text-sm text-gray-500">Product Management</p>
                            </div>
                        </NuxtLink>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] w-[195px] bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:document" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Product Details</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

         <!-- Header title of page -->
         <div class="flex flex-row items-center my-8 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <span class="flex flex-col">
                    <h1 class="text-lg font-medium">Product Details</h1>
                    <span class="text-sm text-gray-500">View your clients and the businesses they represent. Easily track and manage the list for seamless organisation.</span>
                </span>
            </div>
            
        </div>

        <!--Producct Details box -->
        <div class="p-6 grid grid-cols-[2fr_3fr] gap-6 w-full bg-white rounded-xl border border-[#E5E5E5] min-h-[600px]">
            <!-- Product Image only for now-->
            <div class="w-full h-full flex flex-col">
                <!-- Product Image -->
                <div class="w-full h-[50%] bg-[#FAFAFA] flex justify-center items-center">
                    <img :src="productStore.product?.image_url" class="w-full h-full object-cover rounded-xl" />

                </div>
                

            </div>
            <!-- Product Details -->
            <div class="w-full h-full flex-col space-y-3.5"> 

                <!-- header of product details -->
                <div class="w-full max-h-[100px] grid grid-cols-[9fr_1fr]">
                    
                    <div class="w-full h-full grid grid-rows-[2fr_1fr]">
                        <!-- Product Name -->
                        <div class="pl-2.5 w-full flex justify-start items-center">
                            <p class="text-2xl font-medium text-[#181D27] leading-loose">
                                {{ productStore.product?.name }}
                            </p>

                        </div>
                        <!-- Created by -->
                        <div class="pl-2.5 w-full flex justify-start items-center">
                            <span class="text-[#A4A7AE] text-base font-normal leading-tight">Created at :</span>
                            <span class="text-[#181D27] text-base font-medium leading-tight">
                                {{ useDateFormat(productStore.product?.created_at, 'd MMM YYYY') }}
                            </span>
                        </div>

                    </div>
                    <!-- edit button only -->
                    <div class="w-full h-full flex justify-end items-top">
                        <Button v-if="checkPermission('update_product')" class="w-[20px] h-[30px]  bg-[#FFF4ED]  rounded-md " @click="editProduct">
                            <Icon icon="heroicons:pencil" class="w-4 h-4 text-[#FF4405]" />
                        </Button>
                    </div>

                </div>

                <!-- product cost, sell, category -->
                <div class="w-full sm:h-[46px] md:h-[56px] flex justify-between items-center gap-[5px]">
                    <!-- product cost -->
                    <div class="w-full h-full bg-white grid grid-cols-[1fr_3fr] border border-[#E5E5E5] rounded-md">
                        <!-- icon -->
                        <div class="w-full h-full flex justify-center items-center">
                            <Icon icon="heroicons:currency-dollar" class="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4405]" />
                        </div>
                        <!-- product cost -->
                        <div class="w-full h-full flex flex-col justify-center items-start">
                            <p class="text-sm sm:text-base text-gray-500">Cost</p>
                            <p class="text-sm sm:text-base text-gray-500">
                                {{ productStore.product?.cost }}
                            </p>
                        </div>
                    </div>
                    <!-- product selling price -->
                    <div class="w-full h-full bg-white grid grid-cols-[1fr_2fr] border border-[#E5E5E5] rounded-md">
                        <!-- icon -->
                        <div class="w-full h-full flex justify-center items-center">
                            <Icon icon="heroicons:currency-dollar" class="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4405]" />
                        </div>
                        <!-- product cost -->
                        <div class="w-full h-full flex flex-col justify-center items-start">
                            <p class="text-sm sm:text-base text-gray-500">Sell</p>
                            <p class="text-sm sm:text-base text-gray-500">
                                {{ productStore.product?.price }}
                            </p>
                        </div>
                    </div>
                    <!-- product category -->
                    <div class="w-full h-full bg-white grid grid-cols-[1fr_2fr] border border-[#E5E5E5] rounded-md">
                        <!-- icon -->
                        <div class="w-full h-full flex justify-center items-center">
                            <Icon icon="heroicons:tag" class="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4405]" />
                        </div>
                        <!-- product cost -->
                        <div class="w-full h-full flex flex-col justify-center items-start">
                            <p class="text-sm sm:text-base text-gray-500">Category</p>
                            <p class="text-sm sm:text-base text-gray-500">
                                {{ productStore.product?.product_category.map((cat)=> cat.name).join(', ') }}
                            </p>
                        </div>
                    </div>
                    <!-- product kcal -->
                    <div class="w-full h-full bg-white grid grid-cols-[1fr_2fr] border border-[#E5E5E5] rounded-md">
                        <!-- icon -->
                        <div class="w-full h-full flex justify-center items-center">
                            <Icon icon="heroicons:fire" class="w-4 h-4 sm:w-5 sm:h-5 text-[#FF4405]" />
                        </div>
                        <!-- product kcal -->
                        <div class="w-full h-full flex flex-col justify-center items-start">
                            <p class="text-sm sm:text-base text-gray-500">Kcal</p>
                            <p class="text-sm sm:text-base text-gray-500">
                                {{ productStore.product?.kcal ?? '0' }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- TODO : product related items -->

                <!-- product Ingredients -->
                <div class="w-full sm:min-h-[98px] md:min-h-[118px] flex flex-col pl-2.5">
                    <!-- title -->
                    <div class="w-full h-[30%] flex justify-start items-center pt-2.5 pb-2.5 pr-2.5">
                        <p class="sm:text-base font-medium leading-tight">Product Ingredients</p>
                    </div>

                    <!-- ingredients list -->
                    <div class="w-full h-[70%] grid grid-cols-2">
                        <div v-for="(ingredient, index) in productStore.product?.ingredients" :key="index" class="w-full h-full flex justify-start items-center gap-2.5">
                            <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div class="w-full h-full flex justify-start items-start">
                                
                                <span class="text-[#181D27] text-xs sm:text-base font-normal leading-loose">{{ ingredient.name }} : </span>
                                <span class="text-[#181D27] text-sm sm:text-base font-medium leading-tight"> {{ ingredient.quantity }} {{ ingredient.unit }}</span>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- product description -->
                <div class="w-full sm:h-[52px] md:h-[62px] flex flex-col pl-2.5">
                    <p class="text-[#181D27] text-base sm:text-base font-medium leading-tight text-ellipsis overflow-hidden line-clamp-1">Product Description</p>
                    <p class="text-[#181D27] text-xs sm:text-xs font-normal leading-none text-ellipsis overflow-hidden line-clamp-2">{{ productStore.product?.description }}</p>
                </div>

                <div class="w-full sm:h-[52px] md:h-[62px] flex flex-col pl-2.5">
                    <p class="text-[#181D27] text-base sm:text-base font-medium leading-tight text-ellipsis overflow-hidden line-clamp-1">Status</p>
                    <div>
                        <div class="flex items-center">
                          <span
                            class="inline-block w-3 h-3 rounded-full mr-2"
                            :class="productStore.product?.is_active ? 'bg-green-500' : 'bg-yellow-400'"
                          ></span>
                          <span
                            class="capitalize text-base font-medium"
                            :class="productStore.product?.is_active ? 'text-green-600' : 'text-yellow-600'"
                          >
                            {{ productStore.product?.is_active ? 'Active' : 'Inactive' }}
                          </span>
                        </div>
                    </div>
                </div>

                <div class="w-full sm:h-[52px] md:h-[62px] flex flex-col pl-2.5">
                    <p class="text-[#181D27] text-base sm:text-base font-medium leading-tight text-ellipsis overflow-hidden line-clamp-1">Platform</p>
                    <div>
                        <Badge v-if="productStore.product?.is_store_outlet" variant="outline" class="capitalize px-4 py-1 mx-1 bg-green-300 text-green-800">Store Outlet</Badge>
                        <Badge v-if="productStore.product?.is_grab_food" variant="outline" class="capitalize px-4 py-1 mx-1 bg-green-300 text-green-800">Grabfood</Badge>
                        <Badge v-if="productStore.product?.is_shopee_food" variant="outline" class="capitalize px-4 py-1 mx-1 bg-green-400 text-white">Shopee Food</Badge>
                    </div>
                </div>

                <!-- product modifier -->
                <div class="w-full flex flex-col pl-2.5">
                    <div class="w-full h-[30%] flex justify-start items-center pt-2.5 pb-2.5 pr-2.5">
                        <p class="sm:text-base font-medium leading-tight">Product Modifier</p>
                    </div>
                    <div v-for="(modifier, index) in productStore.product?.modifier_groups" :key="index" class="w-full h-[70%] flex justify-start items-center flex flex-col">
                        <div class="w-full h-[30%] flex justify-start items-center">
                            <p class="text-sm sm:text-base font-medium leading-tight">{{ index + 1 }}. {{ modifier.name }} - {{ modifier.max_selection }}x</p>
                        </div>
                        <li v-for="(option, index) in modifier.modifier_options" :key="index" class="w-full h-[70%] pl-2">
                            {{ option.name }}
                        </li>


                    </div>

                </div>
                                

                
            </div>

            

        </div>

    </div>

</template>