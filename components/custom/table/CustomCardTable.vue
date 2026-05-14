<script setup lang="ts">
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
import EditDeleteBox from '@/components/custom/edit-delete-box/edit-delete-box.vue'
import { onClickOutside } from '@vueuse/core'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMenu } from '@/composables/useMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useModifierStore } from '@/stores/ModifierStore'
import type { ModifierGroup } from '@/types/menu'
import { useToast } from '~/components/ui/toast/use-toast'
const { deleteModifierGroup } = useMenu()
const modifierStore = useModifierStore()
const router = useRouter()
const { toast } = useToast()

// Define props
const props = defineProps<{
    columns: ColumnDef<any, any>[]
    data: any[]
    searchKey?: string
    enableSelection?: boolean
    emptyTitle?: string
    emptyDescription?: string
    emptyButtonLabel?: string
    addButtonLabel?: string
    currentPage: number
    totalPages: number
    cardButtonLabel?: string
    cardButtonAction?: (id: string) => void
    cardData?: any[]
    disableFilter?: boolean
    hideAddButton?: boolean
}>()

// Add emit for empty state button click
const emit = defineEmits([
    'viewAll', 
    'toggleFilters', 
    'emptyStateAction', 
    'pageSizeChange', 
    'pageChange',
    'toolbarButtonAction',
    'refreshData',
    'cardButtonAction'
])

// Pagination Size
const paginationSize = [10, 20, 30, 40, 50]

// Table states
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

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

const itemCount = (index: number) => {
    if (props.cardData) {
        return props.cardData[index].modifier_options.length || 0
    }
    return 0
}

// search filter
const searchFilter = (value: string) => {
    if (!value || !props.searchKey) return props.cardData
    return props.cardData?.filter(item => 
        String(item[props.searchKey as keyof typeof item]).toLowerCase().includes(value.toLowerCase())
    )
}

// You might want to add a reactive filtered data property
const filteredData = computed(() => {
    return searchFilter(localSearchTerm.value) || props.cardData || []
})

// Add a local search term ref
const localSearchTerm = ref('')

const editDeleteMenu = ref(false)
const openMenuIndex = ref<number | null>(null)

// Update search function
const updateSearch = (value: string | number) => {
    localSearchTerm.value = String(value)
    console.log(filteredData.value)
}

const openEditDeleteMenu = (index: number) => {
    console.log(index)
    editDeleteMenu.value = !editDeleteMenu.value
    openMenuIndex.value = index
    if (!editDeleteMenu.value) {
        openMenuIndex.value = null
    }
}

const menuRef = ref<HTMLElement | null>(null)
const stop = onClickOutside(menuRef, () => {
  if (openMenuIndex.value !== null) {
    openMenuIndex.value = null
  }
})

/* const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
        openMenuIndex.value = null
    }
}
 */
onMounted(() => {
    document.addEventListener('click', stop)
})

onUnmounted(() => {
    document.removeEventListener('click', stop)
    stop()
})

const handleEdit = (index: number) => {
  console.log('Edit item at index:', index)
  openMenuIndex.value = null
}

const isDeleteDialogOpen = ref(false)
const itemToDelete = ref<number | null>(null)

const handleDelete = (index: number) => {
  itemToDelete.value = index
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (itemToDelete.value !== null) {
    try {
        await deleteModifierGroup(itemToDelete.value.toString())
    } catch (error) {     
        toast({
            title: 'Error',
            description: "Failed to delete modifier. This modifier is used in some products.",
            variant: 'destructive'
        })
    }
    isDeleteDialogOpen.value = false
    itemToDelete.value = null
    openMenuIndex.value = null
    refreshData()
  }
}

const refreshData = () => {
  console.log('Refreshing data')
  emit('refreshData')
}

/* const handleViewModifierDetails = (id: string) => {
  console.log('View modifier details clicked', id)
  emit('cardButtonAction', id)
} */

const handleViewModifierDetails = (id: string) => {
    const finalModifier = props.cardData?.find(modifier => modifier.id === id) || null
    if (finalModifier == null) return;
    modifierStore.setCurrentModifier(finalModifier as ModifierGroup)
    router.push({
        path: '/product/products/modifier-details',
        query: {
            id: id
        }
    })
}

</script>

<template>
    <div>
        <!-- Table Toolbar -->
        <div class="flex flex-col lg:flex-row items-start lg:items-center gap-4 py-4">
            <!-- Search Input -->
            <div class="relative w-96">
                <span class="absolute inset-y-0 left-3 flex items-center">
                    <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 text-gray-500" />
                </span>
                <Input v-if="searchKey" 
                    placeholder="Search"
                    :model-value="localSearchTerm"
                    @update:model-value="updateSearch($event)"
                    class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                />
            </div>

            <!-- Toolbar Buttons -->
            <div class="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
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
                        @click="$emit('toolbarButtonAction')">
                        <Icon icon="ph:plus-bold" class="w-4 h-4 m-1" />
                        {{ addButtonLabel }}
                    </Button>
                </div>

                <!-- Custom Buttons Slot -->
                <slot name="toolbar-buttons"></slot>
            </div>
        </div>

        <!-- Empty State -->
        <div v-if="!filteredData.length" class="w-full min-h-[500px] h-full p-2.5 border border-[#E0E0E0] rounded-lg flex justify-center items-center">
            <div class="flex flex-col items-center justify-center">
                <div class="flex flex-col items-center justify-center">
                    <img src="/components/picture/empty_image.png" alt="No Ingredient" class="w-45 h-36">

                </div>
                <div class="p-2.5 flex-1 self-stretch text-center justify-start text-[#252B37] text-base font-semibold leading-tight">No Modifier Found</div>
                <div class="flex-1 self-stretch text-center justify-start text-[#535862] text-sm font-normal leading-none max-w-[400px]">
                    You haven’t added any modifier yet. Please create an modifier to get started. 
                </div>
            </div>
        </div>

        <!-- Table Container -->
        <div class="border rounded-md mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 p-2.5">
            
            <div v-for="(card, index) in filteredData" class="p-2.5 border border-[#E0E0E0] rounded-lg flex justify-between items-center">
                <!-- title and show option amount -->
                <div class="flex flex-col items-start justify-center">
                    <div class="flex gap-2 items-center p-2.5 justify-start items-center">
                        <p class="justify-start text-black text-base font-medium leading-tight">
                            {{card.name}}
                        </p>
                    </div>
                    <div class="flex gap-2 items-center pl-2.5 justify-start items-start">
                        <span class="text-[#A4A7AE] text-sm font-normal leading-tight">{{ itemCount(index) }} options</span>

                    </div>
                </div>
                <!-- button details and three vertical dot -->
                <div class="flex gap-6 items-center">
                    <Button variant="outline" class="bg-[#FFF4ED] text-[#FF4405]" @click="handleViewModifierDetails(card.id)">
                        {{cardButtonLabel}}
                    </Button>
                    

                    <div class="relative" ref="menuRef">
                        <!-- edit delete menu button -->
                        <div class="text-[#A4A7AE] border-none cursor-pointer" @click="openEditDeleteMenu(index)">
                            <Icon icon="heroicons:ellipsis-vertical" class="w-6 h-6" />
                        </div>
                        <EditDeleteBox 
                            v-if="openMenuIndex === index"
                            class="absolute right-0 z-10 mt-2"
                            editLabel="Edit"
                            deleteLabel="Delete"
                            :editAction=" () => handleEdit(index)"
                            :deleteAction=" () => handleDelete(card.id)"
                            @click.stop
                        />
                    </div>
                </div>
            </div>

        </div>

        <!-- Delete Dialog -->
        <AlertDialog :open="isDeleteDialogOpen" @close="isDeleteDialogOpen = false">
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this item? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel @click="isDeleteDialogOpen = false">Cancel</AlertDialogCancel>
                    <AlertDialogAction class="btn-primary" @click="confirmDelete">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
    
        </AlertDialog>
    </div>


</template>

<script lang="ts">
export default {
    name: 'CustomDynamicTable'
}
</script>