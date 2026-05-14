<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMenu } from '@/composables/useMenu'
import { useToast } from '~/components/ui/toast/use-toast'
import { useUsers } from '@/composables/useUsers'
import type { Ingredient, ModifierGroupOption, ModifierIngredientMapping } from '@/types/menu'
import { UnitMeasurementOptions } from '@/constants/common'
import IngredientDialog from '~/pages/Product/products/product-edit/ingredients-dialog.vue'
const props = defineProps<{
    modifier_option: ModifierGroupOption
}>()

const modifierStore = useModifierStore()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Ingredient[]): void
}>()

const { toast } = useToast()
const { me, getMe } = useUsers()
const { saveModifierIngredientsMappings } = useMenu()
const assignIngredientsDialogFormData = ref({
    is_open: false,
    selected_ingredients: [] as Ingredient[],
})

onMounted(async () => {
})

const addIngredientsButton = () => {
    const ingredients_in_modifier_option: Ingredient[] = props.modifier_option.ingredient_mappings?.map(mapping => mapping.ingredient).filter((ingredient): ingredient is Ingredient => !!ingredient) || []
    assignIngredientsDialogFormData.value.selected_ingredients = ingredients_in_modifier_option
    assignIngredientsDialogFormData.value.is_open = true
}

const assignIngredientsToModifierOption = (data: Ingredient[]) => {
    const mappingsGroupedByIngredientId = props.modifier_option.ingredient_mappings ? props.modifier_option.ingredient_mappings.reduce((acc: Record<string, ModifierIngredientMapping>, mapping) => {
        acc[mapping.ingredient_id] = {
            id: mapping.id,
            ingredient_id: mapping.ingredient_id,
            ingredient: mapping.ingredient,
            modifier_options_id: props.modifier_option.id as string,
            unit: mapping.unit,
            quantity: mapping.quantity,
        }
        return acc
    }, {}) : {}

    const modifier_ingredient_mappings: ModifierIngredientMapping[] = data.map(ingredient => ({
        id: mappingsGroupedByIngredientId[ingredient.id]?.id,
        ingredient_id: ingredient.id,
        ingredient: ingredient,
        modifier_options_id: props.modifier_option.id as string,
        unit: mappingsGroupedByIngredientId[ingredient.id]?.unit || 'g',
        quantity: mappingsGroupedByIngredientId[ingredient.id]?.quantity || 0,
    }))
    
    props.modifier_option.ingredient_mappings = modifier_ingredient_mappings
}

const updateModifierIngredientsMapping = async () => {
    try{
        await saveModifierIngredientsMappings(props.modifier_option.ingredient_mappings)
        modifierStore.updateModifierOption(props.modifier_option)

        toast({
            title: 'Success',
            description: 'Ingredients assigned to modifier option successfully',
            variant: 'success'
        })
    } catch (error: any){
        console.log(error.data?.message)
        toast({
            title: 'Error',
            description: 'Failed to update modifier ingredients mapping',
            variant: 'destructive'
        })
    }
}

</script>

<template>
    <div class="rounded-md border border-[#E9EAEB] w-full flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div class="bg-gray-50 p-3 border-b border-[#E9EAEB]">
            <h3 class="font-medium text-gray-800">Ingredients Variable</h3>
        </div>
        <!-- Ingredients Variable-->
        <div v-for="(mapping, index) in modifier_option?.ingredient_mappings" class="p-2.5 flex-1 space-y-1.5">
            <div class="p-2.5 w-full h-full grid grid-cols-2 gap-2.5 rounded-lg border border-[#E9EAEB]">
                <div class="p-2.5 flex justify-between items-center w-full cursor-pointer rounded-lg border border-[#E9EAEB]">
                    <p class="text-[#181D27] text-xs font-medium leading-none">{{ mapping.ingredient?.name }}</p>
                    <!-- <Icon  @click="deleteIngredient(ingredient.id as string)" icon="heroicons:trash" class="w-4 h-4 text-gray-500" /> -->
                </div>
                
                <div class="w-full flex flex-row justify-start items-center">
                    <Select v-model="mapping.unit">
                        <SelectTrigger class="w-1/3 rounded-r-none border-r-0"> 
                            <SelectValue placeholder="unit" />
                        </SelectTrigger>
                        <SelectContent class="min-w-0">
                            <SelectItem v-for="unit in UnitMeasurementOptions" :key="unit" :value="unit" >
                            {{ unit }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        v-model="mapping.quantity"
                        type="number"
                        class="w-2/3 rounded-l-none"
                    />
                </div>
            

            </div>
        </div>

        <Button @click="addIngredientsButton()" class="mt-2.5 ml-2.5 mr-2.5 mb-2.5 flex-1 rounded-lg bg-white border border-[#4ADE80] text-[#4ADE80] space-y-1 hover:border-[#059669] hover:text-[#059669]">
            <Icon icon="heroicons:plus" class="w-4 h-4" />
            Assign Ingredients
        </Button>
        <Button v-if="modifier_option?.ingredient_mappings?.length > 0" @click="updateModifierIngredientsMapping" class="mt-2.5 ml-2.5 mr-2.5 mb-2.5 flex-1 rounded-lg bg-[#00A859] text-white space-y-1 hover:bg-[#D4552E]">
            Save Ingredients Mapping
        </Button>

        <IngredientDialog                      
            v-if="assignIngredientsDialogFormData.is_open" 
            v-model="assignIngredientsDialogFormData.is_open" 
            :selected-ingredients="assignIngredientsDialogFormData.selected_ingredients"
            @selected-ingredients="assignIngredientsToModifierOption"
        />
    </div>
</template>
