<script setup lang="ts">
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ref, onMounted } from 'vue'
import { useTax } from '@/composables/useTax'
import type { Tax } from '@/types/tax'
import { ChevronDown } from 'lucide-vue-next'
import { useUsers } from '@/composables/useUsers'

const { getAllTaxesList } = useTax()
const { me, getMe } = useUsers()

const props = defineProps<{
    modelValue: Tax[]
    placeholder?: string
    disabled?: boolean
    isFullWidth?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Tax[]): void
}>()

const allTaxes = ref<Tax[]>([])
const selectedTaxes = ref<Tax[]>(props.modelValue || [])

const isDropdownOpen = ref(false)

const addTax = (tax: Tax) => {
    if (!selectedTaxes.value.find(t => t.id === tax.id)) {
        selectedTaxes.value.push(tax)
        emit('update:modelValue', selectedTaxes.value)
    }
}

const removeTax = (tax: Tax) => {
    selectedTaxes.value = selectedTaxes.value.filter(t => t.id !== tax.id)
    emit('update:modelValue', selectedTaxes.value)
}

onMounted(async () => {
    await getMe()
    const businessID = me.value?.business_id as string
    if (businessID) {
        allTaxes.value = await getAllTaxesList(businessID)
    }
})
</script>

<template>
    <TagsInput v-model="selectedTaxes" @update:modelValue="emit('update:modelValue', selectedTaxes)" :class="{'w-full': props.isFullWidth}">
        <TagsInputItem v-for="tax in selectedTaxes" :key="tax.id" :value="tax.name">
            <TagsInputItemText>{{ allTaxes.find(t => t.id === tax.id)?.name || tax.name }} ({{ tax.rate_percentage }}%)</TagsInputItemText>
            <TagsInputItemDelete @click="removeTax(tax as Tax)" />
        </TagsInputItem>
        
        <DropdownMenu v-model:open="isDropdownOpen">
            <DropdownMenuTrigger as-child class="grid grid-cols-[9fr_1fr] w-full">
                <div class="flex items-center w-full cursor-pointer p-1">
                    <span class="text-sm text-gray-400 pl-2">{{ props.placeholder || 'Select Taxes...' }}</span>
                    <ChevronDown class="col-span-1 w-4 h-4 text-gray-500 ml-auto mr-2" />
                </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                class="min-w-[200px]"
                :side-offset="5"
            >
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    v-for="tax in allTaxes" 
                    :key="tax.id" 
                    @click="addTax(tax)"
                    class="w-full cursor-pointer"
                >
                    {{ tax.name }} ({{ tax.rate_percentage }}%)
                </DropdownMenuItem>
                <DropdownMenuItem v-if="allTaxes.length === 0" disabled>
                    No taxes available
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </TagsInput>
</template>
