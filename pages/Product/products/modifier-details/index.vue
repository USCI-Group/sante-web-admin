<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useToast } from '~/components/ui/toast/use-toast'
import { h, ref, onMounted } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CustomEnhancedDataTable from '~/components/custom/CustomEnhancedDataTable.vue'
import { Icon } from '@iconify/vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { useMenu} from '@/composables/useMenu'
import type { Product, Menu } from '@/types/menu'

import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/ProductStore'
import type { ModifierGroup, ModifierGroupOption } from '@/types/menu'
import { useModifierStore } from '@/stores/ModifierStore'

//const {createModifierGroup} = useMenu()
const { getMe, checkPermission } = useUsers()
const productStore = useProductStore()
const router = useRouter()
const { toast } = useToast()
const { createModifierGroup } = useMenu()
const modifierStore = useModifierStore()

const formData = ref({
    ModifierGroupName: modifierStore.modifier?.name,
    options: modifierStore.modifier?.modifier_options
})

onMounted(() => {
    getMe()
})

const editModifier = () => {
    router.push({ 
        path: '/product/products/modifier-edit',
        query: {
            id: modifierStore.modifier?.id,
            name: modifierStore.modifier?.name,
            input_type: modifierStore.modifier?.input_type,
        }
    })
}

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
                            <p class="text-white text-sm">Modifier Details</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

         <!-- Header title of page -->
         <div class="flex flex-row items-center my-8 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <span class="flex flex-col">
                    <h1 class="text-lg font-medium">Modifier Details</h1>
                    <span class="text-sm text-gray-500">Specific attributes and configuration of a product modifier used to customize or personalize a base item.</span>
                </span>
            </div>
            
        </div>

        <div class="w-full rounded-xl flex flex-col md:flex-row items-start justify-center">
            <div class="w-full md:w-[80%] max-w-[1000px] flex flex-col p-2.5 gap-2.5 items-end">
                <Button v-if="checkPermission('create_product')" variant="outline" class="bg-[#00A859] text-white" @click="editModifier">
                    <Icon icon="heroicons:pencil" class="w-4 h-4" />
                    Edit
                </Button>
            </div>
        </div>

        <!-- Modifier Creation Form -->
        <div class="w-full min-h-[200px] rounded-xl flex flex-col md:flex-row items-start justify-center">
            <div class="w-full md:w-[80%] max-w-[1000px] min-h-[100px] border border-[#E0E0E0] rounded-xl flex flex-col p-2.5 gap-2.5">
                <!-- modifier group name -->
                <div class="w-full h-[38px] flex flex-row items-center justify-start">
                    <div class="w-[40%] h-[100%] pr-[24px] flex items-center justify-start">
                        <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            Modifier Group name
                        </span>
                    </div>
                    <div class="w-[40%] h-[100%] pr-[24px] flex items-center justify-start">
                        <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            {{ modifierStore.modifier?.name }}
                        </span>
                    </div>
                </div>
                <!--is multiple choice -->
                <div class="w-full h-[38px] flex flex-row items-center justify-start">
                    <div class="w-[40%] h-[100%] pr-[24px] flex items-center justify-start">
                        <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            Is Multiple Choice
                        </span>
                    </div>
                    <div class="w-[60%] h-[100%] pr-[24px] flex items-center justify-start">
                        <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            {{ modifierStore.modifier?.input_type === 'checkbox' ? 'Yes' : 'No' }}
                        </span>
                    </div>

                </div>
                <!-- modifier group options -->
                <div v-for="(option, index) in formData.options" :key="option.id" class="bg-[#FDFDFD] w-full min-h-[50px] flex flex-col items-start justify-start border border-[#E0E0E0] rounded-lg p-2.5 gap-2.5">
                    <!-- option index  -->
                    <div class="w-[20%] h-[38px] inline-flex flex-row items-center justify-center bg-[#FDF5EF] border border-[#F5CBB3] rounded-lg ">
                        <span class="text-[#AE3120] text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            Option {{ index + 1 }}
                        </span>
                    </div>
                    <!-- option name -->
                    <div class="w-full h-[38px] flex flex-row items-center justify-start">
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-center justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Option Name
                            </span>
                        </div>
                        <div class="w-[60%] h-[100%] pr-[24px] flex items-center justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                {{ option.name }}
                            </span>
                        </div>
                    </div>
                    <!-- option price adjustment -->
                    <div class="w-full h-[38px] flex flex-row items-center justify-start">
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-center justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Price Adjustment
                            </span>
                        </div>
                        <div class="w-[60%] h-[100%] pr-[24px] flex items-center justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                RM {{ option.price_adjustment }}
                            </span>
                        </div>
                    </div>

                    <!-- status -->
                    <div class="w-full h-[38px] flex flex-row items-center justify-start">
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-center justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Status
                            </span>
                        </div>
                        <div class="w-[60%] h-[100%] pr-[24px] flex items-center justify-start">
                            <span
                                class="inline-block w-3 h-3 rounded-full mr-2"
                                :class="option.is_active ? 'bg-green-500' : 'bg-yellow-400'"
                            ></span>
                            <span :class="option.is_active ? 'text-green-600' : 'text-yellow-600'">
                                {{ option.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                    </div>

                    <!-- modifier ingredients -->
                    <div class="w-full sm:min-h-[98px] md:min-h-[118px] flex flex-col pl-2.5">
                        <!-- title -->
                        <div class="w-full h-[30%] flex justify-start items-center pt-2.5 pb-2.5 pr-2.5">
                            <p class="sm:text-base font-medium leading-tight">Ingredients</p>
                        </div>

                        <!-- ingredients list -->
                        <div class="w-full h-[70%] grid grid-cols-2">
                            <div v-for="(mapping, index) in option.ingredient_mappings" :key="index" class="w-full h-full flex justify-start items-center gap-2.5">
                                <div class="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div class="w-full h-full flex justify-start items-start">
                                    <span class="text-[#181D27] text-xs sm:text-base font-normal leading-loose">{{ mapping?.ingredient?.name }} : </span>
                                    <span class="text-[#181D27] text-sm sm:text-base font-medium leading-tight ml-1"> {{ mapping?.quantity }} {{ mapping?.unit }}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                </div> 

            </div>

            
        </div>
        


    </div>
    
</template>