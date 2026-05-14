<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import DynamicDialog from '~/components/custom/DynamicDialog.vue'
import type { OutletGroup, Outlet } from '@/types/outlet'
import OutletGroupFormDialog from '@/components/custom/business/OutletGroupFormDialog.vue'
import OutletOptionsDialog from '@/components/custom/business/OutletOptionsDialog.vue'
import UserOptionsDialog from '@/components/custom/business/UserOptionsDialog.vue'

const router = useRouter()
const { toast } = useToast()
const { me, getMe, getUsers, createUser, updateUser, deleteUser, isOutletAdmin, isSantéAdmin, checkPermission } = useUsers()
const { getRoleOptions } = useRoles()
const { createOutletGroup, deleteOutletGroup, getOutletGroups, updateOutletGroup, assignOutletToGroup, unassignOutletFromGroup, assignUserToOutletGroup, unassignUserFromOutletGroup } = useOutlets()

const businessStore = useBusinessStore()
const outletGroups = ref<OutletGroup[]>([])
const businessId = ref<string>('')

const deleteOutletGroupDialogData = ref({
  isOpen: false,
  title: 'Delete Outlet Group',
  description: 'Are you sure you want to delete this outlet group? Please enter the following text to confirm:',
  confirmation: 'Delete',
  isLoading: false,
  outletGroup: {} as OutletGroup
})

const outletGroupFormDialogData = ref({
  isOpen: false,
  mode: 'create' as 'create' | 'edit',
  outletGroup: {} as OutletGroup,
  isLoading: false,
})

const outletOptionsDialogData = ref({
  isOpen: false,
  isLoading: false,
  outletGroup: {} as OutletGroup,
})

const userOptionsDialogData = ref({
  isOpen: false,
  isLoading: false,
  outletGroup: {} as OutletGroup,
})

onMounted(async () => {
  await getMe()
  await fetchBusinessID()
  await fetchOutletGroups()
})

const fetchBusinessID = async () => {
  if(isSantéAdmin()){
    const selectedBusiness = businessStore.selectedBusiness
    businessId.value = selectedBusiness?.id as string
    }else{
    businessId.value = me.value?.business_id as string
    }
}

const handleCancel = () => {
  router.push('/business/business-details')
}

const handleAddOutletGroup = () => {
  outletGroupFormDialogData.value.isOpen = true
  outletGroupFormDialogData.value.mode = 'create'
}

const handleAssignOutletButton = (outletGroup: OutletGroup) => {
  outletOptionsDialogData.value.isOpen = true
  outletOptionsDialogData.value.outletGroup = outletGroup
}

const handleEditOutletGroup = (outletGroup: OutletGroup) => {
  outletGroupFormDialogData.value.isOpen = true
  outletGroupFormDialogData.value.mode = 'edit'
  outletGroupFormDialogData.value.outletGroup = outletGroup
}

const handleDeleteOutletGroupButton = (outletGroup: OutletGroup) => {
  deleteOutletGroupDialogData.value.isOpen = true
  deleteOutletGroupDialogData.value.outletGroup = outletGroup
  deleteOutletGroupDialogData.value.confirmation = 'Delete ' + outletGroup.name as string
}

const handleDeleteOutletGroupDialog = async (data: any) => {
    const confirmation = data as string
    if(confirmation != deleteOutletGroupDialogData.value.confirmation){
        toast({
            title: 'Error',
            description: 'Invalid confirmation',
            variant: 'destructive',
        })
        return
    }
    try {
        await deleteOutletGroup(deleteOutletGroupDialogData.value.outletGroup.id as string)
        toast({
            title: 'Success',
            description: 'Outlet group deleted successfully',
            variant: 'success',
        })
        await fetchOutletGroups()
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to delete outlet',
            variant: 'destructive',
        })
    }finally{
        deleteOutletGroupDialogData.value.isOpen = false
        deleteOutletGroupDialogData.value.isLoading = false
    }
}

const handleSaveOutletGroup = async (data: OutletGroup) => {
  outletGroupFormDialogData.value.isLoading = true
  try {
    if(outletGroupFormDialogData.value.mode === 'create'){
      data.business_id = businessId.value
      await createOutletGroup(data)
    }else{
      await updateOutletGroup(data)
    }
    toast({
      title: 'Success',
      description: 'Outlet group successfully saved',
      variant: 'success',
    })
    outletGroupFormDialogData.value.isOpen = false
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to create outlet group',
      variant: 'destructive',
    })
  } finally {
    outletGroupFormDialogData.value.isLoading = false
    await fetchOutletGroups()
  }
}

const fetchOutletGroups = async () => {
  try {
    const res = await getOutletGroups(businessId.value)
    outletGroups.value = res.outlet_groups
  } catch (error: any) {
    outletGroups.value = []
  }
}

const handleAssignOutletToGroup = async (selectedOutletId: string) => {
  outletOptionsDialogData.value.isLoading = true
  try {
    await assignOutletToGroup(outletOptionsDialogData.value.outletGroup.id as string, selectedOutletId)
    outletOptionsDialogData.value.isOpen = false

    await fetchOutletGroups()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to assign outlet to group',
      variant: 'destructive',
    })
  } finally {
    outletOptionsDialogData.value.isLoading = false
  }
}

const handleUnassignOutletFromGroup = async (outletGroupId: string, outletId: string) => {
  try {
    await unassignOutletFromGroup(outletGroupId, outletId)
    await fetchOutletGroups()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to unassign outlet from group',
      variant: 'destructive',
    })
  }
}

const handleAssignUserButton = (outletGroup: OutletGroup) => {
  userOptionsDialogData.value.isOpen = true
  userOptionsDialogData.value.outletGroup = outletGroup
}

const handleAssignUserToGroup = async (selectedUserId: string) => {
  try {
    await assignUserToOutletGroup(userOptionsDialogData.value.outletGroup.id as string, selectedUserId)
    userOptionsDialogData.value.isOpen = false
    await fetchOutletGroups()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to assign user to group',
      variant: 'destructive',
    })
  } finally {
    userOptionsDialogData.value.isLoading = false
  }
}

const handleUnassignUserFromGroup = async (outletGroupId: string, userId: string) => {
  try {
    await unassignUserFromOutletGroup(outletGroupId, userId)
    await fetchOutletGroups()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to unassign user from group',
      variant: 'destructive',
    })
  }
}

</script>

<template>
  <div>
    <div class="container py-6">
      <Breadcrumb class="mb-6">
          <BreadcrumbList>
              <BreadcrumbItem>
                  <BreadcrumbLink>
                      Home
                  </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                  <BreadcrumbLink>
                      <NuxtLink to="/business">
                          Business Management
                      </NuxtLink>
                  </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                  <BreadcrumbLink>
                      <NuxtLink to="/business/business-details">
                          Business Details
                      </NuxtLink>
                  </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                  <BreadcrumbPage>
                      Outlet Group
                  </BreadcrumbPage>
              </BreadcrumbItem>
          </BreadcrumbList>
      </Breadcrumb>
      <div class="flex flex-row items-center my-8 gap-4">
          <div
              class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
              <Icon icon="heroicons:building-storefront" class="w-6 h-6" />
          </div>
          <span class="flex flex-col">
              <h1 class="text-2xl font-bold">Outlet Group</h1>
              <span class="text-sm text-gray-500">View and manage outlet group</span>
          </span>
          <Button v-if="!isOutletAdmin()" variant="outline" @click="handleCancel" class="ml-auto">
            <Icon icon="heroicons:arrow-left" class="mr-2" />
            Back
          </Button>
      </div>

      <div class="flex justify-end">
        <Button
          v-if="checkPermission && checkPermission('create_outlet')"
          class="btn-primary"
          @click="handleAddOutletGroup"
        >
          <Icon icon="ph:plus-bold" class="w-4 h-4 mr-2" />
          Add Outlet Group
        </Button>
      </div>

      <div class="mt-4">
        <div class="border border-gray-300 rounded-lg p-6 shadow-sm mb-4" v-for="outletGroup in outletGroups" :key="outletGroup.id">
          <div class="flex flex-row gap-8">
            <!-- Section 1: Outlet Group Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-semibold">Outlet Group</h2>
                  <Button
                    v-if="checkPermission && checkPermission('create_outlet')"
                    variant="ghost"
                    class="p-2"
                    @click="handleEditOutletGroup(outletGroup)"
                    title="Edit Outlet Group"
                  >
                    <Icon icon="heroicons:pencil-square" class="w-5 h-5" />
                  </Button>
                </div>
                <Button
                    v-if="checkPermission && checkPermission('create_outlet')"
                    variant="ghost"
                    class="p-1 ml-2 text-red-500"
                    title="Delete Outlet Group"
                    @click="handleDeleteOutletGroupButton(outletGroup)"
                  >
                    <Icon icon="ph:trash-bold" class="w-4 h-4" />
                </Button>
              </div>
              <div class="text-gray-600">
                <p>
                  {{ outletGroup.name }}
                </p>
                <p class="text-sm text-gray-400 mt-1">
                  {{ outletGroup.description }}
                </p>
              </div>
            </div>
            <!-- Section 2: List of Outlets -->
            <div class="flex-1 min-w-0 border-l border-gray-200 pl-6">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-semibold">Outlets</h2>
                <Button
                  v-if="checkPermission && checkPermission('create_outlet')"
                  class="btn-primary"
                  variant="outline"
                  size="sm"
                  @click="handleAssignOutletButton(outletGroup)"
                >
                  <Icon icon="ph:plus-bold" class="w-4 h-4 mr-2" />
                  Assign Outlet
                </Button>
              </div>
              <ul class="list-disc list-inside text-gray-700">
                <li v-for="outlet in outletGroup.Outlets" :key="outlet.id" class="flex items-center justify-between">
                  <span class="flex items-center">
                    <span class="text-2xl align-middle leading-none mr-2">•</span>
                    <span>{{ outlet.name }}</span>
                  </span>
                  <Button
                    v-if="checkPermission && checkPermission('create_outlet')"
                    variant="ghost"
                    class="p-1 ml-2 text-red-500"
                    title="Delete Outlet"
                    @click="handleUnassignOutletFromGroup(outletGroup.id as string, outlet.id as string)"
                  >
                    <Icon icon="ph:trash-bold" class="w-4 h-4" />
                  </Button>
                </li>
              </ul>
            </div>
            <!-- Section 3: List of Users -->
            <div class="flex-1 min-w-0 border-l border-gray-200 pl-6">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-semibold mr-2">Users</h2>
                <Button
                  v-if="checkPermission && checkPermission('create_outlet')"
                  class="btn-primary"
                  variant="outline"
                  size="sm"
                  @click="handleAssignUserButton(outletGroup)"
                >
                  <Icon icon="ph:plus-bold" class="w-4 h-4 mr-2" />
                  Assign User
                </Button>
              </div>
              <ul class="list-disc list-inside text-gray-700">
                <li v-for="user in outletGroup.Users" :key="user.id as string" class="flex items-center justify-between">
                  <span class="flex items-center">
                    <span class="text-2xl align-middle leading-none mr-2">•</span>
                    <span>{{ user.first_name }} {{ user.surname }} ({{ user.GroupRole.Role.name }})</span>
                  </span>
                  <Button
                    v-if="checkPermission && checkPermission('create_outlet')"
                    variant="ghost"
                    class="p-1 ml-2 text-red-500"
                    title="Delete User"
                    @click="handleUnassignUserFromGroup(outletGroup.id as string, user.id as string)"
                  >
                    <Icon icon="ph:trash-bold" class="w-4 h-4" />
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>

    <OutletGroupFormDialog
      :is-open="outletGroupFormDialogData.isOpen"
      :mode="outletGroupFormDialogData.mode"
      :outlet-group="outletGroupFormDialogData.outletGroup"
      :is-loading="outletGroupFormDialogData.isLoading"
      @submit="handleSaveOutletGroup"
      @cancel="outletGroupFormDialogData.isOpen = false"
    />

    <OutletOptionsDialog
      :is-open="outletOptionsDialogData.isOpen"
      :business-id="businessId"
      :is-loading="outletOptionsDialogData.isLoading"
      @submit="handleAssignOutletToGroup"
      @cancel="outletOptionsDialogData.isOpen = false"
    />

    <UserOptionsDialog
      :is-open="userOptionsDialogData.isOpen"
      :business-id="businessId"
      :is-loading="userOptionsDialogData.isLoading"
      @submit="handleAssignUserToGroup"
      @cancel="userOptionsDialogData.isOpen = false"
    />

    <DynamicDialog
      :is-open="deleteOutletGroupDialogData.isOpen"
      :title="deleteOutletGroupDialogData.title"
      :description="deleteOutletGroupDialogData.description"
      :confirmation-text="deleteOutletGroupDialogData.confirmation"
      :show-confirmation-input="true"
      @confirm="handleDeleteOutletGroupDialog"
      @cancel="deleteOutletGroupDialogData.isOpen = false"
      />
  </div>
</template>
