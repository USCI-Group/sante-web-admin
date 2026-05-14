<script setup lang="ts">
import { Icon } from '@iconify/vue'

import { ref } from "vue";
import draggable from "vuedraggable";
import CreateOnboardingDialog from '@/components/custom/communication/CreateOnboardingDialog.vue'
import type { Onboarding } from '@/types/communication';
import DynamicDialog from '@/components/custom/DynamicDialog.vue';
import { useToast } from '~/components/ui/toast/use-toast'
import ImageDialog from '@/components/custom/imageDialog.vue';

const { myProfile } = useMyProfileStore()
const { updateOnboarding, updateOnboardingMultiple, deleteOnboarding, queryOnboardingWithFilters } = useCommunication();
const { toast } = useToast();

const openImageDialog = ref(false);
// Example data (replace with your real items)
const onboardingCards = ref<Onboarding[]>([]);

const isDraggable = ref(false);

const onboardingDialog = ref({
  isOpen: false,
  isLoading: false,
  mode: 'create' as 'create' | 'edit',
  onboarding: {} as Onboarding
});

const search = ref('');

const businessId = ref<string>('');

const activeCardDialog = ref({
    isOpen: false,
    title: 'Activate Onboarding',
    description: 'Are you sure you want to activate this onboarding?',
    onboarding: {} as Onboarding
});

const deleteDialog = ref({
    isOpen: false,
    title: 'Delete Onboarding',
    description: 'Are you sure you want to delete this onboarding?',
    confirmationText: 'Delete',
    showConfirmationInput: true,
    onboarding: {} as Onboarding,
    isLoading: false
});

onMounted(async () => {
    businessId.value = myProfile?.business_id as string;
    await getOnboardingList();
})

watch(isDraggable, async () => {
    if (!isDraggable.value) {
        await updateOnboardingOrder();
    }
})

watch(businessId, async (newVal) => {
    if (newVal) {
        await getOnboardingList()
    }
})

let debounceTimer: any = null
watch(search, (newVal: string) => {
  clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    getOnboardingList()
  }, 500) // Delay in milliseconds
})

const updateOnboardingOrder = async () => {
    const onboardingList = onboardingCards.value.map((onboarding, index) => {
        return {
            ...onboarding,
            sort_order: index + 1
        }
    })

    try {
        await updateOnboardingMultiple(onboardingList);
        toast({
            title: 'Success',
            description: 'Onboarding order updated successfully',
            variant: 'success'
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error?.data?.message || 'Failed to update onboarding order',
            variant: 'destructive'
        })
    }
}

const openOnboardingDialog = (onboarding?: Onboarding) => {
    if (onboarding) {
        onboardingDialog.value.mode = 'edit';
        onboardingDialog.value.onboarding = onboarding;
    } else {
        onboardingDialog.value.mode = 'create';
        onboardingDialog.value.onboarding = {
            is_active: true,
            business_id: businessId.value,
            title: '',
            description: ''
        } as Onboarding;
    }

    onboardingDialog.value.isOpen = true;
}

const getOnboardingList = async () => {
    if (!businessId.value) return;

    const body:any = {
        business_id: businessId.value,
    }
    if(search.value){
        body.search = search.value
    }
    try {
        const response = await queryOnboardingWithFilters(body);
        onboardingCards.value = response;
    } catch (error) {
        console.error(error);
    }
}

const openActiveCardDialog = (onboarding: Onboarding) => {
    activeCardDialog.value.isOpen = true;
    activeCardDialog.value.onboarding = onboarding;
    if (onboarding.is_active) {
        activeCardDialog.value.title = 'Deactivate Onboarding';
        activeCardDialog.value.description = `Do you want to deactivate "${onboarding.title}"?`;
    } else {
        activeCardDialog.value.title = 'Activate Onboarding';
        activeCardDialog.value.description = `Do you want to activate "${onboarding.title}"?`;
    }
}

const activateCard = async () => {
    activeCardDialog.value.isOpen = false;
    const onboarding = activeCardDialog.value.onboarding;
    onboarding.is_active = !onboarding.is_active;
    await updateOnboardingFunction(onboarding);
    await getOnboardingList();
}

async function updateOnboardingFunction(payload: Onboarding) {
  try {
    await updateOnboarding(payload)

    const description = payload.is_active ? 'Onboarding activated successfully' : 'Onboarding deactivated successfully';
    
    toast({
      title: 'Success',
      description: description,
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to update onboarding',
      variant: 'destructive'
    })
  }
}

const openDeleteDialog = (onboarding: Onboarding) => {
    deleteDialog.value.isOpen = true;
    deleteDialog.value.onboarding = onboarding;
    deleteDialog.value.title = 'Delete Onboarding';
    deleteDialog.value.description = `Do you want to delete "${onboarding.title}"?`;
    deleteDialog.value.confirmationText = 'Delete '+onboarding.title;
    deleteDialog.value.showConfirmationInput = true;
}

const deleteOnboardingFunction = async (data: any) => {
    const confirmation = data as string
    if(confirmation != deleteDialog.value.confirmationText){
        toast({
            title: 'Error',
            description: 'Invalid confirmation',
            variant: 'destructive',
        })
        return
    }
    try {
        await deleteOnboarding(deleteDialog.value.onboarding.id);
        toast({
            title: 'Success',
            description: 'Onboarding deleted successfully',
            variant: 'success',
        })
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to delete onboarding',
            variant: 'destructive',
        })
    }
    await getOnboardingList();
    deleteDialog.value.isOpen = false;
}

</script>

<template>
<div class="w-full h-full">
    <div class="bg-white shadow border-t py-4 px-10 mt-2 z-10 relative">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink>
                        <NuxtLink to="/">
                            <p class="text-md">Home</p>
                        </NuxtLink>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <p class="text-md text-gray-500">Communication Settings</p>
                    </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>
                        <p class="text-md text-primary font-semibold">Onboarding</p>
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    </div>

    <div class="py-6 px-12 bg-gray-100 min-h-screen">
        <div class="bg-white rounded-lg p-4 flex flex-col gap-4">
            <!-- Header title of page -->
            <div class="flex items-center justify-between w-full gap-4">
                <p class="text-lg ml-3">
                    Onboarding
                </p>
                <div class="flex items-center gap-2">
                    <button v-if="!isDraggable && onboardingCards.length > 0" class="btn-primary flex items-center gap-2" @click="isDraggable = !isDraggable" type="button">
                        <Icon icon="heroicons:bars-4" class="w-5 h-5" />
                        Arrange Order
                    </button>
                    <button
                        v-if="isDraggable"
                        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-all duration-200"
                        @click="isDraggable = !isDraggable"
                        type="button"
                    >
                        Save
                    </button>
                    <button class="btn-primary flex items-center gap-2" type="button" @click="openOnboardingDialog()">
                        <Icon icon="heroicons:plus" class="w-5 h-5" />
                        Create Onboarding
                    </button>
                </div>
            </div>

            <div>
                <div class="border-t border-dashed border-gray-300"></div>
                <div class="flex items-center gap-2 w-full my-2">
                    <div class="relative w-full">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Icon icon="heroicons:magnifying-glass" class="w-5 h-5" />
                        </span>
                        <input
                            v-model="search"
                            type="text"
                            placeholder="Search by onboarding..."
                            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black w-full transition"
                        />
                    </div>
                </div>
                <div class="border-t border-dashed border-gray-300"></div>
            </div>
        </div>

        <draggable
            :disabled="!isDraggable"
            v-model="onboardingCards"
            item-key="id"
            animation="200"
            class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
            <template #item="{ element }">
            <div class="relative h-full">
                <Icon
                  v-if="isDraggable"
                  icon="heroicons:arrows-pointing-out"
                  class="w-16 h-16 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-move text-gray-700 rotate-45"
                  title="Drag to reorder"
                />
                <div
                    v-if="isDraggable"
                    class="absolute -left-4 top-1 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 bg-black text-white rounded-full shadow text-base font-bold"
                    style="pointer-events: none;"
                >
                  {{ onboardingCards.findIndex(card => card.id === element.id) + 1 }}
                </div>

                <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center relative h-full min-h-[420px]" :class="{ 'opacity-50': isDraggable }">
                    <!-- Floating button -->
                    <div class="absolute top-6 right-6" style="z-index: 20;">
                      <div class="relative" @click.stop>
                        <button
                          class="btn-primary-outline p-2 rounded-md"
                          type="button"
                          :disabled="isDraggable"
                          @click="element._showDropdown = !element._showDropdown"
                        >
                          <Icon icon="heroicons:ellipsis-horizontal" class="w-7 h-7" />
                        </button>
                        <div
                          v-if="element._showDropdown"
                          class="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-50"
                        >
                          <button
                            class="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                            type="button"
                            @click="openOnboardingDialog(element); element._showDropdown = false"
                          >
                            Edit
                          </button>
                          <button
                            class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                            type="button"
                            @click="openDeleteDialog(element); element._showDropdown = false"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Image -->
                    <div class="w-full h-[250px] mb-4 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 relative group">
                      <img
                        :src="element.image_url"
                        alt="Onboarding Example"
                        class="w-full h-full object-cover"
                      />
                      <ImageDialog
                            :imageUrl="element.image_url || ''"
                            :isOpen="openImageDialog"
                            @update:isOpen="openImageDialog = $event"
                        />
                    </div>
    
                    <!-- Text -->
                    <div class="flex flex-col flex-1 w-full items-center">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2 text-center min-h-[2.5rem] flex items-center justify-center w-full">{{ element.title }}</h3>
                        <p class="text-gray-500 text-sm text-center flex-1 w-full min-h-[3.5rem] flex items-top justify-center">
                            {{ element.description }}
                        </p>
                    </div>
    
                    <!-- Action -->
                    <button
                        class="mt-4 w-full flex items-center justify-center"
                        :class="{ 'btn-primary': element.is_active, 'btn-primary-outline': !element.is_active }"
                        type="button"
                        :disabled="isDraggable"
                        @click="openActiveCardDialog(element)"
                        >
                        {{ element.is_active ? 'Active' : 'Inactive' }}
                    </button>
                </div>
            </div>
            </template>
        </draggable>

    </div>

    <CreateOnboardingDialog
      :isOpen="onboardingDialog.isOpen"
      :isLoading="onboardingDialog.isLoading"
      :businessId="businessId"
      :mode="onboardingDialog.mode"
      :onboarding="onboardingDialog.onboarding"
      @update:isOpen="onboardingDialog.isOpen = $event"
      @submit="getOnboardingList"
    />
    
    <DynamicDialog
      :isOpen="deleteDialog.isOpen"
      :title="deleteDialog.title"
      :description="deleteDialog.description"
      :confirmationText="deleteDialog.confirmationText"
      :showConfirmationInput="deleteDialog.showConfirmationInput"
      @cancel="deleteDialog.isOpen = false"
      @confirm="deleteOnboardingFunction"
    />

    <DynamicDialog
      :isOpen="activeCardDialog.isOpen"
      :title="activeCardDialog.title"
      :description="activeCardDialog.description"
      @cancel="activeCardDialog.isOpen = false"
      @confirm="activateCard()"
    />
</div>
</template>
