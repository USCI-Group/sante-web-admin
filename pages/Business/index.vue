<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { h, ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import DynamicTable from '@/components/custom/DynamicTable.vue'
import DynamicDialog from '@/components/custom/DynamicDialog.vue'

import type { ColumnDef } from '@tanstack/vue-table'
import type { Meta } from '@/types/common'
import type { Business } from '@/types/business'
const { getBusinesses, getBusiness } = useBusinesses()
const { isBusinessAdmin, isOutletAdmin, getMe } = useUsers()

const businessStore = useBusinessStore()
const { toast } = useToast()
// End imports

onMounted(async () => {
  await getMe()
  if (isBusinessAdmin()) {
    navigateTo('/business/business-details')
  }
  else if (isOutletAdmin()) {
    navigateTo('/business/business-details/outlet-details')
  }
  await fetchBusinesses()
})

// Define your columns
const columns: ColumnDef<Business, any>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
  },  
  {
    id: 'address',
    header: 'Address',
    accessorFn: (row) => {
      const parts = [
        row.address?.street_line1,
        row.address?.street_line2,
        row.address?.city,
        row.address?.state,
        row.address?.postal_code,
        row.address?.country
      ].filter(part => part)
      return parts.join(', ')
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        onClick: () => handleViewBusiness(row.original),
      }, () => h(Icon, { icon: 'heroicons:eye' }))
    ])
  }
]

const businesses = ref<Business[]>([])
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

const handleViewBusiness = async (business: Business) => {
  // Handle edit action
  const businessToView = await getBusiness(business.id ?? '')
  businessStore.setSelectedBusiness(businessToView ?? business)
  navigateTo('/business/business-details')
}

const handleConfirmDelete = async (confirmation: string | undefined) => {
  deleteForm.value.isDialogOpen = false
  try {
    // await deleteBusiness(deleteForm.value.user)
    await fetchBusinesses()
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

const fetchBusinesses = async () => {
  const res = await getBusinesses({ page: meta.value.page, pageSize: meta.value.page_size })
  businesses.value = res.data
  meta.value = res.meta
}

const handlePageSizeChange = async (newSize: number) => {
  meta.value.page_size = newSize
  meta.value.page = 1
  await fetchBusinesses()
}

const handlePageChange = async (newPage: number) => {
  meta.value.page = newPage
  await fetchBusinesses()
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
          <BreadcrumbPage>
            Business Management
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
      <div class="flex flex-col">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Business Listing</h1>
        <p class="text-slate-500 mt-1 max-w-2xl">Manage your organizational clients and their business entities through a unified management interface.</p>
      </div>
      <div class="flex items-center gap-3">
         <slot name="toolbar-buttons">
          <Button @click="navigateTo('/business/add-business')"
            class="bg-primary hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5">
            <Icon icon="ph:plus-bold" class="w-4 h-4 mr-2" />
            Add Business
          </Button>
        </slot>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <DynamicTable 
        :columns="columns" 
        :data="businesses" 
        searchKey="name"
        :currentPage="meta.page"
        :totalPages="meta.total_pages"
        :disableToolbar="true"
        @viewAll="handleViewAll"
        @toggleFilters="handleToggleFilters"
        @pageSizeChange="handlePageSizeChange"
        @pageChange="handlePageChange"
      />
    </div>

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
