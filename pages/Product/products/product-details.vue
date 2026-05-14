<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useToast } from '~/components/ui/toast/use-toast'
import { h, ref, onMounted, watch, computed } from 'vue'
import CustomEnhancedDataTable from '~/components/custom/CustomEnhancedDataTable.vue'
import { Label } from '@/components/ui/label'
import type { ColumnDef } from '@tanstack/vue-table'
import { useMenu } from '@/composables/useMenu'
import type { Product, Menu } from '@/types/menu'
import { Icon } from '@iconify/vue'
import { useProductStore } from '@/stores/ProductStore'

const { toast } = useToast()

const props =defineProps<{
    modelValue: boolean
    product?: Product
}>()

const productStore = useProductStore()

// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:product', value: Product): void
}>()

// Create a computed property for the dialog state
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

onMounted(async () => {

})

</script>


<template>
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
        <DialogContent class="min-w-[50%]">
            <DialogHeader>
                <div class="flex justify-start items-center space-x-3">
                    <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                        <Icon icon="heroicons:flag" class="w-6 h-6" />
                    </div>
                    <div class="flex flex-col justify-center items-start">
                        <DialogTitle class="text-2xl font-bold">Product Details</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">Information about the product</DialogDescription>
                    </div>
                </div>
                
            </DialogHeader>
            <div>
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <h2 class="text-xl font-semibold">Product Details</h2>
                        </div>
                        <!-- <div class="flex items-center gap-2">
                            <Button variant="outline" @click="handleEditProduct">
                                <Icon icon="heroicons:pencil-square" class="w-5 h-5 mr-2" />
                                Edit
                            </Button>
                            <Button variant="destructive" @click="openDeleteProductDialog">
                                <Icon icon="heroicons:trash" class="w-5 h-5 mr-2" />
                                Delete
                            </Button>
                        </div> -->
                    </div>
                    
                    <div class="grid grid-cols-[200px_1fr] overflow-hidden">
                        <!-- <div class="bg-gray-50 p-4 font-semibold text-gray-500">Product Image</div>
                        <div class="p-4 text-gray-600">
                            <img v-if="editBusinessDialogData.business?.logo_url" :src="editBusinessDialogData.business.logo_url" alt="Company Logo" class="h-20 w-20 object-contain">
                            <div v-else class="h-20 w-20 bg-gray-100 flex items-center justify-center rounded">
                                <Icon icon="heroicons:building-office-2" class="w-10 h-10 text-gray-400" />
                            </div>
                        </div> -->
        
                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Product Name</div>
                        <div class="p-4 border-t">{{ productStore.product?.name }}</div>
        
                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Description</div>
                        <div class="p-4 border-t">{{ productStore.product?.description }}</div>

                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Product Cost</div>
                        <div class="p-4 border-t">RM{{ productStore.product?.cost }}</div>

                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Product Base Price</div>
                        <div class="p-4 border-t">RM{{ productStore.product?.base_price }}</div>

                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Product Selling Price</div>
                        <div class="p-4 border-t">RM{{ productStore.product?.price }}</div>
        
                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Categories</div>
                        <div class="p-4 border-t">
                            {{ productStore.product?.product_category.map((c: any) => c.name).join(', ') }}
                        </div>
                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Sub Categories</div>
                        <div class="p-4 border-t">
                            {{ productStore.product?.product_sub_category.map((c: any) => c.name).join(', ') }}
                        </div>
                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Customisation Group</div>
                        <div class="p-4 border-t">
                            {{ productStore.product?.customization_groups.map((c: any) => c.name).join(', ') }}
                        </div>
                        <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Customisation Group Options</div>
                        <div class="p-4 border-t">
                            {{ productStore.product?.customization_groups.map((c: any) => c.options.map((o: any) => o.name).join(', ')).join(', ') }}
                        </div>
                    </div>
                </div>
            </div>
            
        </DialogContent>

        


    </Dialog>





</template>