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

const { addProduct, uploadProductImage } = useMenu()
const { toast } = useToast()
const { me, getMe } = useUsers()
const { getModifierList } = useMenu()

// Define props with modelValue for v-model support
const props = defineProps<{
  modelValue: boolean
}>()

const imageFile = ref<File | null>(null)

// Define emit for v-model support
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'selectedModifiers', modifiers: ModifierGroup[]): void
}>()

const modifierList = ref<ModifierGroup[]>([])
const selectedModifiers = ref<ModifierGroup[]>([])

onMounted(async () => {
    await getMe()
    try {
        const response = await getModifierList(me.value?.business_id as string) as {
            data: ModifierGroup[]
            message: string
        }
        console.log("API Response:", response)
        if (response.data) {
            modifierList.value = response.data
        }
    } catch (error) {
        console.error("Failed to fetch modifiers:", error)
    }
})


// Create a computed property for the dialog state
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const toggleModifier = (modifier: ModifierGroup) => {
    console.log("Toggling modifier:", modifier)
    console.log("Selected modifiers:", selectedModifiers.value)
    const isSelected = selectedModifiers.value.some(m => m.id === modifier.id)
    if (isSelected) {
        selectedModifiers.value = selectedModifiers.value.filter(m => m.id !== modifier.id)
    } else {
        selectedModifiers.value.push(modifier)
    }
    console.log("Selected modifiers after update:", selectedModifiers.value)
}

const isModifierSelected = (modifierId: string) => {
    return computed({
        get: () => selectedModifiers.value.some(m => m.id === modifierId),
        set: (value: boolean) => {
            const modifier = modifierList.value.find(m => m.id === modifierId)
            if (modifier) {
                if (value && !selectedModifiers.value.some(m => m.id === modifierId)) {
                    selectedModifiers.value.push(modifier)
                } else if (!value) {
                    selectedModifiers.value = selectedModifiers.value.filter(m => m.id !== modifierId)
                }
                console.log("Selected modifiers after update:", selectedModifiers.value)
            }
        }
    })
}

const saveModifiers = () => {
    emit('selectedModifiers', selectedModifiers.value)
    dialogOpen.value = false
}

/* const submitForm = async() => {
    const businessID = me.value?.business_id as string
    // validate formData
    const errors = Object.entries(validationSchema)
    .filter(([_, { condition }]) => condition())
    .map(([_, { message }]) => message)
    
    if (errors.length > 0) {
        toast({
            title: 'Validation Errors',
            description: errors[0],
            variant: 'destructive'
        })
        return
    }

    // Create a deep copy of formData to avoid modifying the original
    const formDataCopy = JSON.parse(JSON.stringify(formData));
    
    // Convert user-friendly input types back to technical values
    formDataCopy.customization_groups.forEach((group: any) => {
        // Convert "Select One Option Only" to "Radio" and "Select Multiple Options" to "Checkbox"
        group.input_type = getInputTypeKey(group.input_type);
    });
    // convert formData to Product type
    const product : Product = {
        id: "",
        business_id: businessID,
        name: formDataCopy.name.trim(),
        description: formDataCopy.description.trim(),
        cost: Number(formDataCopy.cost),
        base_price: Number(formDataCopy.base_price),
        price: Number(formDataCopy.price),
        product_category: formDataCopy.category,
        product_sub_category: formDataCopy.subcategory,
        customization_groups: formDataCopy.customization_groups,
    }
    try {
        const addedProduct = await addProduct(product) as Product
        if(imageFile.value){
            await uploadProductImage(addedProduct.id, imageFile.value)
        }
        toast({
            title: 'Product Added',
            description: 'Product added successfully',
            variant: 'success'
        })
        clearForm()
        dialogOpen.value = false
    } catch (error: any) {
        toast({
            title: 'Error',
            description: 'Failed to add product',
            variant: 'destructive'
        })
    }
} */
</script>

<template>
    <Dialog :open="dialogOpen" @update:open="dialogOpen = $event">
        <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <div class="flex justify-start items-center space-x-3">
                    <div class="flex flex-col justify-center items-start">
                        <DialogTitle class="text-2xl font-bold">Product Modifier</DialogTitle>
                        <DialogDescription class="text-sm text-gray-500">Option or customization that can be added to a base product to change.</DialogDescription>
                    </div>
                </div>
                
            </DialogHeader>

            <br>

            <div class="w-full grid grid-cols-3 gap-2.5">
                <div v-for="modifier in modifierList" :key="modifier.id" class="p-[5px] w-full h-full rounded-lg flex flex-row items-center justify-start border border-[#E9EAEB]" :class="{'bg-[#FDF5EF]': isModifierSelected(modifier.id as string).value}">
                    <!-- checkbox -->
                    <div class="w-1/6 h-full rounded-lg flex justify-center items-start">
                        <input 
                            type="checkbox" 
                            :id="modifier.id" 
                            :checked="isModifierSelected(modifier.id as string).value"
                            @change="toggleModifier(modifier)"
                            class="h-4 w-4 rounded-sm border border-[#D5D7DA] text-[#00A859] focus:ring-[#00A859] "
                        />
                    </div>
                    <!-- modifier group with options -->
                    <div class="w-5/6 h-full rounded-lg">
                        <!-- modifier group name -->
                        <p class="text-center text-xs font-medium leading-none text-[#00A859]">{{ modifier.name }}</p>
                        <!-- modifier group options -->
                        <div v-for="option in modifier.modifier_options" :key="option.id">
                            <p class="text-xs font-normal leading-none text-[#A4A7AE]">{{ option.name }}</p>
                        </div>

                    </div>
                </div>


            </div>

            <div class="flex justify-end items-center space-x-2.5 mt-5">
                <!-- button -->
                <div class="max-w-[200px] grid grid-cols-2 gap-2.5">
                    <Button variant="outline" @click="dialogOpen = false" class="w-full h-full rounded-lg bg-[#00A859] text-white">Cancel</Button>
                    <Button variant="outline" @click="saveModifiers" class="w-full h-full rounded-lg bg-[#00A859] text-white">Save</Button>
                </div>
            

            </div>
        </DialogContent>
    </Dialog>
</template>

