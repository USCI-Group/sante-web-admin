<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { h, ref, computed, onMounted, onActivated } from 'vue'
import DataTable from '@/components/custom/DataTable.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { icons } from 'lucide-vue-next'
import { useRoles } from '@/composables/useRoles'
import type { Role } from '@/types/user'
import { useToast } from '@/components/ui/toast/use-toast'
import { useRoleStore } from '@/stores/RoleStore'

const config = useRuntimeConfig();

useSeoMeta({
  title: config.public.appName + " | User - Access Control",
  description: "Manage user roles and permissions",
});

const { getAllRoles, getRole, deleteRole } = useRoles()
const { me, getMe, isOutletAdmin, isSantéAdmin } = useUsers()
const { toast } = useToast()
const roleStore = useRoleStore()

const roles = ref<Role[]>([])
const isLoading = ref(false)

const deleteForm = ref({
  id: '',
  confirmationText: 'delete',
  confirmation: '',
  isDialogOpen: false,
})

const fetchRoles = async () => {
  try {
    isLoading.value = true
    const fetchedRoles = await getAllRoles()
    roles.value = fetchedRoles
  } catch (error) {
    console.error('Error fetching roles:', error)
    toast({
      title: 'Error',
      description: 'Failed to fetch roles',
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}

// Fetch roles on component mount
onMounted(async () => {
  await getMe()
  // if (!isSantéAdmin()) {
  //   router.push('/user/user-administration')
  // }

  await fetchRoles()
})

// Fetch roles when component is re-activated
onActivated(fetchRoles)

// Define your columns
const columns: ColumnDef<Role, any>[] = [
  {
    id: 'name',
    header: 'Role',
    accessorKey: 'name',
  },
  {
    id: 'description',
    header: 'Description',
    accessorKey: 'description',
  },
  {
    id: 'updated_at',
    header: 'Last Updated',
    accessorKey: 'updated_at',
    cell: ({ row }) => {
      const date = row.original.updated_at ? new Date(row.original.updated_at) : new Date()
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h('div', { class: 'flex gap-2' }, [
        h(Button, {
          variant: 'ghost',
            size: 'icon',
            onClick: () => handleEdit(row.original),
            style: { display: displayEditButton(row.original) }
          }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
          h(Button, {
            variant: 'ghost',
            size: 'icon',
            onClick: () => handleDelete(row.original),
            style: { display: displayDeleteButton(row.original) }
          }, () => h(Icon, { icon: 'heroicons:trash' }))
        ])
    }
  }
]

const router = useRouter()

const displayEditButton = (role: Role) => {
  if (me.value?.GroupRole?.Role?.id === role.id) {
    return 'none'
  }
  if (isOutletAdmin()) {
    return 'none'
  }
  return 'flex'
}

const displayDeleteButton = (role: Role) => {
  if (me.value?.GroupRole?.Role?.id === role.id) {
    return 'none'
  }
  if (!isSantéAdmin() && role.role_type !== 'business') {
    return 'none'
  }
  if (isOutletAdmin()) {
    return 'none'
  }
  return 'flex'
}

const createRole = () => {
  router.push('/user/access-control/create-role')
}

const handleEdit = async (role: Role) => {
  const roleToEdit = await getRole(role.id ?? '')
  roleStore.setSelectedRole(roleToEdit ?? role)
  router.push('/user/access-control/edit-role')
}

const handleDelete = (role: Role) => {
  deleteForm.value.id = role.id ?? ''
  deleteForm.value.confirmationText = `delete ${role.name}`
  deleteForm.value.isDialogOpen = true
}

const handleViewAll = () => {
  console.log('View all')
}

const handleToggleFilters = () => {
  console.log('Toggle filters')
}

const handleCancelDelete = () => {
  deleteForm.value.isDialogOpen = false
}

const handleConfirmDelete = async () => {
  deleteForm.value.isDialogOpen = false
  // Handle delete action
  try {
    await deleteRole(deleteForm.value.id ?? '', deleteForm.value.confirmation ?? '')
    toast({
      title: 'Success',
      description: 'Role deleted successfully',
      variant: 'success',
    })
    await fetchRoles()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to delete role',
      variant: 'destructive',
    })
  }
}

</script>

<style scoped></style>

<template>
  <div class="p-6">
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
            User Management
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            Access Control
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-row items-center my-8  gap-4">
      <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
        <Icon icon="heroicons:flag" class="w-6 h-6" />
      </div>
      <span class="flex flex-col">
        <h1 class="text-2xl font-bold">Access Control</h1>
        <span class="text-sm text-gray-500">Manage user roles and permissions</span>
      </span>
    </div>

    <DataTable :columns="columns" :data="roles" searchKey="name" empty-title="No Role Found"
      empty-description="You haven't added any role yet. Please create a role to get started."
      empty-button-label="Create Role" @empty-state-action="createRole" @viewAll="handleViewAll"
      @toggleFilters="handleToggleFilters">
      <template #toolbar-buttons>
        <Button @click="createRole"
          class="btn-primary">
          <Icon icon="ph:plus-bold" class="w-4 h-4" />
          Create Role
        </Button>
      </template>
    </DataTable>

    <Dialog :open="deleteForm.isDialogOpen" @update:open="deleteForm.isDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Please enter the following text to confirm the deletion of the role: <span class="font-bold text-red-500">{{ deleteForm.confirmationText }}</span>
            </DialogDescription>
            <Input v-model="deleteForm.confirmation" placeholder="Enter the role name to confirm" />
        </DialogHeader>
        <DialogFooter>
          <Button class="btn-primary" @click="handleConfirmDelete">
            Confirm
          </Button>
          <Button class="btn-secondary" @click="handleCancelDelete">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
