<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { h, ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import DynamicTable from '@/components/custom/DynamicTable.vue'
import DynamicDialog from '@/components/custom/DynamicDialog.vue'
import ActivityFilterDialog from '@/components/custom/activity-log/ActivityFilterDialog.vue'

import type { ColumnDef } from '@tanstack/vue-table'
import type { ActivityLog } from '@/types/activity_log'
import type { Meta } from '@/types/common'

const { getActivityLogs } = useActivityLogs()

const { toast } = useToast()
// End imports

onMounted(async () => {
  await fetchActivityLogs()
})

const columns: ColumnDef<ActivityLog, any>[] = [
  {
    id: 'activity',
    header: 'Activity',
    accessorKey: 'activity',
    cell: ({ row }) => {
      const activity = row.getValue('activity')
      const errorMessage = row.original.error_message
      
      if (errorMessage) {
        return h('div', { class: 'group relative cursor-pointer' }, [
          h('span', {}, String(activity)),
          h('div', { 
            class: 'invisible group-hover:visible absolute z-50 bg-white p-2 rounded shadow-lg border border-gray-200 w-64 text-sm',
            style: 'top: 100%; left: 0;'
          }, [
            h('p', { class: 'font-semibold' }, 'Error Details:'),
            h('p', { class: 'text-red-500' }, errorMessage)
          ])
        ])
      }
      
      return activity
    }
  },  
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      if (status === 'failed') {
        return h('span', { class: 'text-red-500 font-medium' }, status)
      }
      return status
    }
  },
  {
    id: 'details',
    header: 'Details',
    accessorKey: 'details',
    cell: ({ row }) => {
      const details = row.original.details ?? 'N/A'
      
      if (details != 'N/A') {
        return h('div', { class: 'group relative cursor-pointer' }, [
          h('span', {}, "Details..."),
          h('div', { 
            class: 'invisible group-hover:visible absolute z-50 bg-white p-2 rounded shadow-lg border border-gray-200 w-64 text-sm',
            style: 'top: 100%; left: 0;'
          }, [
            ...(details.split('\n').map(line => h('p', { class: 'text-gray-500' }, line)))
          ])
        ])
      }
      
      return h('span', { class: 'text-gray-500' }, details)

    }
  },
  {
    id: 'created_at',
    header: 'Time',
    accessorKey: 'created_at',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      const diffMins = Math.floor(diffSecs / 60)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)
      const diffWeeks = Math.floor(diffDays / 7)
      const diffMonths = Math.floor(diffDays / 30)

      if (diffMonths > 0) {
        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`
      } else if (diffWeeks > 0) {
        return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`
      } else if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
      } else if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
      } else if (diffMins > 0) {
        return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`
      } else {
        return 'just now'
      }
    }
  },
  {
    id: 'time_stamp',
    header: 'Time Stamp',
    accessorKey: 'created_at',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return date.toLocaleDateString('en-MY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + date.toLocaleTimeString('en-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  },
  {
    id: 'action_by',
    header: 'Action By',
    accessorKey: 'user.first_name',
    cell: ({ row }) => {
      const user = row.original.user
      if(user){
        return user.first_name + ' ' + user.surname
      }
      return row.original.action_by
    }
  },
  
]

const activityLogs = ref<ActivityLog[]>([])
const activityFilterDialogData = ref({
  isOpen: false,
  isLoading: false,
  filter: {
    from_date: '',
    to_date: '',
    action_by: '',
    status: ''
  }
})

const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const handleViewAll = async () => {
  meta.value.page = 1
  activityFilterDialogData.value.filter = {
    from_date: '',
    to_date: '',
    action_by: '',
    status: ''
  }
  await fetchActivityLogs()
}

const handleToggleFilters = () => {
  activityFilterDialogData.value.isOpen = !activityFilterDialogData.value.isOpen
}

const fetchActivityLogs = async () => {
  const filter: {
    from_date?: string,
    to_date?: string,
    action_by?: string,
    status?: string
  } = {
    action_by: activityFilterDialogData.value.filter.action_by,
    status: activityFilterDialogData.value.filter.status
  }
  if(activityFilterDialogData.value.filter.from_date){
    filter.from_date = activityFilterDialogData.value.filter.from_date
  }
  if(activityFilterDialogData.value.filter.to_date){
    filter.to_date = activityFilterDialogData.value.filter.to_date
  }
  
  const res = await getActivityLogs({ page: meta.value.page, page_size: meta.value.page_size, filter })
  activityLogs.value = res.data
  meta.value = res.meta
}

const handlePageSizeChange = async (newSize: number) => {
  meta.value.page_size = newSize
  meta.value.page = 1
  await fetchActivityLogs()
}

const handlePageChange = async (newPage: number) => {
  meta.value.page = newPage
  await fetchActivityLogs()
}

const handleFilterSubmit = async (filter: {
  from_date?: string,
  to_date?: string,
  action_by?: string,
  status?: string
}) => {
  if(filter.from_date){
    activityFilterDialogData.value.filter.from_date = filter.from_date
  }
  if(filter.to_date){
    activityFilterDialogData.value.filter.to_date = filter.to_date
  }
  if(filter.action_by){
    activityFilterDialogData.value.filter.action_by = filter.action_by
  }
  if(filter.status){
    activityFilterDialogData.value.filter.status = filter.status
  }
  await fetchActivityLogs()
  handleToggleFilters()
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
            Activity Logging
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    <div class="flex flex-row items-center my-8  gap-4">
      <div class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
        <Icon icon="heroicons:flag" class="w-6 h-6" />
      </div>
      <span class="flex flex-col">
        <h1 class="text-2xl font-bold">Activity Log</h1>
        <span class="text-sm text-gray-500">Manage activity logs</span>
      </span>
    </div>

    <DynamicTable 
      :columns="columns" 
      :data="activityLogs" 
      searchKey="activity"
      :currentPage="meta.page"
      :totalPages="meta.total_pages"
      @viewAll="handleViewAll"
      @toggleFilters="handleToggleFilters"
      @pageSizeChange="handlePageSizeChange"
      @pageChange="handlePageChange"
    />

    <ActivityFilterDialog
      :isOpen="activityFilterDialogData.isOpen"
      :isLoading="activityFilterDialogData.isLoading"
      :filter="activityFilterDialogData.filter"
      @submit="handleFilterSubmit"
      @cancel="activityFilterDialogData.isOpen = false"
    />

  </div>

  
</template>
