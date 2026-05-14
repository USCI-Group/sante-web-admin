<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { useMenu } from '@/composables/useMenu'
import TagsCombobox from '~/components/custom/tags/TagsCombobox.vue'
import type { ProductSubCategory } from '@/types/menu'
import { useToast } from '~/components/ui/toast/use-toast'
import { Label } from '@/components/ui/label'

const { addSubCategory } = useMenu()
const { toast } = useToast()
const { myProfile } = useMyProfileStore()
// Define props with modelValue for v-model support
const props = defineProps<{
  modelValue: boolean
}>()

// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// Create a computed property for the dialog state
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = reactive({
    name: '',
    description: '',
    business_id: '',
})

const validationSchema = {
    name : {
        condition: () => formData.name.trim() === '',
        message: 'Please enter a product name'
    },
    description: {
        condition: () => formData.description.trim() === '',
        message: 'Please enter a product description'
    },

}

const submitForm = async() => {
    formData.business_id = myProfile?.business_id ?? ''
    // validate formData
    const errors = Object.entries(validationSchema)
    .filter(([_, { condition }]) => condition())
    .map(([_, { message }]) => message)
    
    if (errors.length > 0) {
        toast({
            title: 'Validation Errors',
            description: errors.join('\n'),
            variant: 'destructive'
        })
        return
    }
    // convert formData to Category type
    const subCategory : ProductSubCategory = {
        id: '',
        name: formData.name.trim(),
        description: formData.description.trim(),
        business_id: formData.business_id
    }
    try {
        const response = await addSubCategory(subCategory)
        toast({
            title: 'Sub Category Added',
            description: 'Sub Category added successfully',
            variant: 'success'
        })
        dialogOpen.value = false
    } catch (error) {
        toast({
            title: 'Failed to add sub category',
            description: 'Please try again',
            variant: 'destructive'
        })
    }
}
</script>

<template>
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
        <DialogContent>
            <DialogHeader>
                <div class="flex justify-start items-center space-x-3">
                    <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                        <Icon icon="heroicons:flag" class="w-6 h-6" />
                    </div>
                    <div class="flex flex-col justify-center items-start">
                        <DialogTitle class="text-2xl font-bold">Add Product Sub Category</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">Add a new sub category to the business</DialogDescription>
                    </div>
                </div>
                
            </DialogHeader>
            <div class="flex flex-col h-full w-full space-y-5">
                <!-- title of dialog-->
                <div>
                    <h2 class="text-xl font-semibold">Sub Category Details</h2>
                </div>
                <!-- form -->
                <div>
                    <Label>Product Sub Category Name</Label>
                    <Input v-model="formData.name" class="w-full" />
                </div>
                <div>
                    <Label>Product Sub Category Description</Label>
                    <Input v-model="formData.description" class="w-full" />
                </div>
                <!-- Submit button -->
                <DialogFooter >
                    <Button @click="submitForm" class="hover:bg-red-500" >Add Sub Category</Button>
                </DialogFooter>
            </div>
            
        </DialogContent>
    </Dialog>
</template>

