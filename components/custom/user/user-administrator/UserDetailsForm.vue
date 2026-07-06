<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User } from '@/types/user'
import type { Option } from '@/types/common'
import Tooltip from '~/components/custom/Tooltip.vue'

const { getBusinessesOptions } = useBusinesses()
const { getOutletsOptions } = useOutlets()
const { getRoleOptions } = useRoles()
const { me, getMe, isSantéAdmin, checkPermission } = useUsers()

const props = defineProps<{
    mode?: 'create' | 'edit'
    isLoading: boolean
    user: User
}>()

const emit = defineEmits(['submit', 'cancel'])

const accountType = ref('')
const password = ref('')
const confirmPassword = ref('')
const roleId = ref('')

const user = ref({...props.user,
    address: {
        street_line1: props.user?.address?.street_line1,
        street_line2: props.user?.address?.street_line2,
        street_line3: props.user?.address?.street_line3,
        city: props.user?.address?.city,
        state: props.user?.address?.state,
        postal_code: props.user?.address?.postal_code,
        country: props.user?.address?.country
    }
})

const showPassword = ref(false)

const emailError = ref('')
const firstNameError = ref('')
const lastNameError = ref('')
const roleError = ref('')
const businessError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const identificationNoError = ref('')
const phoneError = ref('')
const outletError = ref('')
const accountTypeError = ref('')
const businessOptions = ref<Option[]>([])
const outletOptions = ref<Option[]>([])
const roleOptions = ref<Option[]>([])
const handleSubmit = () => {
    // Reset errors
    emailError.value = ''
    firstNameError.value = ''
    lastNameError.value = ''
    roleError.value = ''
    businessError.value = ''
    passwordError.value = ''
    confirmPasswordError.value = ''
    identificationNoError.value = ''
    phoneError.value = ''
    outletError.value = ''
    accountTypeError.value = ''
    // Validate
    if (!props.user.email) {
        emailError.value = 'Email is required'
        return
    }
    if (!props.user.first_name) {
        firstNameError.value = 'First name is required'
        return
    }
    if (!props.user.surname) {
        lastNameError.value = 'Last name is required'
        return
    }
    if (password.value !== confirmPassword.value) {
        confirmPasswordError.value = 'Passwords do not match'
        return
    }
    if (!props.user.phone) {
        phoneError.value = 'Phone is required'
        return
    }
    if (!accountType.value) {
        accountTypeError.value = 'Account type is required'
        return
    }
    if (!roleId.value) {
        roleError.value = 'Role is required'
        return
    }

    emit('submit', {
        ...props.user,
        password: password.value,
        confirm_password: confirmPassword.value,
        role_id: roleId.value
    })
}

onMounted(async () => {
    await getMe()
    await fetchBusinessOptions()
})

watch(() => props.user, async (newUser) => {
  if (newUser) {
    user.value = newUser
    roleId.value = newUser?.GroupRole?.role_id
    user.value.address = {
        street_line1: newUser?.address?.street_line1,
        street_line2: newUser?.address?.street_line2,
        street_line3: newUser?.address?.street_line3,
        city: newUser?.address?.city,
        state: newUser?.address?.state,
        postal_code: newUser?.address?.postal_code,
        country: newUser?.address?.country
    }

    if(newUser?.outlet_id){
        accountType.value = 'Outlet'
    }else if(newUser?.business_id){
        accountType.value = 'Business'
    }else{
        if(newUser?.GroupRole?.role_id){
            accountType.value = 'Santé Admin'
        }
    }
  }
}, { immediate: true })

watch(accountType, async (newAccountType) => {
    if(newAccountType === 'Outlet'){
        if(user.value.business_id){
            await fetchRoleOptions(user.value.business_id)
        }
    }
    else if(newAccountType === 'Business'){
        if(user.value.business_id){
            await fetchRoleOptions(user.value.business_id)
        } else {
            await fetchRoleOptions()
        }
    }
    else{
        user.value.business_id = ''
        user.value.outlet_id = ''
        await fetchRoleOptions()
    }

    if (!isSantéAdmin()) {
        user.value.business_id = me.value?.business_id as string
    }
})

watch(() => user.value.business_id, async (newBusinessId) => {
    if(newBusinessId){
        try {
            outletOptions.value = await getOutletsOptions(newBusinessId)
        } catch (error) {
        }
    }
    if(props.mode === 'create'){
        user.value.outlet_id = ''
    }

    await fetchRoleOptions(newBusinessId)
})

const fetchBusinessOptions = async () => {
    try {
        businessOptions.value = await getBusinessesOptions()
    } catch (error) {
    }
}
const fetchRoleOptions = async (businessId?: string | null) => {
    try {
        if(businessId){
            roleOptions.value = await getRoleOptions(businessId)
        }else{
            roleOptions.value = await getRoleOptions()
        }
    } catch (error) {
    }
}


</script>

<template>
    <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <Label>Email <span class="text-red-500">*</span></Label>
                <Input v-model="user.email" type="email" :class="{ 'border-red-500': emailError }" />
                <span v-if="emailError" class="text-sm text-red-500">{{ emailError }}</span>
            </div>

            <div class="space-y-2">
                <Label>Identification No</Label>
                <Input v-model="user.identification_no" :class="{ 'border-red-500': identificationNoError }" />
                <span v-if="identificationNoError" class="text-sm text-red-500">{{ identificationNoError }}</span>
            </div>

            <div class="space-y-2">
                <Label>First Name <span class="text-red-500">*</span></Label>
                <Input v-model="user.first_name" :class="{ 'border-red-500': firstNameError }" />
                <span v-if="firstNameError" class="text-sm text-red-500">{{ firstNameError }}</span>
            </div>

            <div class="space-y-2">
                <Label>Last Name <span class="text-red-500">*</span></Label>
                <Input v-model="user.surname" :class="{ 'border-red-500': lastNameError }" />
                <span v-if="lastNameError" class="text-sm text-red-500">{{ lastNameError }}</span>
            </div>

            <div class="space-y-2" v-if="props.mode === 'create' || checkPermission('reset_password')">
                <div class="flex">
                    <Label>Password <span class="text-red-500">*</span></Label>
                    <Tooltip text="Password must be at least 8 characters long, contain at least one uppercase letter,
                    one lowercase letter, one number, and one special character." position="top">
                        <Icon icon="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                    </Tooltip>
                </div>
                <Input v-model="password" :type="showPassword ? 'text' : 'password'" :class="{ 'border-red-500': passwordError }" />
                <span v-if="passwordError" class="text-sm text-red-500">{{ passwordError }}</span>
            </div>

            <div class="space-y-2" v-if="props.mode === 'create' || checkPermission('reset_password')">
                <div class="flex">
                    <Label>Confirm Password <span class="text-red-500">*</span></Label>
                </div>
                <div class="flex items-center">
                    <Input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" :class="{ 'border-red-500': confirmPasswordError }" />
                    <Button type="button" variant="ghost" size="sm" class="ml-2" @click="showPassword = !showPassword">
                        <Icon :icon="showPassword ? 'heroicons:eye' : 'heroicons:eye-slash'" class="w-4 h-4" />
                    </Button>
                </div>
                <span v-if="confirmPasswordError" class="text-sm text-red-500">{{ confirmPasswordError }}</span>
            </div>

            <div class="space-y-2">
                <Label>Phone <span class="text-red-500">*</span></Label>
                <Input v-model="user.phone" :class="{ 'border-red-500': phoneError }" />
                <span v-if="phoneError" class="text-sm text-red-500">{{ phoneError }}</span>
            </div>    
            
            <div class="space-y-2">
                <Label>Address Line 1</Label>
                <Input v-model="user.address.street_line1" />
            </div>

            <div class="space-y-2">
                <Label>Address Line 2</Label>
                <Input v-model="user.address.street_line2" />
            </div>

            <div class="space-y-2">
                <Label>City</Label>
                <Input v-model="user.address.city" />
            </div>

            <div class="space-y-2">
                <Label>State</Label>
                <Input v-model="user.address.state" />
            </div>

            <div class="space-y-2">
                <Label>Postal Code</Label>
                <Input v-model="user.address.postal_code" />
            </div>

            <div class="space-y-2">
                <Label>Country</Label>
                <Input v-model="user.address.country" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <Label class="text-gray-500">Account Type <span class="text-red-500">*</span></Label>
                <label v-if="isSantéAdmin()"  class="flex items-center gap-2">
                <input type="radio" v-model="accountType" value="Santé Admin" />
                    Santé Admin
                </label>

                <label class="flex items-center gap-2">
                <input type="radio" v-model="accountType" value="Business" />
                    Business <span class="text-xs text-gray-500">(Create Account on business level)</span>
                </label>

                <label class="flex items-center gap-2">
                <input type="radio" v-model="accountType" value="Outlet" />
                    Outlet <span class="text-xs text-gray-500">(Create Account on outlet level)</span>
                </label>
                <span v-if="accountTypeError" class="text-sm text-red-500">{{ accountTypeError }}</span>
            </div>
            <br>

            <div v-if="accountType === 'Business' || accountType === 'Outlet'" class="space-y-2">
                <Label>Business <span class="text-red-500">*</span></Label>
                <Select v-model="user.business_id as string">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="business in businessOptions" :key="business.id" :value="business.id">
                            {{ business.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <span v-if="businessError" class="text-sm text-red-500">{{ businessError }}</span>
            </div>

            <div v-if="accountType === 'Outlet'" class="space-y-2">
                <Label>Outlet <span class="text-red-500">*</span></Label>
                <Select v-model="props.user.outlet_id as string">
                    <SelectTrigger>
                        <SelectValue placeholder="Select an outlet" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="outlet in outletOptions" :key="outlet.id" :value="outlet.id">
                            {{ outlet.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <span v-if="outletError" class="text-sm text-red-500">{{ outletError }}</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <Label>Role <span class="text-red-500">*</span></Label>
                <Select v-model="roleId">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem v-for="role in roleOptions" :key="role.id" :value="role.id">
                            {{ role.name }}
                        </SelectItem>
                    </SelectContent>
                </Select>
                <span v-if="roleError" class="text-sm text-red-500">{{ roleError }}</span>
            </div>
        </div>

        <div class="flex justify-end gap-4">
            <Button type="button" variant="outline" @click="emit('cancel')" :disabled="props.isLoading">
                Cancel
            </Button>
            <Button type="submit" :disabled="props.isLoading" class="btn-primary">
                <Icon v-if="props.isLoading" icon="eos-icons:loading" class="mr-2" />
                {{ props.mode === 'edit' ? 'Update' : 'Create' }} User
            </Button>
        </div>
    </form>
</template>
