<script setup lang="ts">

import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { ref } from 'vue'
import { useMenu } from '@/composables/useMenu'
import type { ProductCategory, ProductSubCategory } from '@/types/menu'
import { ChevronDown } from 'lucide-vue-next'


const { getAllCategories, getAllSubCategories } = useMenu()
const { me, getMe } = useUsers()

const props = defineProps<{
    modelValue: ProductCategory[] | ProductSubCategory[] | string[] 
    options: string[]
    placeholder: string
    disabled: boolean
    type: 'category' | 'subcategory'
    isFullWidth: boolean
    widthDropdownMenu: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: ProductCategory[] | ProductSubCategory[] | string[]): void
}>()

// full categories list
const categories = ref<ProductCategory[]>([])
// categories selected only
const categoriesSelected = ref<ProductCategory[] | ProductSubCategory[]>(props.modelValue as ProductCategory[])

// full subcategories list
const subcategories = ref<ProductSubCategory[]>([])

// subcategories selected only
const subcategoriesSelected = ref<ProductSubCategory[]>(props.modelValue as ProductSubCategory[])


const isDropdownOpen = ref(false)
const inputValue = ref('')

const addProductCategory = (category: ProductCategory) => {
    categoriesSelected.value.push(category)
    console.log("categoriesSelected --------> ", categoriesSelected.value)
}

const addProductSubCategory = (subcategory: ProductSubCategory) => {
    subcategoriesSelected.value.push(subcategory)
    console.log("subcategoriesSelected --------> ", subcategoriesSelected.value)
}

const openDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
    console.log("isDropdownOpen --------> ", isDropdownOpen.value)
}

const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    inputValue.value = input.value
}

const removeCategory = (category: ProductCategory) => {
    categoriesSelected.value = categoriesSelected.value.filter(cat => cat.id !== category.id)
    emit('update:modelValue', categoriesSelected.value)
}

const removeSubcategory = (subcategory: ProductSubCategory) => {
    subcategoriesSelected.value = subcategoriesSelected.value.filter(sub => sub.id !== subcategory.id)
    emit('update:modelValue', subcategoriesSelected.value)
}

onMounted(async () => {
    await getMe()
    const businessID = me.value?.business_id as string

    if (props.type === 'category') {
        const response = await getAllCategories(businessID, 1, 100)
        categories.value = response?.data ?? []
    } else if (props.type === 'subcategory') {
        const response = await getAllSubCategories(businessID, null as any, null as any)
        subcategories.value = response?.data ?? []
    }

})


</script>

<template>
    <TagsInput v-model="categoriesSelected" @update:modelValue="emit('update:modelValue', categoriesSelected)" :class="{'w-full': props.isFullWidth}">
        <TagsInputItem v-if="props.type === 'category'" v-for="category in categoriesSelected" :key="category.id" :value="category.name">
            <TagsInputItemText>{{ categories.find(cat => cat.id === category.id)?.name || category.name }}</TagsInputItemText>
            <TagsInputItemDelete v-if="categoriesSelected.length > 0" @click="removeCategory(category as ProductCategory)" />
        </TagsInputItem>
        <TagsInputItem v-if="props.type === 'subcategory'" v-for="subcategory in subcategoriesSelected" :key="subcategory.id" :value="subcategory.name">
            <TagsInputItemText>{{ subcategories.find(sub => sub.id === subcategory.id)?.name || subcategory.name }}</TagsInputItemText>
            <TagsInputItemDelete v-if="subcategoriesSelected.length > 0" @click="removeSubcategory(subcategory as ProductSubCategory)" />
        </TagsInputItem>
        <!-- <TagsInputInput 
            placeholder="Category..." 
            @focus="openDropdown"
            @input="handleInput"
        /> -->
        <DropdownMenu v-model:open="isDropdownOpen" @update:open="isDropdownOpen = $event">
            <DropdownMenuTrigger as-child class="grid grid-cols-[9fr_1fr]">
                <TagsInputInput 
                    placeholder="Category..." 
                    @input="handleInput"
                />
                <ChevronDown class="col-span-1" />
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                class="min-w-[--radix-dropdown-menu-trigger-width]"
                :side-offset="5"
            >
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    v-for="category in categories" 
                    :key="category.id" 
                    v-if="props.type === 'category'" 
                    @click="addProductCategory(category)"
                    class="w-full"
                >
                    {{ category.name }}
                </DropdownMenuItem>
                <DropdownMenuItem 
                    v-for="subcategory in subcategories" 
                    :key="subcategory.id" 
                    v-if="props.type === 'subcategory'" 
                    @click="addProductSubCategory(subcategory)"
                    class="w-full"
                >
                    {{ subcategory.name }}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

    </TagsInput>
</template>
