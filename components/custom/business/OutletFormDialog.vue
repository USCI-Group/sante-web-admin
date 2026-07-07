<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ref, watch } from 'vue'
import type { Outlet } from '@/types/outlet'
import { MalaysianStates } from '@/constants/states'
import FileInput from '../fileinput/fileinput.vue'
interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  isLoading: boolean
  outlet: Outlet
}
import { Paperclip } from 'lucide-vue-next'
const { toast } = useToast()

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [outlet: any]
  'cancel': []
}>()

const outlet = ref({...props.outlet,
  address: {
    street_line1: '',
    street_line2: '',
    street_line3: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  },
  is_school_outlet: false
})
const imageFile = ref<File | null>(null)
const duitnowQrFile = ref<File | null>(null)
const nameError = ref('')
const phoneError = ref('')
const emailError = ref('')
const outletNumberError = ref('')
const streetLine1Error = ref('')
const cityError = ref('')
const stateError = ref('')
const postalCodeError = ref('')
const countryError = ref('')
const latitudeError = ref('')
const longitudeError = ref('')
watch(() => props.outlet, (newOutlet) => {
  outlet.value = {
    ...newOutlet,
    address: {
      ...newOutlet.address,
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  if(!validateForm()){
    toast({
      title: 'Error',
      description: 'Please fill in all the required fields',
      variant: 'destructive',
    })
    return
  }

  emit('submit', { ...outlet.value, image_file: imageFile.value, duitnow_qr_file: duitnowQrFile.value })
}

const validateForm = () => {
  // Reset errors
  nameError.value = ''
  phoneError.value = ''
  emailError.value = ''
  outletNumberError.value = ''
  streetLine1Error.value = ''
  cityError.value = ''
  stateError.value = ''
  postalCodeError.value = ''
  countryError.value = ''
  latitudeError.value = ''
  longitudeError.value = ''
  
  let is_error = false

  if(!outlet.value.name){
    nameError.value = 'Outlet name is required'
    is_error = true
  }

  if(!outlet.value.registration_number){
    outletNumberError.value = 'SSM no is required'
    is_error = true
  }
  if(!outlet.value.email){
    emailError.value = 'Email is required'
    is_error = true
  }
  
  if(!outlet.value.phone){
    phoneError.value = 'Phone number is required' 
    is_error = true
  }

  if(!outlet.value.address.street_line1){
    streetLine1Error.value = 'Address line 1 is required'
    is_error = true
  }

  if(!outlet.value.address.city){
    cityError.value = 'City is required'
    is_error = true
  }

  if(!outlet.value.address.state){  
    stateError.value = 'State is required'
    is_error = true
  }

  if(!outlet.value.address.postal_code){
    postalCodeError.value = 'Postal code is required'
    is_error = true
  }

  if(!outlet.value.address.country){
    countryError.value = 'Country is required'
    is_error = true
  }

  if(!outlet.value.latitude){
    latitudeError.value = 'Latitude is required'
    is_error = true
  }

  if(!outlet.value.longitude){
    longitudeError.value = 'Longitude is required'
    is_error = true
  }

  return !is_error
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
            <DialogTitle>{{ mode === 'create' ? 'Add New Outlet' : 'Edit Outlet' }}</DialogTitle>
            <DialogDescription v-if="mode === 'create'">
            Add a new outlet to the business
            </DialogDescription>
            <DialogDescription v-else>
            Edit outlet details
            </DialogDescription>
        </DialogHeader>

        <h2 class="text-xl font-semibold">Outlet Details</h2>

        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label>Outlet Name <span class="text-red-500">*</span></Label>
              <Input
              v-model="outlet.name"
              placeholder="Enter outlet name"
              :class="{ 'border-red-500': nameError }"
              />
              <span v-if="nameError" class="text-sm text-red-500">{{ nameError }}</span>
            </div>

            <div class="grid gap-2">
              <Label>SSM No <span class="text-red-500">*</span></Label>
              <Input
              v-model="outlet.registration_number"
              placeholder="Please enter new SSM No."
              :class="{ 'border-red-500': outletNumberError }"
              />
              <span v-if="outletNumberError" class="text-sm text-red-500">{{ outletNumberError }}</span>
            </div>
          </div>
            

          <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                  <Label>Phone <span class="text-red-500">*</span></Label>
                  <Input
                  v-model="outlet.phone"
                  placeholder="Enter phone number"
                  :class="{ 'border-red-500': phoneError }"
                  />
                  <span v-if="phoneError" class="text-sm text-red-500">{{ phoneError }}</span>
              </div>

              <div class="grid gap-2">
                  <Label>Email <span class="text-red-500">*</span></Label>
                  <Input
                  type="email" 
                  v-model="outlet.email"
                  placeholder="Enter email"
                  :class="{ 'border-red-500': emailError }"
                  />
                  <span v-if="emailError" class="text-sm text-red-500">{{ emailError }}</span>
              </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center space-x-2">
              <Switch id="is_school_outlet" :checked="outlet.is_school_outlet" @update:checked="(val) => outlet.is_school_outlet = val" />
              <Label for="is_school_outlet">Is School Outlet (UIS)</Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Label for="outlet_status">Status:</Label>
              <Select v-model="outlet.outlet_status">
                  <SelectTrigger class="w-[180px]">
                      <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>

          <hr>
        <h2 class="text-xl font-semibold">Outlet Address</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <Label>Address Line 1 <span class="text-red-500">*</span></Label>
                <Input v-model="outlet.address.street_line1" :class="{ 'border-red-500': streetLine1Error }" />
                <span v-if="streetLine1Error" class="text-sm text-red-500">{{ streetLine1Error }}</span>
            </div>

            <div class="space-y-2">
                <Label>Address Line 2</Label>
                <Input v-model="outlet.address.street_line2" />
            </div>

            <div class="space-y-2">
                <Label>Address Line 3</Label>
                <Input v-model="outlet.address.street_line3" />
            </div>

            <div class="space-y-2">
                <Label>City <span class="text-red-500">*</span></Label>
                <Input v-model="outlet.address.city" :class="{ 'border-red-500': cityError }" />
                <span v-if="cityError" class="text-sm text-red-500">{{ cityError }}</span>
            </div>

            <div class="space-y-2">
                <Label>State <span class="text-red-500">*</span></Label>
                <Select v-model="outlet.address.state" :class="{ 'border-red-500': stateError }">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="state in MalaysianStates" :key="state.Code" :value="state.State">
                            {{ state.State }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <span v-if="stateError" class="text-sm text-red-500">{{ stateError }}</span>
            </div>

            <div class="space-y-2">
                <Label>Postal Code <span class="text-red-500">*</span></Label>
                <Input v-model="outlet.address.postal_code" :class="{ 'border-red-500': postalCodeError }" />
                <span v-if="postalCodeError" class="text-sm text-red-500">{{ postalCodeError }}</span>
            </div>

            <div class="space-y-2">
                <Label>Country <span class="text-red-500">*</span></Label>
                <Input v-model="outlet.address.country" :class="{ 'border-red-500': countryError }" />
                <span v-if="countryError" class="text-sm text-red-500">{{ countryError }}</span>
            </div>
        </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <Label>Latitude <span class="text-red-500">*</span></Label>
                <Input v-model="outlet.latitude" type="number" :class="{ 'border-red-500': latitudeError }" />
                <span v-if="latitudeError" class="text-sm text-red-500">{{ latitudeError }}</span>
            </div>

            <div class="space-y-2">
                <Label>Longitude <span class="text-red-500">*</span></Label>
                <Input v-model="outlet.longitude" type="number" :class="{ 'border-red-500': longitudeError }" />
                <span v-if="longitudeError" class="text-sm text-red-500">{{ longitudeError }}</span>
            </div>
          </div>
        </div>
        <hr>
        <div class="space-y-2">
          <Label>Outlet Image</Label>
          <div class="flex items-center justify-center w-full">
              <label for="logo-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                      <p class="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                  <Input 
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      @change="(e: any) => imageFile = e.target.files[0]"
                      class="hidden"
                  />
              </label>
          </div>

          <div class="mt-4 space-y-2">
            <div
              v-if="outlet.image_url && outlet.image_url.length > 0 && imageFile === null"
              class="flex items-center gap-2 p-2 border rounded"
            >
              <Paperclip class="h-4 w-4 stroke-current" />
            <span class="text-sm">{{ outlet.image_url.split('/').at(-1) }}</span>
              <span class="text-xs text-gray-500 ml-auto">
                
              </span>
            </div>
            <!-- preview files only if not exists -->
            <div
              v-if="imageFile"
              class="flex items-center gap-2 p-2 border rounded"
            >
              <Paperclip class="h-4 w-4 stroke-current" />
              <span class="text-sm">{{ imageFile.name }}</span>
              <span class="text-xs text-gray-500 ml-auto">
                {{ (imageFile.size / 1024 / 1024).toFixed(2) }}MB
              </span>
              <button
                type="button"
                class="text-red-500 hover:text-red-700"
                @click="imageFile = null"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-2">
            <Label>Outlet Static Duitnow QR</Label>
            <div class="flex items-center justify-center w-full">
                <label for="duitnow_qr_file" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p class="mb-2 text-sm text-gray-500"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                        <p class="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <Input 
                        id="duitnow_qr_file"
                        type="file"
                        accept="image/*"
                        @change="(e: Event) => duitnowQrFile = (e.target as HTMLInputElement).files?.[0] ?? null"
                        class="hidden"
                    />
                </label>
            </div>

            <div class="mt-4 space-y-2">
            <div
              v-if="outlet.outlet_static_qr && outlet.outlet_static_qr.length > 0 && duitnowQrFile === null"
              class="flex items-center gap-2 p-2 border rounded"
            >
              <Paperclip class="h-4 w-4 stroke-current" />
            <span class="text-sm">{{ outlet.outlet_static_qr.split('/').at(-1) }}</span>
              <span class="text-xs text-gray-500 ml-auto">
                
              </span>
            </div>
            <!-- preview files only if not exists -->
            <div
              v-if="duitnowQrFile"
              class="flex items-center gap-2 p-2 border rounded"
            >
              <Paperclip class="h-4 w-4 stroke-current" />
              <span class="text-sm">{{ duitnowQrFile.name }}</span>
              <span class="text-xs text-gray-500 ml-auto">
                {{ (duitnowQrFile.size / 1024 / 1024).toFixed(2) }}MB
              </span>
              <button
                type="button"
                class="text-red-500 hover:text-red-700"
                @click="duitnowQrFile = null"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
            <Button variant="outline" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
            {{ isLoading ? 'Saving...' : (mode === 'create' ? 'Add Outlet' : 'Save Changes') }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
