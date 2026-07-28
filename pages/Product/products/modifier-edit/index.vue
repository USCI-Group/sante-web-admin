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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/ProductStore'
import type { ModifierGroup, ModifierGroupOption } from '@/types/menu'
import ModifierIngredientsForm from '~/components/custom/product/ModifierIngredientsForm.vue'
import type { Ingredient } from '@/types/menu'

const { me, getMe } = useUsers()
const modifierStore = useModifierStore()
const router = useRouter()
const { toast } = useToast()
const { editModifierGroup } = useMenu()

const formData = reactive({
    ModifierGroupName: '',
    ModifierGroupExternalId: '',
    is_multiple_choice: false,
    options: [] as ModifierGroupOption[],
})

onMounted(() => {
    getMe()
    /* formData.options.push({
        id: '',
        name: '',
        price_adjustment: 0,
    }) */

    formData.ModifierGroupName = router.currentRoute.value.query.name as string || ''
    formData.ModifierGroupExternalId = modifierStore.modifier?.external_id || ''
    formData.is_multiple_choice = router.currentRoute.value.query.input_type === 'checkbox' ? true : false
    formData.options = modifierStore.modifier?.modifier_options || []
})

const handleEditModifierGroup = async () => {
    try {
        const modifierGroup: ModifierGroup = {
            id: router.currentRoute.value.query.id?.toString() || '',
            business_id: me.value?.business_id || '',
            name: formData.ModifierGroupName,
            external_id: formData.ModifierGroupExternalId.trim() || undefined,
            input_type: formData.is_multiple_choice ? 'checkbox' : 'radio',
            created_at: undefined,
            updated_at: undefined,
            modifier_options: formData.options.map(option => ({
                id: option.id || undefined,
                external_id: option.external_id?.trim() || undefined,
                name: option.name,
                price_adjustment: option.price_adjustment,
                sort_order: option.sort_order,
                is_active: option.is_active,
                ingredient_mappings: option.ingredient_mappings
            }))
        }
        const response = await editModifierGroup(modifierGroup)
        toast({
            title: 'Modifier Group Updated',
            description: 'Modifier Group updated successfully',
            variant: 'success'
        })
        await router.push('/product/products')
    } catch (e) {
        toast({
            title: 'Error',
            description: 'Error updating modifier group',
            variant: 'destructive'
        })
    }
}

const handleCancel = () => {
    router.push('/product/products')
}

const handleAddVariant = () => {
    formData.options.push({
        id: '',
        external_id: '',
        name: '',
        price_adjustment: 0,
        sort_order: 0,
        ingredient_mappings: []
    })
}

const handleChangeIsMultipleChoice = () => {
    formData.is_multiple_choice = !formData.is_multiple_choice
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
                        <div class="flex px-2.5 py-[5px] h-[34px] w-[195px] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:shopping-bag" class="w-6 h-6" />
                            <p class="text-sm text-gray-500">Product Management</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <div class="flex px-2.5 py-[5px] h-[34px] w-[195px] bg-[#00A859] rounded-md justify-center items-center gap-2">
                            <Icon icon="heroicons:clipboard" class="w-6 h-6 text-white" />
                            <p class="text-white text-sm">Edit Modifier</p>
                        </div>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

         <!-- Header title of page -->
         <div class="flex flex-row items-center my-8 gap-4 justify-between">
            <div class="flex items-center gap-4">
                <span class="flex flex-col">
                    <h1 class="text-lg font-medium">Edit Modifier</h1>
                    <span class="text-sm text-gray-500">The process of updating or changing the configuration of an existing modifier that is linked to one or more products.</span>
                </span>
            </div>
            
        </div>

        <!-- Modifier Creation Form -->
        <div class="mt-[30px] w-full min-h-[200px] rounded-xl flex flex-col md:flex-row items-start justify-center">
            <div class="w-full md:w-[80%] max-w-[1000px] min-h-[100px] border border-[#E0E0E0] rounded-xl flex flex-col p-2.5 gap-2.5">
                <!-- modifier group name -->
                <div class="w-full h-[38px] flex flex-row items-center justify-start">
                    <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                        <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            Modifier Group name
                        </span>
                    </div>
                    <Input class="w-[60%] h-full" placeholder="Enter a Modifier Group Name" v-model="formData.ModifierGroupName" />
                </div>
                <!-- modifier group external id -->
                <div class="w-full h-[38px] flex flex-row items-center justify-start">
                    <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                        <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            Modifier Group External ID <span class="text-xs text-gray-400 font-normal ml-1">(Optional)</span>
                        </span>
                    </div>
                    <Input class="w-[60%] h-full" placeholder="e.g. MOD01" v-model="formData.ModifierGroupExternalId" />
                </div>
                <!--is multiple choice -->
                <div class="w-full h-[38px] flex flex-row items-center justify-start">
                    <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                        <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            Is Multiple Choice
                        </span>
                    </div>
                    <Switch 
                        v-model="formData.is_multiple_choice" 
                        :checked="formData.is_multiple_choice"
                        @update:checked="handleChangeIsMultipleChoice"                  
                    />
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
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Option Name
                            </span>
                        </div>
                        <Input class="w-[60%] h-full" placeholder="Enter a option name" v-model="option.name" />
                    </div>
                    <!-- option external id -->
                    <div class="w-full h-[38px] flex flex-row items-center justify-start">
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Option External ID <span class="text-xs text-gray-400 font-normal ml-1">(Optional)</span>
                            </span>
                        </div>
                        <Input class="w-[60%] h-full" placeholder="e.g. OPT01" v-model="option.external_id" />
                    </div>
                    <!-- option price adjustment -->
                    <div class="w-full h-[38px] flex flex-row items-center justify-start">
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Price Adjustment
                            </span>
                        </div>
                        <div class="w-[60%] flex rounded-lg border overflow-hidden">
                            <span class="flex items-center justify-center bg-gray-50 px-4 border-r">RM</span>
                            <input 
                                type="number" 
                                placeholder="Enter a price..." 
                                class="flex-1 px-3 py-2 focus:outline-none"
                                v-model="option.price_adjustment"
                            />
                        </div>
                    </div>

                    <div class="w-full h-[38px] flex flex-row items-center justify-start">
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Sort Order
                            </span>
                        </div>
                        <div class="w-[60%] flex rounded-lg border overflow-hidden">
                            <input 
                                type="number" 
                                placeholder="Enter a sort order..." 
                                class="flex-1 px-3 py-2 focus:outline-none"
                                v-model="option.sort_order"
                            />
                        </div>
                    </div>

                    <!-- Status toggle -->
                    <div class="w-full h-[38px] flex flex-row items-center justify-start">
                        <div class="w-[40%] h-[100%] pr-[24px] flex items-start justify-start">
                            <span class="text-gray-600 text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                Status
                            </span>
                        </div>
                        <div class="w-[60%] flex items-center">
                            <label class="inline-flex items-center cursor-pointer">
                                <Switch 
                                    v-model="option.is_active" 
                                    :checked="option.is_active"
                                    @update:checked="option.is_active = !option.is_active"                  
                                />
                                <span class="ml-3 text-sm font-medium flex items-center">
                                    <span
                                        class="inline-block w-3 h-3 rounded-full mr-2"
                                        :class="option.is_active ? 'bg-green-500' : 'bg-yellow-400'"
                                    ></span>
                                    <span :class="option.is_active ? 'text-green-600' : 'text-yellow-600'">
                                        {{ option.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <ModifierIngredientsForm :modifier_option="option" />
                    
                </div> 

                <!-- add option button -->
                <Button @click="handleAddVariant" class="w-full h-[38px] flex flex-row items-center justify-center bg-white text-[#D8623D] border border-[#4ADE80] text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                    <Icon icon="heroicons:plus" class="w-5 h-5" />
                    Add Variant
                </Button>

                <!-- add modifier group button -->
                 <div class="w-full h-[38px] flex flex-row items-center justify-end gap-2">
                    <Button @click="handleCancel" class="px-3 py-2 w-[76px] h-[34px] flex flex-row items-center justify-center bg-white text-[#414651] text-sm font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis rounded-lg shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(10,13,18,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(10,13,18,0.18)] outline outline-2 outline-offset-[-2px] outline-white/10">
                        Cancel
                    </Button>
                    <Button @click="handleEditModifierGroup" class="btn-primary">
                        Save
                    </Button>
                 </div>
            </div>

            
        </div>

    </div>
    
</template>