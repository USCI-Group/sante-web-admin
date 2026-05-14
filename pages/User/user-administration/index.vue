<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { h, ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import DynamicTable from '@/components/custom/DynamicTable.vue'
import DynamicDialog from '@/components/custom/DynamicDialog.vue'

import type { ColumnDef } from '@tanstack/vue-table'
import type { User } from '@/types/user'
import type { Meta } from '@/types/common'

const { getUsers, getUser, deleteUser } = useUsers()
const userStore = useUserStore()
const { toast } = useToast()
// End imports

onMounted(async () => {
  await fetchUsers()
})

// Define your columns
const columns: ColumnDef<User, any>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'first_name',
  },  
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'phoneNumber',
    header: 'Phone Number',
    accessorKey: 'phone',
  },
  {
    id: 'employeeId',
    header: 'Employee ID',
    accessorKey: 'employee_no',
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        onClick: () => handleEdit(row.original),
      }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        onClick: () => handleDelete(row.original),
      }, () => h(Icon, { icon: 'heroicons:trash' }))
    ])
  }
]

const search = ref('')
const users = ref<User[]>([])
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const deleteForm = ref({
  user: '',
  isDialogOpen: false,
  title: 'Delete User',
  description: 'Are you sure you want to delete this user?',
  confirmationText: '',
  showConfirmationInput: false,
})

const createUser = () => {
  navigateTo('/user/user-administration/create-user')
}

const handleEdit = async (user  : any) => {
  // Handle edit action
  const userToEdit = await getUser(user.id ?? '')
  userStore.setSelectedUser(userToEdit ?? user)
  navigateTo('/user/user-administration/edit-user')
}

const handleDelete = (user: any) => {
  // Handle delete action
  deleteForm.value.user = user.id ?? ''
  deleteForm.value.isDialogOpen = true
}

const handleConfirmDelete = async (confirmation: string | undefined) => {
  deleteForm.value.isDialogOpen = false
  try {
    await deleteUser(deleteForm.value.user)
    await fetchUsers()
    toast({
        title: 'Success',
        description: 'User account deleted successfully',
        variant: 'success',
    })
  } catch (error: any) {
    toast({
        title: 'Error',
        description: error.data?.message ?? 'Failed to delete user account',
        variant: 'destructive',
    })
  }
}

const handleViewAll = () => {
  console.log('View all')
}

const handleToggleFilters = () => {
  console.log('Toggle filters')
}

const fetchUsers = async () => {
  const res = await getUsers({ page: meta.value.page, page_size: meta.value.page_size, filter: { name: search.value } })
  users.value = res.data
  meta.value = res.meta
}

const handlePageSizeChange = async (newSize: number) => {
  meta.value.page_size = newSize
  meta.value.page = 1
  await fetchUsers()
}

const handlePageChange = async (newPage: number) => {
  meta.value.page = newPage
  await fetchUsers()
}

let debounceTimer: any = null
watch(search, (newVal: string) => {
  clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    fetchUsers()
  }, 500) // Delay in milliseconds
})

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
            User Administration
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-row items-center my-8  gap-4">
      <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
        <Icon icon="heroicons:flag" class="w-6 h-6" />
      </div>
      <span class="flex flex-col">
        <h1 class="text-2xl font-bold">User Administration</h1>
        <span class="text-sm text-gray-500">Manage user accounts</span>
      </span>
    </div>

    <div class="flex flex-row justify-between items-center mb-4">
      <div class="relative w-96">
          <span class="absolute inset-y-0 left-3 flex items-center">
              <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 text-gray-500" />
          </span>
          <Input 
              v-model="search"
              placeholder="Search"
              class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
          />
      </div>
      <Button @click="createUser"
        class="btn-primary">
        <Icon icon="ph:plus-bold" class="w-4 h-4" />
        Create User
      </Button>
    </div>

    <DynamicTable 
      :columns="columns" 
      :data="users" 
      :currentPage="meta.page"
      :totalPages="meta.total_pages"
      @viewAll="handleViewAll"
      @toggleFilters="handleToggleFilters"
      @pageSizeChange="handlePageSizeChange"
      @pageChange="handlePageChange"
      :disable-toolbar="true"
    >
      <!-- <template #toolbar-buttons>
      </template> -->
    </DynamicTable>

    <DynamicDialog
      :isOpen="deleteForm.isDialogOpen"
      :title="deleteForm.title"
      :description="deleteForm.description"
      :confirmationText="deleteForm.confirmationText"
      :showConfirmationInput="deleteForm.showConfirmationInput"
      @cancel="deleteForm.isDialogOpen = false"
      @confirm="handleConfirmDelete"
    />
  </div>

  
</template>
