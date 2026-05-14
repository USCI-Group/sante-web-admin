<script setup lang="ts">
import type { Menu } from '@/types/menu'

import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from '@tanstack/vue-table'
import {
    useVueTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    FlexRender,
} from '@tanstack/vue-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronFirstIcon,
    ChevronLastIcon,
} from 'lucide-vue-next'
import { Icon } from '@iconify/vue'
// Define props
const props = defineProps<{
    columns: ColumnDef<any, any>[]
    data: any[]
    searchKey?: string
    enableSelection?: boolean
    emptyTitle?: string
    emptyDescription?: string
    emptyButtonLabel?: string
    currentPage: number
    totalPages: number
    disableFilter?: boolean
    hideAddButton?: boolean
    disableToolbar?: boolean
}>()

// Add emit for empty state button click
const emit = defineEmits([
    'viewAll', 
    'toggleFilters', 
    'emptyStateAction', 
    'pageSizeChange', 
    'pageChange',
    'addProduct'
])

// Pagination Size
const paginationSize = [10, 20, 30, 40, 50]

// Table states
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

// Create selection column (if want checkbox and index column, uncomment this)
/* const selectionColumn: ColumnDef<any, any> = {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
        'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
    }),
    cell: ({ row }) => h(Checkbox, {
        'checked': row.getIsSelected(),
        'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
        'ariaLabel': 'Select row',
    }),
    enableSorting: false,
    enableHiding: false,
}

const indexColumn: ColumnDef<any, any> = {
    id: 'index',
    header: 'No.',
    cell: ({ row }) => row.index + 1 + ((props.currentPage -1 ) * table.getState().pagination.pageSize),
    enableSorting: false,
    enableHiding: false,
}


// Combine columns based on selection prop
const tableColumns = computed(() =>
    props.enableSelection
        ? [selectionColumn, indexColumn, ...props.columns]
        : [indexColumn, ...props.columns]
) */

const tableColumns = computed(() => [...props.columns])

// Initialize table
const table = useVueTable({
    get data() {
        return props.data
    },
    get columns() {
        return tableColumns.value
    },
    state: {
        get sorting() {
            return sorting.value
        },
        get columnFilters() {
            return columnFilters.value
        },
        get columnVisibility() {
            return columnVisibility.value
        },
        get rowSelection() {
            return rowSelection.value
        },
    },
    onSortingChange: (updater: ((old: SortingState) => SortingState) | SortingState) => {
        sorting.value = typeof updater === 'function'
            ? (updater as (old: SortingState) => SortingState)(sorting.value)
            : updater
    },
    onColumnFiltersChange: (updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
        columnFilters.value = typeof updater === 'function'
            ? (updater as (old: ColumnFiltersState) => ColumnFiltersState)(columnFilters.value)
            : updater
    },
    onColumnVisibilityChange: (updater: ((old: VisibilityState) => VisibilityState) | VisibilityState) => {
        columnVisibility.value = typeof updater === 'function'
            ? (updater as (old: VisibilityState) => VisibilityState)(columnVisibility.value)
            : updater
    },
    onRowSelectionChange: (updater: ((old: Record<string, boolean>) => Record<string, boolean>) | Record<string, boolean>) => {
        rowSelection.value = typeof updater === 'function'
            ? (updater as (old: Record<string, boolean>) => Record<string, boolean>)(rowSelection.value)
            : updater
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
})

const handlePageSizeChange = (val: string) => {
    const newSize = Number(val)
    table.setPageSize(newSize)
    emit('pageSizeChange', newSize)
}

const handleAddProduct = () => {
    emit('addProduct')
}

const sortData = (data: Menu[]) => {
    return data.sort((a: any, b: any) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateA - dateB
    })
}

</script>

<template>
    <div>
        <!-- Table Toolbar -->
        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
            <!-- Search Input -->
            <div class="relative w-96" v-if="searchKey">
                <span class="absolute inset-y-0 left-3 flex items-center">
                    <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 text-gray-500" />
                </span>
                <Input 
                    placeholder="Search"
                    :model-value="String(table.getColumn(searchKey)?.getFilterValue() ?? '')"
                    @update:model-value="table.getColumn(searchKey)?.setFilterValue($event)"
                    class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
            </div>

            <!-- Toolbar Buttons -->
            <div class="flex items-center gap-2 w-full lg:w-auto lg:ml-auto" v-if="!disableToolbar">
                <!-- Column Visibility Dropdown // currently not use in design-->
                <!-- <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" class="text-sm font-semibold">
                            <Icon name="heroicons:view-columns" class="w-4 h-4 mr-2" />
                            View
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem
                            v-for="column in table.getAllColumns().filter(column => column.getCanHide())"
                            :key="column.id" 
                            :checked="column.getIsVisible()"
                            @update:checked="(value) => column.toggleVisibility(!!value)">
                            {{ column.id }}
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div class="hidden lg:block border-l border-gray-200 mx-2 h-4"></div> -->

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                    <Button v-if="!disableFilter" variant="outline"
                        class="text-sm font-semibold"
                        @click="$emit('viewAll')">
                        View all
                    </Button>
                    <Button v-if="!disableFilter" variant="outline"
                        class="text-sm font-semibold"
                        @click="$emit('toggleFilters')">
                        <Icon icon="heroicons:funnel" class="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button v-if="!hideAddButton"
                        class="btn-primary px-3 py-2 rounded-lg" 
                        @click="$emit('addProduct')">
                        <Icon icon="ph:plus-bold" class="w-4 h-4 m-1" />
                        Add Product
                    </Button>
                </div>

                <!-- Custom Buttons Slot -->
                <slot name="toolbar-buttons"></slot>
            </div>
        </div>

        <!-- Table Container -->
        <div class="border rounded-md mb-8 overflow-x-auto">
            <Table>
                <TableHeader class="bg-gray-100">
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id" class="whitespace-nowrap">
                            <div v-if="!header.isPlaceholder" class="flex items-center space-x-2"
                                @click="header.column.getCanSort() && header.column.toggleSorting()">
                                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                
                <!-- Empty State -->
                <TableBody v-if="!data.length">
                    <TableRow>
                        <TableCell :colspan="table.getAllColumns().length" class="h-48 text-center">
                            <div v-if="!data.length" class="w-full min-h-[400px] h-full rounded-lg flex justify-center items-center">
                                <div class="flex flex-col items-center justify-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <img src="/components/picture/empty_image.png" alt="No Ingredient" class="w-45 h-36">

                                    </div>
                                    <div class="p-2.5 flex-1 self-stretch text-center justify-start text-[#252B37] text-base font-semibold leading-tight">
                                        {{ props.emptyTitle }}
                                    </div>
                                    <div class="flex-1 self-stretch text-center justify-start text-[#535862] text-sm font-normal leading-none max-w-[400px]">
                                        {{ props.emptyDescription }}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>

                <!-- Data Rows -->
                <TableBody v-else>
                    <TableRow v-for="row in table.getRowModel().rows" :key="row.id"
                        :data-state="row.getIsSelected() && 'selected'">
                        <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="max-w-[200px] break-words">
                            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <!-- Pagniation new Style-->
        <!-- <div class="w-full flex items-center justify-center gap-3">
            <div>
                <p class="text-xs font-normal text-[#A4A7AE]">Previous</p>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div class="bg-[#00A859] px-2 py-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-normal">
                    1
                </div>
                <div class="bg-[#00A859] px-2 py-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-normal">
                    2
                </div>
                <div class="bg-[#00A859] px-2 py-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-normal">
                    3
                </div>

            </div>
            <div>
                <p class="text-xs font-normal text-[#A4A7AE]">Next</p>
            </div>

        </div> -->

        <!-- Pagination -->
        <div v-if="data.length" class="flex items-center justify-between px-2">
            <div v-if="enableSelection" class="flex-1 text-sm text-muted-foreground">
                {{ table.getFilteredSelectedRowModel().rows.length }} of {{ table.getFilteredRowModel().rows.length }}
                row(s) selected.
            </div>
            <div v-else class="flex-1 text-sm text-muted-foreground">
            </div>
            <div class="flex items-center space-x-6 lg:space-x-8">
                <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium">Rows per page</p>
                    <Select :model-value="String(table.getState().pagination.pageSize)"
                        @update:model-value="handlePageSizeChange">
                        <SelectTrigger class="h-8 w-[70px]">
                            <SelectValue>
                                {{ table.getState().pagination.pageSize }}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent side="top">
                            <SelectItem v-for="size in paginationSize" :key="size" :value="String(size)">
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
    </div>
</template>

<script lang="ts">
export default {
    name: 'CustomDynamicTable'
}
</script>