<template>
  <!-- Pagination -->
    <div class="flex items-center justify-between px-2 mt-8">
        <div class="flex items-center space-x-6 lg:space-x-8">
            <div class="flex items-center space-x-2">
                <p class="text-sm font-medium">Items per page</p>
                <Select :model-value="String(props.pageSize)"
                    @update:model-value="$emit('pageSizeChange', Number($event))">
                    <SelectTrigger class="h-8 w-[70px]">
                        <SelectValue>
                            {{ props.pageSize }}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent side="top">
                        <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">
                            {{ size }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {{ currentPage }} of {{ totalPages }}
            </div>
            <div class="flex items-center space-x-2">
                <Button variant="outline" class="hidden h-8 w-8 p-0 lg:flex" :disabled="currentPage === 1"
                    @click="$emit('pageChange', 1)">
                    <span class="sr-only">Go to first page</span>
                    <ChevronFirstIcon class="h-4 w-4" />
                </Button>
                <Button variant="outline" class="h-8 w-8 p-0" :disabled="currentPage === 1"
                    @click="$emit('pageChange', currentPage - 1)">
                    <span class="sr-only">Go to previous page</span>
                    <ChevronLeftIcon class="h-4 w-4" />
                </Button>
                <Button variant="outline" class="h-8 w-8 p-0" :disabled="currentPage === totalPages" 
                    @click="$emit('pageChange', currentPage + 1)">
                    <span class="sr-only">Go to next page</span>
                    <ChevronRightIcon class="h-4 w-4" />
                </Button>
                <Button variant="outline" class="hidden h-8 w-8 p-0 lg:flex" :disabled="currentPage === totalPages"
                    @click="$emit('pageChange', totalPages)">
                    <span class="sr-only">Go to last page</span>
                    <ChevronLastIcon class="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
</template>



<script setup lang="ts">
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronFirstIcon,
    ChevronLastIcon,
} from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalPages: number
  pageSize: number
  pageSizes?: number[]
}>()

const emit = defineEmits<{
  (e: 'pageChange', page: number): void
  (e: 'pageSizeChange', pageSize: number): void
}>()

const pageSizes = props.pageSizes ?? [5, 10, 20, 50, 100]
</script>
