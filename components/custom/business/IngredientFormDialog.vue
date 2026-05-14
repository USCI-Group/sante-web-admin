<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import type { Ingredient } from '@/types/menu'
import { UnitMeasurementOptions } from '~/constants/common'
import FileInput from '~/components/custom/fileinput/fileinput.vue'

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  isLoading: boolean
  ingredient: Ingredient
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [outlet: any]
  'cancel': []
}>()

const ingredient = ref({...props.ingredient})

const imageFile = ref<File | null>(null)

const nameError = ref('')
const unitError = ref('')
const quantityError = ref('')
const pricePerUnitError = ref('')

watch(() => props.ingredient, (newIngredient) => {
  ingredient.value = {
    ...newIngredient,
  }
}, { immediate: true })

const handleSubmit = () => {
  if(!validateForm()){
    return
  }

  emit('submit', { ...ingredient.value, image_file: imageFile.value })
}

const validateForm = () => {
  // Reset errors
  nameError.value = ''
  unitError.value = ''
  quantityError.value = ''
  pricePerUnitError.value = ''

  if(!ingredient.value.name){
    nameError.value = 'Ingredient name is required'
    return false
  }

  if(!ingredient.value.unit){
    unitError.value = 'Unit is required'
    return false
  }
  if(!ingredient.value.quantity){
    quantityError.value = 'Quantity is required'
    return false
  }
  
  if(!ingredient.value.price_per_unit){
    pricePerUnitError.value = 'Price per unit is required'
    return false
  }

  return true
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>{{ mode === 'create' ? 'Create New Inventory' : 'Edit Inventory' }}</DialogTitle>
            <DialogDescription v-if="mode === 'create'">
            Create a new inventory to the business
            </DialogDescription>
            <DialogDescription v-else>
            Edit inventory details
            </DialogDescription>
        </DialogHeader>

        <!-- <h2 class="text-xl font-semibold">Ingredient Details</h2> -->

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label>Name <span class="text-red-500">*</span></Label>
              <Input
              v-model="ingredient.name"
              placeholder="Enter inventory name"
              :class="{ 'border-red-500': nameError }"
              />
              <span v-if="nameError" class="text-sm text-red-500">{{ nameError }}</span>
            </div>

            <div class="grid gap-2">
              <Label>Unit <span class="text-red-500">*</span></Label>
              <select
                v-model="ingredient.unit"
                placeholder="Select unit"
                class="w-full rounded-md border border-input px-3 py-2"
                :class="{ 'border-red-500': unitError }"
              >
                <option v-for="unit in UnitMeasurementOptions" :key="unit" :value="unit" >
                  {{ unit }}
                </option>
              </select>
              <span v-if="unitError" class="text-sm text-red-500">{{ unitError }}</span>
            </div>
          </div>
            

          <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                  <Label>Quantity <span class="text-red-500">*</span></Label>
                  <Input
                  type="number" 
                  v-model="ingredient.quantity"
                  placeholder="Enter quantity"
                  :class="{ 'border-red-500': quantityError }"
                  />
                  <span v-if="quantityError" class="text-sm text-red-500">{{ quantityError }}</span>
              </div>

              <div class="grid gap-2">
                  <Label>Price per unit <span class="text-red-500">*</span></Label>
                  <Input
                  type="number" 
                  v-model="ingredient.price_per_unit"
                  placeholder="Enter price per unit"
                  :class="{ 'border-red-500': pricePerUnitError }"
                  />
                  <span v-if="pricePerUnitError" class="text-sm text-red-500">{{ pricePerUnitError }}</span>
              </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                  <Label>Sort Order <span class="text-red-500">*</span></Label>
                  <Input
                  type="number" 
                  v-model="ingredient.sort_order"
                  placeholder="Enter sort order"
                  />
              </div>
          </div>
        </div>

        <div class="space-y-2">
            <Label>Inventory Image</Label>
            <FileInput 
                :label="'Upload Inventory Image'"
                :maxFiles="1"
                :maxSize="1024 * 1024 *2"
                :multiple="false"
                :accept="'image/*'"
                :isSubmitButton="false"
                :previewUrls="ingredient.image_url"
                @selected-files="(files: File[]) => imageFile = files[0]"
                :fullWidth="true"
            />
        </div>

        <br>
        
        <DialogFooter>
            <Button variant="outline" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
            {{ isLoading ? 'Saving...' : (mode === 'create' ? 'Create Inventory' : 'Save Changes') }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
