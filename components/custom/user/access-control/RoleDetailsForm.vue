<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RolePermissionsForm from './RolePermissionsForm.vue'
import type { PermissionPresetType } from '@/types/user'
import type { Option } from '@/types/common'

const { me, getMe } = useUsers()

const props = defineProps<{
    mode?: 'create' | 'edit'
    isLoading: boolean
    initialData?: {
        name: string
        description: string
        business_id?: string | null
        permission_presets: PermissionPresetType[]
        role_type: string
    } | null
}>()

const emit = defineEmits(['submit', 'cancel'])

const name = ref(props.initialData?.name || '')
const description = ref(props.initialData?.description || '')
const selectedRole = ref(props.initialData?.role_type || '')
const businessID = ref(props.initialData?.business_id || '')

const nameError = ref('')
const roleError = ref('')
const businessError = ref('')

const { getBusinessesOptions } = useBusinesses()

const businessOptions = ref<Option[]>([])

onMounted(async () => {
    await getMe()
    try {
        businessOptions.value = await getBusinessesOptions()
    } catch (error) {
    }
})

const handleSubmit = () => {
    roleError.value = ''
    nameError.value = ''
    businessError.value = ''
    // Validate name
    if (!name.value) {
        nameError.value = 'Role name is required'
    }
    
    // Validate selected role
    if (!selectedRole.value) {
        roleError.value = 'Please select a role type'
    }

    if (selectedRole.value === 'business' && !businessID.value) {
        businessError.value = 'Please select a business'
    }

    if(me?.value?.GroupRole?.Role?.role_type !== 'admin' && me?.value?.GroupRole?.Role?.role_type !== 'general') {
        selectedRole.value = "business"
        businessID.value = me?.value?.business_id || ''
    }
    emit('submit', {
        name: name.value,
        description: description.value,
        permission_presets: props.initialData?.permission_presets,
        role_type: selectedRole.value,
        business_id: businessID.value
    })
}
</script>

<template>
    <div class="p-6 bg-white">
        <div class="space-y-6">
            <!-- Role Name and Description sections -->
            <h2 class="text-xl font-semibold">Role Details</h2>

            <!-- Role Name -->
            <div class="space-y-2">
                <Label class="text-gray-500">Role Name <span class="text-red-500">*</span></Label>
                <Input v-model="name" :class="{ 'border-red-500': nameError }"
                    placeholder="Enter role name" />
                <span v-if="nameError" class="text-sm text-red-500">{{ nameError }}</span>
            </div>

            <!-- Description -->
            <div class="space-y-2">
                <Label class="text-gray-500">Description</Label>
                <Input v-model="description" placeholder="Enter role description" class="w-full" />
            </div>

            
            <div v-if="me?.GroupRole?.Role?.role_type === 'admin'">
                <!-- Role Type Selection -->
                <div class="space-y-2">
                    <Label class="text-gray-500">Role Type <span class="text-red-500">*</span></Label>
                    <label class="flex items-center gap-2">
                    <input type="radio" v-model="selectedRole" value="admin" />
                        Santé Admin <span class="text-xs text-gray-500">(Create a role for all sante admin)</span>
                    </label>
    
                    <label class="flex items-center gap-2">
                    <input type="radio" v-model="selectedRole" value="general" />
                        General <span class="text-xs text-gray-500">(Create a role for any businesses)</span>
                    </label>
    
                    <label class="flex items-center gap-2">
                    <input type="radio" v-model="selectedRole" value="business" />
                        Business <span class="text-xs text-gray-500">(Create a role for a specific business)</span>
                    </label>
                    <span v-if="roleError" class="text-sm text-red-500">{{ roleError }}</span>
                </div>

                <!-- Select Business -->
                <div v-if="selectedRole === 'business' || props.initialData?.business_id" class="space-y-2">
                    <Label class="text-gray-500">Business <span class="text-red-500">*</span></Label>
                    <Select v-model="businessID" placeholder="Select business">
                        <SelectTrigger>
                            <SelectValue placeholder="Select business" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Businesses</SelectLabel>
                                <SelectItem v-for="businessOption in businessOptions" :key="businessOption.id" :value="businessOption.id">
                                    {{ businessOption.name }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <span v-if="businessError" class="text-sm text-red-500">{{ businessError }}</span>
                </div>
            </div>
            
            <!-- Permissions Section -->
            <RolePermissionsForm :permission-preset-types="props.initialData?.permission_presets ?? null" />

            <!-- Action Buttons -->
            <div class="flex justify-end gap-4 mt-6">
                <Button type="button" variant="outline" @click="$emit('cancel')">Cancel</Button>
                <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
                    <Icon v-if="isLoading" icon="ph:spinner-bold" class="w-4 h-4 animate-spin" />
                    <Icon v-else icon="ph:plus-bold" class="w-4 h-4" />
                    <span v-if="mode === 'create'">
                        {{ isLoading ? 'Creating...' : 'Create Role' }}
                    </span>
                    <span v-if="mode === 'edit'">
                        {{ isLoading ? 'Updating...' : 'Update Role' }}
                    </span>
                </Button>
            </div>
        </div>
    </div>
</template> 

<script lang="ts">
    export default {
        name: 'RoleDetailsForm',
    }
</script>