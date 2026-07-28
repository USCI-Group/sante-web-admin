<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { useMenu } from '@/composables/useMenu'
import TagsCombobox from '~/components/custom/tags/TagsCombobox.vue'
import type { ProductCategory } from '@/types/menu'
import { useToast } from '~/components/ui/toast/use-toast'
import { Label } from '@/components/ui/label'
import FileInput from '~/components/custom/fileinput/fileinput.vue'

const { editCategoryByID, uploadCategoryImage, uploadCategoryBannerImage     } = useMenu()
const { toast } = useToast()
// Define props with modelValue for v-model support
const props = defineProps<{
  modelValue: boolean
  category: ProductCategory
}>()
const imageFile = ref<File | null>(null)
const bannerFile = ref<File | null>(null)
    
// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

// Create a computed property for the dialog state
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formData = reactive({
    name: props.category?.name || '',
    external_id: props.category?.external_id || '',
    description: props.category?.description || '',
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
    const category : ProductCategory = {
        id: props.category?.id || '',
        business_id: props.category?.business_id || '',
        external_id: formData.external_id.trim() || undefined,
        name: formData.name.trim(),
        description: formData.description.trim(),
        created_at: '',
        updated_at: '',
        deleted_at: '',
    }
    try {
        const response = await editCategoryByID(category)
        await triggerUploadCategoryImage(category.id)
        toast({
            title: 'Category Updated',
            description: 'Category updated successfully',
            variant: 'success'
        })
        emit('success')
        dialogOpen.value = false
    } catch (error: any) {
        toast({
            title: 'Error',
            description: 'Error editing category',
            variant: 'destructive'
        })
    }
    
    emit('success')
    dialogOpen.value = false
}

const triggerUploadCategoryImage = async (categoryID: string) => {
    if (imageFile.value) {
        try {
            await uploadCategoryImage(categoryID, imageFile.value)
        } catch (error: any) {
            throw error
        }
    }
    if (bannerFile.value) {
        try {
            await uploadCategoryBannerImage(categoryID, bannerFile.value)
        } catch (error: any) {
            throw error
        }
    }
    imageFile.value = null
    bannerFile.value = null
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
                        <DialogTitle class="text-2xl font-bold">Edit Product Category</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">Edit the category details</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            <!-- Make content scrollable -->
            <div class="flex flex-col h-[70vh] w-full space-y-5 overflow-y-auto px-2">
                <!-- title of dialog-->
                <div>
                    <h2 class="text-xl font-semibold">Product Category Details</h2>
                </div>
                <!-- form -->
                <div>
                    <Label>Product Category Name <span class="text-red-500">*</span></Label>
                    <Input v-model="formData.name" class="w-full" />
                </div>
                <div>
                    <Label>External ID <span class="text-xs text-gray-400 font-normal ml-1">(Optional, for POS Sync)</span></Label>
                    <Input v-model="formData.external_id" class="w-full" placeholder="e.g. DEPT01" />
                </div>
                <div>
                    <Label>Product Category Description</Label>
                    <Input v-model="formData.description" class="w-full" />
                </div>
                <div class="space-y-2">
                    <Label>Category Image</Label>
                    <FileInput 
                        :keyId="'category-image'"
                        :label="'Upload Category Image'"
                        :maxFiles="1"
                        :maxSize="1024 * 1024 *2"
                        :multiple="false"
                        :accept="'image/*'"
                        :isSubmitButton="false"
                        :previewUrls="category.image_url"
                        @selected-files="(files: File[]) => imageFile = files[0]"
                        :fullWidth="true"
                    />
                </div>
                <div class="space-y-2">
                    <Label>Category Banner Image</Label>
                    <FileInput 
                        :keyId="'category-banner'"
                        :label="'Upload Category Banner Image'"
                        :maxFiles="1"
                        :maxSize="1024 * 1024 *2"
                        :multiple="false"
                        :accept="'image/*'"
                        :isSubmitButton="false"
                        :previewUrls="category.banner_url"
                        @selected-files="(files: File[]) => bannerFile = files[0]"
                        :fullWidth="true"
                    />
                </div>
                <!-- Submit button is outside scrollable for sticky footer effect if needed -->
                <DialogFooter >
                    <Button @click="submitForm" class="hover:bg-red-500" >Save</Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
</template>

