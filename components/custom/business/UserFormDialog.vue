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
import type { User } from '@/types/user'
import type { Option } from '~/types/common'
import { Icon } from '@iconify/vue'
import Tooltip from '~/components/custom/Tooltip.vue'
const { checkPermission } = useUsers()
const { getOutletsOptions } = useOutlets()

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  isLoading: boolean
  user: User
  roleOptions: Option[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [user: any]
  'cancel': []
}>()

const user = ref(props.user)
const password = ref('')
const confirmPassword = ref('')
const roleId = ref('')

const firstNameError = ref('')
const surnameError = ref('')
const emailError = ref('')
const employeeNoError = ref('')
const phoneError = ref('')
const roleError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isOutletLevel = ref(false)

const outletOptions = ref<Option[]>([])

watch(() => props.user.business_id, async (newBusinessId) => {
  if(newBusinessId){
    outletOptions.value = await getOutletsOptions(newBusinessId)
  }
})

watch(() => props.user, (newUser) => {
  user.value = newUser
  roleId.value = newUser?.GroupRole?.role_id
  if(newUser?.outlet_id){
    isOutletLevel.value = true
  }else{
    isOutletLevel.value = false
  }
}, { immediate: true })

const handleSubmit = () => {
  if(!validateForm()){
    return
  }

  emit('submit', { ...user.value, password: password.value, role_id: roleId.value })
  password.value = ''
  confirmPassword.value = ''
  roleId.value = ''
}

const validateForm = () => {
  // Reset errors
  firstNameError.value = ''
  surnameError.value = ''
  emailError.value = ''
  employeeNoError.value = ''
  phoneError.value = ''
  roleError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  
  if(!user.value.first_name){
    firstNameError.value = 'First name is required'
    return false
  }
  if(!user.value.surname){
    surnameError.value = 'Surname is required'
    return false
  }
  if(!user.value.email){
    emailError.value = 'Email is required'
    return false
  }
  if(!user.value.employee_no){
    employeeNoError.value = 'Employee number is required'
    return false
  }
  if(!user.value.phone){
    phoneError.value = 'Phone number is required'
    return false
  }
  if(!roleId.value){
    roleError.value = 'Role is required'
    return false
  }
  if(props.mode === 'create'){
    if(!password.value){
      passwordError.value = 'Password is required'
      return false
    }
  }

  if(password.value !== confirmPassword.value){
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }

  return true
}

const handleCancel = () => {
  password.value = ''
  confirmPassword.value = ''
  roleId.value = ''
  emit('cancel')
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
            <DialogTitle>{{ mode === 'create' ? 'Add New User' : 'Edit User' }}</DialogTitle>
            <DialogDescription v-if="mode === 'create'">
            Add a new user to the business
            </DialogDescription>
            <DialogDescription v-else>
            Edit user details
            </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>First Name <span class="text-red-500">*</span></Label>
                <Input
                v-model="user.first_name"
                placeholder="Enter first name"
                :class="{ 'border-red-500': firstNameError }"
                />
                <span v-if="firstNameError" class="text-sm text-red-500">{{ firstNameError }}</span>
            </div>

            <div class="grid gap-2">
                <Label>Last Name <span class="text-red-500">*</span></Label>
                <Input
                v-model="user.surname"
                placeholder="Enter last name"
                :class="{ 'border-red-500': surnameError }"
                />
                <span v-if="surnameError" class="text-sm text-red-500">{{ surnameError }}</span>
            </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>Email <span class="text-red-500">*</span></Label>
                <Input
                type="email"
                v-model="user.email"
                placeholder="Enter email"
                :class="{ 'border-red-500': emailError }"
                />
                <span v-if="emailError" class="text-sm text-red-500">{{ emailError }}</span>
            </div>

            <div class="grid gap-2">
                <Label>Employee ID <span class="text-red-500">*</span></Label>
                <Input
                v-model="user.employee_no"
                placeholder="Enter employee ID"
                :class="{ 'border-red-500': employeeNoError }"
                />
                <span v-if="employeeNoError" class="text-sm text-red-500">{{ employeeNoError }}</span>
            </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>Phone <span class="text-red-500">*</span></Label>
                <Input
                v-model="user.phone"
                placeholder="Enter phone number"
                :class="{ 'border-red-500': phoneError }"
                />
                <span v-if="phoneError" class="text-sm text-red-500">{{ phoneError }}</span>
            </div>

            <div class="grid gap-2">
                <Label>Role <span class="text-red-500">*</span></Label>
                <select v-model="roleId" class="w-full rounded-md border border-input px-3 py-2" :class="{ 'border-red-500': roleError }">
                    <option value="">Select a role</option>
                    <option v-for="role in roleOptions" :key="role.id" :value="role.id">
                        {{ role.name }}
                    </option>
                </select>
                <span v-if="roleError" class="text-sm text-red-500">{{ roleError }}</span>
            </div>
            </div>

            
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center">
                <input
                  id="isOutletLevel"
                  type="checkbox"
                  v-model="isOutletLevel"
                  class="mr-2"
                />
                <label for="isOutletLevel" class="text-sm font-medium text-gray-700">
                  Is user outlet level
                </label>
              </div>

              <div v-if="isOutletLevel">
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
                <!-- <span v-if="outletError" class="text-sm text-red-500">{{ outletError }}</span> -->
              </div>
            </div>

        </div>


        <div v-if="mode === 'create' || checkPermission('reset_password')" class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
              <div class="flex">
                <Label>Password <span class="text-red-500">*</span></Label>
                <Tooltip text="Password must be at least 8 characters long, contain at least one uppercase letter,
                one lowercase letter, one number, and one special character." position="top">
                    <Icon icon="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                </Tooltip>
              </div>
              <Input
              type="password"
              v-model="password"
              placeholder="Enter password"
              :class="{ 'border-red-500': passwordError }"
              />
              <span v-if="passwordError" class="text-sm text-red-500">{{ passwordError }}</span>
          </div>

          <div class="grid gap-2">
              <Label>Confirm Password <span class="text-red-500">*</span></Label>
              <Input
              type="password"
              v-model="confirmPassword"
              placeholder="Confirm password"
              :class="{ 'border-red-500': confirmPasswordError }"
              />
              <span v-if="confirmPasswordError" class="text-sm text-red-500">{{ confirmPasswordError }}</span>
          </div>
        </div>

        <DialogFooter>
            <Button variant="outline" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
            {{ isLoading ? 'Saving...' : (mode === 'create' ? 'Add User' : 'Save Changes') }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
