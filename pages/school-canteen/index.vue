<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { h, ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import DynamicTable from '@/components/custom/DynamicTable.vue'
import DynamicDialog from '@/components/custom/DynamicDialog.vue'

import type { ColumnDef } from '@tanstack/vue-table'
import type { Meta } from '@/types/common'

// Page details
const pageTitle = "School-based Outlets";
const pageDescription = "Oversee and optimize catering operations, nutritional compliance, and retail management across all school-integrated outlets.";

const { getBusinesses } = useBusinesses()
const { getMe } = useUsers()
const toast = useToast()

// Reactive data following Business pattern
const outlets = ref<Business[]>([])
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const isLoading = ref(false)

const fetchOutlets = async () => {
  isLoading.value = true
  try {
    // For now we fetch all businesses as outlets, we can add school-specific filters later if needed
    const res = await getBusinesses({ page: meta.value.page, pageSize: meta.value.page_size })
    outlets.value = res.data
    meta.value = res.meta
  } catch (error) {
    console.error('Failed to fetch outlets:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await getMe()
  await fetchOutlets()
})

// Define columns following Business Management style but tailored for Outlets
const columns: ColumnDef<Business, any>[] = [
  {
    id: 'name',
    header: 'Outlet Name',
    accessorKey: 'name',
    cell: ({ row }) => h('div', { class: 'font-bold text-slate-900' }, row.original.name)
  },
  {
    id: 'address',
    header: 'Location',
    accessorFn: (row) => row.address?.city || 'Campus Location',
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status || 'Active';
      return h('span', { class: 'px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700' }, status);
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        class: 'hover:bg-slate-100 rounded-xl',
        onClick: () => {
            const businessStore = useBusinessStore()
            businessStore.setSelectedBusiness(row.original)
            navigateTo('/business/business-details')
        },
      }, () => h(Icon, { icon: 'heroicons:eye', class: 'w-5 h-5 text-slate-400' }))
    ])
  }
];

const handlePageChange = (newPage: number) => {
  meta.value.page = newPage;
};

const handlePageSizeChange = (newSize: number) => {
  meta.value.page_size = newSize;
};

</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-8">
    <!-- Breadcrumb following pattern -->
    <Breadcrumb class="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>School-based Outlets</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <!-- Header Section following Business pattern -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
      <div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">{{ pageTitle }}</h1>
        <p class="mt-2 text-lg text-slate-500 max-w-2xl font-medium">{{ pageDescription }}</p>
      </div>
      <div class="flex items-center gap-3">
        <Button 
          @click="navigateTo('/school-canteen/provision-outlet')"
          class="bg-primary hover:bg-green-700 text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-green-100 transition-all hover:-translate-y-1 active:scale-95"
        >
          <Icon icon="ph:plus-bold" class="w-5 h-5 mr-2" />
          Provision Outlet
        </Button>
      </div>
    </div>

    <!-- Data Table Container following Business pattern -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <DynamicTable 
        :columns="columns" 
        :data="outlets" 
        searchKey="name"
        :currentPage="meta.page"
        :totalPages="meta.total_pages"
        :disableToolbar="false"
        @pageSizeChange="handlePageSizeChange"
        @pageChange="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.rdt_TableHeadRow) {
  @apply bg-slate-50/50 border-b border-slate-100;
}
</style>
