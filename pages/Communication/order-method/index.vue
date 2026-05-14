<script setup lang="ts">
import { Icon } from '@iconify/vue'

import { ref } from "vue";
import DynamicDialog from '@/components/custom/DynamicDialog.vue';
import { useToast } from '~/components/ui/toast/use-toast'
import CreateDeliveryDialog from '~/components/custom/communication/CreateDeliveryDialog.vue';
import type { Delivery } from '@/types/communication';
import ImageDialog from '@/components/custom/imageDialog.vue';

const { getMe, me } = useUsers()
const { updateDelivery, queryDeliveryWithFilters, deleteDelivery } = useCommunication();
const { toast } = useToast();

const deliveryCards = ref<Delivery[]>([]);
const openImageDialog = ref(false);

const deliveryDialog = ref({
  isOpen: false,
  isLoading: false,
  mode: 'create' as 'create' | 'edit',
  delivery: {} as Delivery,
  anyActive: {
    pickup: false,
    delivery: false,
  }
});

const search = ref('');
const filter = ref({
  delivery_type: 'all' as 'all' | 'pickup' | 'delivery',
});

const businessId = ref<string>('');

const activeCardDialog = ref({
    isOpen: false,
    title: 'Activate Delivery',
    description: 'Do you want to activate this delivery?',
    delivery: {} as Delivery
});

const deleteDialog = ref({
    isOpen: false,
    title: 'Delete Delivery',
    description: 'Are you sure you want to delete this delivery?',
    confirmationText: 'Delete',
    showConfirmationInput: true,
    delivery: {} as Delivery,
    isLoading: false
});

onMounted(async () => {
    await getMe();
    businessId.value = me.value?.business_id || '';
    await getDeliveryList();
})

watch(() => filter.value.delivery_type, async () => {
  await getDeliveryList()
})

const openDeliveryDialog = (delivery?: Delivery) => {
    if (delivery) {
        deliveryDialog.value.mode = 'edit';
        deliveryDialog.value.delivery = delivery;
    } else {
        deliveryDialog.value.anyActive = {
          pickup: deliveryCards.value.some(item => item.is_active && item.delivery_type === 'pickup'),
          delivery: deliveryCards.value.some(item => item.is_active && item.delivery_type === 'delivery'),
        };

        deliveryDialog.value.mode = 'create';
        deliveryDialog.value.delivery = {
            is_active: false,
            business_id: businessId.value,
        } as Delivery;
    }

    deliveryDialog.value.isOpen = true;
}

const getDeliveryList = async () => {
    const body:any = {
        business_id: businessId.value,
    }
    if(search.value){
        body.search = search.value
    }
    if(filter.value.delivery_type !== 'all'){
        body.filter = {
            delivery_type: filter.value.delivery_type,
        }
    }
    try {
        const response = await queryDeliveryWithFilters(body);
        deliveryCards.value = response;
    } catch (error) {
        console.error(error);
    }
}

const openActiveCardDialog = (delivery: Delivery) => {
    activeCardDialog.value.isOpen = true;
    activeCardDialog.value.delivery = delivery;
    if (delivery.is_active) {
        activeCardDialog.value.title = `Deactivate ${delivery.delivery_type}`;
        activeCardDialog.value.description = `Do you want to deactivate this ${delivery.delivery_type}?`;
    } else {
        activeCardDialog.value.title = `Activate ${delivery.delivery_type}`;
        activeCardDialog.value.description = `Do you want to activate this ${delivery.delivery_type}?`;
    }
}

const activateCard = async () => {
    activeCardDialog.value.isOpen = false;
    const delivery = activeCardDialog.value.delivery;
    delivery.is_active = !delivery.is_active;
    await updateDeliveryFunction(delivery);
    await getDeliveryList();
}

async function updateDeliveryFunction(delivery: Delivery) {
  try {
    const payload = {
      delivery_id: delivery.id,
      is_active: delivery.is_active,
      delivery_type: delivery.delivery_type as 'pickup' | 'delivery',
    }

    await updateDelivery(payload)

    const description = payload.is_active ? `${delivery.delivery_type} activated successfully` : `${delivery.delivery_type} deactivated successfully`;
    
    toast({
      title: 'Success',
      description: description,
      variant: 'success'
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to update delivery',
      variant: 'destructive'
    })
  }
}

const openDeleteDialog = (delivery: Delivery) => {
    deleteDialog.value.isOpen = true;
    deleteDialog.value.delivery = delivery;
    deleteDialog.value.title = `Delete ${delivery.delivery_type}`;
    deleteDialog.value.description = `Do you want to delete this ${delivery.delivery_type}?`;
    deleteDialog.value.confirmationText = `DELETE ${delivery.delivery_type.toUpperCase()}`;
    deleteDialog.value.showConfirmationInput = true;
}

const deleteDeliveryFunction = async (data: any) => {
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
        await deleteDelivery(deleteDialog.value.delivery.id);
        const description = deleteDialog.value.delivery.delivery_type === 'pickup' ? 'Pickup deleted successfully' : 'Delivery deleted successfully';
        toast({
            title: 'Success',
            description: description,
            variant: 'success',
        })
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to delete ' + deleteDialog.value.delivery.delivery_type,
            variant: 'destructive',
        })
    }
    await getDeliveryList();
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
                        <p class="text-md text-primary font-semibold">Order Method</p>
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
                    Order Method
                </p>
                <div class="flex items-center gap-2">
                    <!-- <button v-if="!isDraggable" class="btn-primary flex items-center gap-2" @click="isDraggable = !isDraggable" type="button">
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
                    </button> -->
                    <button class="btn-primary flex items-center gap-2" type="button" @click="openDeliveryDialog()">
                        <Icon icon="heroicons:plus" class="w-5 h-5" />
                        Create Pickup / Delivery
                    </button>
                </div>
            </div>

            <div>
                <div class="border-t border-dashed border-gray-300"></div>
                <div class="flex items-center gap-2 w-full my-2 justify-end">
                    <!-- <div class="relative w-full">
                        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Icon icon="heroicons:magnifying-glass" class="w-5 h-5" />
                        </span>
                        <input
                            v-model="search"
                            type="text"
                            placeholder="Search by onboarding..."
                            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black w-full transition"
                        />
                    </div> -->
                    <div class="w-1/6">
                      <Select v-model="filter.delivery_type">
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
                <div class="border-t border-dashed border-gray-300"></div>
            </div>
        </div>

        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="element in deliveryCards"
            :key="element.id"
            class="relative h-full"
          >
            <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center relative h-full min-h-[400px]">
                <!-- Floating button -->
                <div class="absolute top-6 right-6" style="z-index: 20;">
                  <div class="relative" @click.stop>
                    <button
                      class="btn-primary-outline p-2 rounded-md"
                      type="button"
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
                        @click="openDeliveryDialog(element); element._showDropdown = false"
                      >
                        Edit
                      </button>
                      <button
                        v-if="!element.is_active"
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
                <div class="w-full h-[280px] mb-4 rounded-md overflow-hidden flex items-center justify-center bg-gray-100 relative group">
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

                <div class="w-full flex items-center justify-center my-2">
                  <span
                    class="text-lg font-bold capitalize"
                  >
                    {{ element.delivery_type }}
                  </span>
                </div>

                <!-- Action -->
                <button
                    class="mt-4 w-full flex items-center justify-center"
                    :class="{ 'btn-primary': element.is_active, 'btn-primary-outline': !element.is_active }"
                    type="button"
                    @click="!element.is_active ? openActiveCardDialog(element) : null"
                    >
                    {{ element.is_active ? 'Active' : 'Inactive' }}
                </button>
            </div>
          </div>
        </div>

    </div>

    <CreateDeliveryDialog
      :isOpen="deliveryDialog.isOpen"
      :isLoading="deliveryDialog.isLoading"
      :businessId="businessId"
      :mode="deliveryDialog.mode"
      :delivery="deliveryDialog.delivery"
      :anyActive="deliveryDialog.anyActive"
      @update:isOpen="deliveryDialog.isOpen = $event"
      @submit="getDeliveryList"
    />
    
    <DynamicDialog
      :isOpen="deleteDialog.isOpen"
      :title="deleteDialog.title"
      :description="deleteDialog.description"
      :confirmationText="deleteDialog.confirmationText"
      :showConfirmationInput="deleteDialog.showConfirmationInput"
      @cancel="deleteDialog.isOpen = false"
      @confirm="deleteDeliveryFunction"
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
