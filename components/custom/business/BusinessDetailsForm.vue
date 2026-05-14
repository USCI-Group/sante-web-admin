<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Business } from '@/types/business'
import { MalaysianStates } from '@/constants/states'
import FileInput from '~/components/custom/fileinput/fileinput.vue'

const props = defineProps<{
    mode?: 'create' | 'edit'
    isLoading: boolean
    business: Business
}>()

const emit = defineEmits(['submit', 'cancel'])

const logoFiles = ref<File[]>([])
const business = ref({...props.business,
    address: {
        street_line1: props.business?.address?.street_line1,
        street_line2: props.business?.address?.street_line2,
        street_line3: props.business?.address?.street_line3,
        city: props.business?.address?.city,
        state: props.business?.address?.state,
        postal_code: props.business?.address?.postal_code,
        country: props.business?.address?.country
    }
})

const emailError = ref('')
const nameError = ref('')
const phoneError = ref('')
const registrationNoError = ref('')
const websiteError = ref('')
const streetLine1Error = ref('')
const cityError = ref('')
const stateError = ref('')
const postalCodeError = ref('')
const countryError = ref('')

const handleSubmit = () => {
    // Reset errors
    emailError.value = ''
    nameError.value = ''
    phoneError.value = ''
    registrationNoError.value = ''
    websiteError.value = ''

    // Validate
    if (!business.value.name) {
        nameError.value = 'Company Name is required'
        return
    }
    
    if (!business.value.email) {
        emailError.value = 'Email is required'
        return
    }
    
    if (!business.value.registration_number) {
        registrationNoError.value = "Company's Registration Number is required"
        return
    }
    
    if (!business.value.phone) {
        phoneError.value = 'Phone is required'
        return
    }
    
    if (!business.value.website) {  
        websiteError.value = 'Website is required'
        return
    }

    if (!business.value.address.street_line1) {
        streetLine1Error.value = 'Address Line 1 is required'
        return
    }

    if (!business.value.address.city) {
        cityError.value = 'City is required'
        return
    }

    if (!business.value.address.state) {    
        stateError.value = 'State is required'
        return
    }

    if (!business.value.address.postal_code) {
        postalCodeError.value = 'Postal Code is required'
        return
    }

    if (!business.value.address.country) {
        countryError.value = 'Country is required'
        return
    }

    emit('submit', {
        ...business.value,
        logo_file: logoFiles.value[0]
    })
}

onMounted(async () => {
})

watch(() => props.business, async (newBusiness) => {
  if (newBusiness) {
    business.value = newBusiness
    business.value.address = {
        street_line1: newBusiness?.address?.street_line1,
        street_line2: newBusiness?.address?.street_line2,
        street_line3: newBusiness?.address?.street_line3,
        city: newBusiness?.address?.city,
        state: newBusiness?.address?.state,
        postal_code: newBusiness?.address?.postal_code,
        country: newBusiness?.address?.country
    }
  }
}, { immediate: true })

</script>

<template>
    <div>
        <h2 class="text-xl font-semibold">Company Details</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <Label>Company Name <span class="text-red-500">*</span></Label>
                    <Input v-model="business.name" type="text" :class="{ 'border-red-500': nameError }" />
                    <span v-if="nameError" class="text-sm text-red-500">{{ nameError }}</span>
                </div>
    
                <div class="space-y-2">
                    <Label>Email <span class="text-red-500">*</span></Label>
                    <Input v-model="business.email" :class="{ 'border-red-500': emailError }" />
                    <span v-if="emailError" class="text-sm text-red-500">{{ emailError }}</span>
                </div>
                
                <div class="space-y-2">
                    <Label>SSM No. <span class="text-red-500">*</span></Label>
                    <Input v-model="business.registration_number" type="text" :class="{ 'border-red-500': registrationNoError }" :disabled="props.mode === 'edit'" placeholder="Please enter new SSM No."/>
                    <span v-if="registrationNoError" class="text-sm text-red-500">{{ registrationNoError }}</span>
                </div>
                
                <div class="space-y-2">
                    <Label>Phone <span class="text-red-500">*</span></Label>
                    <Input v-model="business.phone" :class="{ 'border-red-500': phoneError }" />
                    <span v-if="phoneError" class="text-sm text-red-500">{{ phoneError }}</span>
                </div>
    
                <div class="space-y-2">
                    <Label>Website <span class="text-red-500">*</span></Label>
                    <Input v-model="business.website" :class="{ 'border-red-500': websiteError }" />
                    <span v-if="websiteError" class="text-sm text-red-500">{{ websiteError }}</span>
                </div>
            </div>
    
            <br>
            <hr>
            <h2 class="text-xl font-semibold">Company Address</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <Label>Address Line 1 <span class="text-red-500">*</span></Label>
                    <Input v-model="business.address.street_line1" :class="{ 'border-red-500': streetLine1Error }" />
                    <span v-if="streetLine1Error" class="text-sm text-red-500">{{ streetLine1Error }}</span>
                </div>
    
                <div class="space-y-2">
                    <Label>Address Line 2</Label>
                    <Input v-model="business.address.street_line2" />
                </div>
    
                <div class="space-y-2">
                    <Label>Address Line 3</Label>
                    <Input v-model="business.address.street_line3" />
                </div>
    
                <div class="space-y-2">
                    <Label>City <span class="text-red-500">*</span></Label>
                    <Input v-model="business.address.city" :class="{ 'border-red-500': cityError }" />
                    <span v-if="cityError" class="text-sm text-red-500">{{ cityError }}</span>
                </div>
    
                <div class="space-y-2">
                    <Label>State <span class="text-red-500">*</span></Label>
                    <Select v-model="business.address.state" :class="{ 'border-red-500': stateError }">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem v-for="state in MalaysianStates" :key="state.Code" :value="state.State">
                                {{ state.State }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <span v-if="cityError" class="text-sm text-red-500">{{ cityError }}</span>
                </div>
    
                <div class="space-y-2">
                    <Label>Postal Code <span class="text-red-500">*</span></Label>
                    <Input v-model="business.address.postal_code" :class="{ 'border-red-500': postalCodeError }" />
                    <span v-if="postalCodeError" class="text-sm text-red-500">{{ postalCodeError }}</span>
                </div>
    
                <div class="space-y-2">
                    <Label>Country <span class="text-red-500">*</span></Label>
                    <Input v-model="business.address.country" :class="{ 'border-red-500': countryError }" />
                    <span v-if="countryError" class="text-sm text-red-500">{{ countryError }}</span>
                </div>
            </div>
    
            <br>
            <!-- <div class="space-y-2">
                <Label>Company Logo</Label>
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
                            @change="(e: any) => logoFile = e.target.files[0]"
                            class="hidden"
                        />
                    </label>
                </div>
            </div> -->
            <div>
                <Label>Company Logo</Label>
                <FileInput 
                    :label="'Upload Company Logo'"
                    :maxFiles="1"
                    :maxSize="1024 * 1024 *4"
                    :multiple="false"
                    :accept="'image/*'"
                    :isSubmitButton="false"
                    :previewUrls="business.logo_url"
                    @selected-files="(files: File[]) => logoFiles = files"
                    :fullWidth="true"
                />
            </div>
    
            <div class="flex justify-end gap-4">
                <Button type="button" variant="outline" @click="emit('cancel')" :disabled="props.isLoading">
                    Cancel
                </Button>
                <Button type="submit" :disabled="props.isLoading" class="btn-primary">
                    <Icon v-if="props.isLoading" icon="eos-icons:loading" class="mr-2" />
                    {{ props.mode === 'edit' ? 'Update' : 'Create' }} Business
                </Button>
            </div>
        </form>
    </div>

    
</template>
