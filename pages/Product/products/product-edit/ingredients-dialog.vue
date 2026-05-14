<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMenu } from '@/composables/useMenu'
import TagsCombobox from '~/components/custom/tags/TagsCombobox.vue'
import type { ProductCategory, ProductSubCategory, Product, CustomizationGroup, CustomizationGroupOption, ModifierGroup } from '@/types/menu'
import { useToast } from '~/components/ui/toast/use-toast'
import { useUsers } from '@/composables/useUsers'
import { Checkbox } from '@/components/ui/checkbox'
import type { Ingredient, ProductIngredientMapping } from '@/types/menu'
const { addProduct, uploadProductImage } = useMenu()
const { toast } = useToast()
const { me, getMe } = useUsers()
const { getAllIngredients } = useMenu()

// Define props with modelValue for v-model support
const props = defineProps<{
  modelValue: boolean
  selectedIngredients: Ingredient[]
}>()

const imageFile = ref<File | null>(null)

// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'selectedIngredients', ingredients: Ingredient[]): void
}>()

const ingredientList = ref<Ingredient[]>([])
const selectedIngredients = ref<Ingredient[]>(props.selectedIngredients)

onMounted(async () => {
    await getMe()
    try {
        const response = await getAllIngredients(me.value?.business_id as string).catch(error => {
            console.error("Failed to fetch ingredients:", error)
            throw new Error(error.message || "Failed to fetch ingredients")
            
        })
        ingredientList.value = response
    } catch (error) {
        console.error("Failed to fetch ingredients:", error)
        toast({
            title: 'Error',
            description: 'Failed to fetch ingredients',
            variant: 'destructive'
        })
    }
})


// Create a computed property for the dialog state
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const toggleIngredient = (ingredient: Ingredient) => {
    const isSelected = selectedIngredients.value.some(i => i.id === ingredient.id)
    if (isSelected) {
        selectedIngredients.value = selectedIngredients.value.filter(i => i.id !== ingredient.id)
    } else {
        selectedIngredients.value.push(ingredient)
    }
}

const isIngredientSelected = (ingredientId: string) => {
    return computed({
        get: () => selectedIngredients.value.some(i => i.id === ingredientId),
        set: (value: boolean) => {
            const ingredient = ingredientList.value.find(i => i.id === ingredientId)
            if (ingredient) {
                if (value && !selectedIngredients.value.some(i => i.id === ingredientId)) {
                    selectedIngredients.value.push(ingredient)
                } else if (!value) {
                    selectedIngredients.value = selectedIngredients.value.filter(i => i.id !== ingredientId)
                }
            }
        }
    })
}

const saveIngredients = () => {
    const ingredients = selectedIngredients.value.map(ingredient => ({
        ...ingredient,
        unit: ingredient.unit,
        quantity: 0,

    }))
    emit('selectedIngredients', ingredients)
    dialogOpen.value = false
}

</script>

<template>
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
        <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <div class="flex justify-start items-center space-x-3">
                    <div class="flex flex-col justify-center items-start">
                        <DialogTitle class="text-2xl font-bold">Ingredients List</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">List of ingredients that can be added to a base product.</DialogDescription>
                    </div>
                </div>
                
            </DialogHeader>

            <br>

            <div class="w-full grid grid-cols-3 gap-2.5">
                <div v-for="ingredient in ingredientList" :key="ingredient.id" class="p-[5px] w-full h-full rounded-lg flex flex-row items-center justify-start border border-[#E9EAEB]" :class="{'bg-[#FDF5EF]': isIngredientSelected(ingredient.id as string).value}">
                    <!-- checkbox -->
                    <div class="w-1/6 h-full rounded-lg flex justify-center items-start">
                        <input 
                            type="checkbox" 
                            :id="ingredient.id" 
                            :checked="isIngredientSelected(ingredient.id as string).value"
                            @change="toggleIngredient(ingredient)"
                            class="h-4 w-4 rounded-sm border border-[#D5D7DA] text-[#00A859] focus:ring-[#00A859] "
                        />
                    </div>
                    <!-- modifier group with options -->
                    <div class="w-5/6 h-full rounded-lg">
                        <!-- modifier group name -->
                        <p class="text-center text-xs font-medium leading-none text-[#00A859]">{{ ingredient.name }}</p>
                        <!-- modifier group options -->
                        

                    </div>
                </div>


            </div>

            <div class="flex justify-end items-center space-x-2.5 mt-5">
                <!-- button -->
                <div class="max-w-[200px] grid grid-cols-2 gap-2.5">
                    <Button variant="outline" @click="dialogOpen = false" class="w-full h-full rounded-lg bg-[#00A859] text-white">Cancel</Button>
                    <Button variant="outline" @click="saveIngredients" class="w-full h-full rounded-lg bg-[#00A859] text-white">Save</Button>
                </div>
            

            </div>
        </DialogContent>
    </Dialog>
</template>

