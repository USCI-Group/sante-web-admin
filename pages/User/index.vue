<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { h, ref } from 'vue'
import DataTable from '@/components/custom/DataTable.vue'
import type { ColumnDef } from '@tanstack/vue-table'

interface User {
  id: string
  name: string
  email: string
  phoneNumber: string
  employeeId: string
  status: string
}

// Define your columns
const columns: ColumnDef<User, any>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },  
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'phoneNumber',
    header: 'Phone Number',
    accessorKey: 'phoneNumber',
  },
  {
    id: 'employeeId',
    header: 'Employee ID',
    accessorKey: 'employeeId',
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

const data = ref<User[]>([
  { 
    id: '550e8400-e29b-41d4-a716-446655440000', 
    name: 'John Doe', 
    email: 'user@example.com', 
    phoneNumber: '1234567890',
    employeeId: '1234567890',
    status: 'Active'
  },
  { 
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 
    name: 'Jane Smith', 
    email: 'admin@example.com', 
    phoneNumber: '1234567890',
    employeeId: '1234567890',
    status: 'Active'
  },
])

const handleEdit = (user: any) => {
  // Handle edit action
  console.log('Edit user:', user)
}

const handleDelete = (user: any) => {
  // Handle delete action
  console.log('Delete user:', user)
}

const handleViewAll = () => {
  console.log('View all')
}

const handleToggleFilters = () => {
  console.log('Toggle filters')
}
</script>

<style scoped></style>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">User Management</h1>
      <!-- <Button>Add User</Button> -->
    </div>

    <DataTable 
      :columns="columns" 
      :data="data" 
      searchKey="name"
      :enableSelection="true"
      @viewAll="handleViewAll"
      @toggleFilters="handleToggleFilters"
    />
  </div>
</template>
