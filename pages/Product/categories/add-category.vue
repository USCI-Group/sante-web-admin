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
import { useUsers } from '@/composables/useUsers'
import { Label } from '@/components/ui/label'
import FileInput from '~/components/custom/fileinput/fileinput.vue'

const { addCategory, uploadCategoryImage, uploadCategoryBannerImage } = useMenu()
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
const imageFile = ref<File | null>(null)
const bannerFile = ref<File | null>(null)

const validationSchema = {
    name : {
        condition: () => formData.name.trim() === '',
        message: 'Please enter a product name'
    },
    description: {
        condition: () => formData.description.trim() === '',
        message: 'Please enter a product description'
    },
    business_id: {
        condition: () => formData.business_id.trim() === '',
        message: 'User does not belong to any business'
    }

}

const submitForm = async() => {
    const business_id = myProfile?.business_id ?? ''
    formData.business_id = business_id
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
    // convert formData to Category type
    const category : ProductCategory = {
        id: '',
        business_id: formData.business_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        created_at: '',
        updated_at: '',
        deleted_at: '',
    }
    try {
        const response = await addCategory(category)
        await triggerUploadCategoryImage(response.id)
        toast({
            title: 'Category Added',
            description: 'Category added successfully',
            variant: 'success'
        })
        dialogOpen.value = false
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error?.message ?? 'Something went wrong',
            variant: 'destructive'
        })
    }
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
                        <DialogTitle class="text-2xl font-bold">Add Product Category</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">Add a new category to the menu</DialogDescription>
                    </div>
                </div>
                
            </DialogHeader>
            <div class="flex flex-col h-[70vh] w-full space-y-5 overflow-y-auto px-2">
                <!-- title of dialog-->
                <h2 class="text-xl font-semibold">Category Details</h2>
                <!-- form -->
                <div>
                    <Label>Product Category Name <span class="text-red-500">*</span></Label>
                    <Input v-model="formData.name" class="w-full" />
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
                        :previewUrls="undefined"
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
                        :previewUrls="undefined"
                        @selected-files="(files: File[]) => bannerFile = files[0]"
                        :fullWidth="true"
                    />
                </div>
                <!-- Submit button -->
                <DialogFooter >
                    <Button @click="submitForm" class="hover:bg-red-500" >Add Category</Button>
                </DialogFooter>
            </div>
            
        </DialogContent>
    </Dialog>
</template>

