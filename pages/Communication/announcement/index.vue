<script setup lang="ts">
import { Icon } from '@iconify/vue'

import { ref } from "vue";
import CreateAnnouncementDialog from '@/components/custom/communication/CreateAnnouncementDialog.vue'
import type { Announcement } from '@/types/communication';
import DynamicDialog from '@/components/custom/DynamicDialog.vue';
import { useToast } from '~/components/ui/toast/use-toast'
import ImageDialog from '@/components/custom/imageDialog.vue';

const { getMe, me } = useUsers()
const openImageDialog = ref(false);
const { updateAnnouncement, deleteAnnouncement, queryAnnouncementWithFilters } = useCommunication();
const { toast } = useToast();

const announcementCards = ref<Announcement[]>([]);

const announcementDialog = ref({
  isOpen: false,
  isLoading: false,
  mode: 'create' as 'create' | 'edit',
  announcement: {} as Announcement
});

const search = ref('');
const filter = ref({
  status: 'all' as 'all' | 'active' | 'inactive' | 'expired',
});

const businessId = ref<string>('');

const activeCardDialog = ref({
    isOpen: false,
    title: 'Activate Announcement',
    description: 'Are you sure you want to activate this announcement?',
    announcement: {} as Announcement
});

const deleteDialog = ref({
    isOpen: false,
    title: 'Delete Announcement',
    description: 'Are you sure you want to delete this announcement?',
    confirmationText: 'Delete',
    showConfirmationInput: true,
    announcement: {} as Announcement,
    isLoading: false
});

onMounted(async () => {
    await getMe();
    businessId.value = me.value?.business_id || '';
    await getAnnouncementList();
})

let debounceTimer: any = null
watch(search, (newVal: string) => {
  clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    getAnnouncementList()
  }, 500) // Delay in milliseconds
})

watch(() => filter.value.status, async () => {
  await getAnnouncementList()
})

watch(businessId, async (newVal) => {
  if (newVal) {
    await getAnnouncementList()
  }
})

const openOnboardingDialog = (announcement?: Announcement) => {
  if (announcement) {
        announcementDialog.value.mode = 'edit';
        announcementDialog.value.announcement = announcement;
    } else {
        announcementDialog.value.mode = 'create';
        announcementDialog.value.announcement = {
            is_active: true,
            business_id: businessId.value,
        } as Announcement;
    }

    announcementDialog.value.isOpen = true;
}

const getAnnouncementList = async () => {
    if (!businessId.value) return;

    const body:any = {
        business_id: businessId.value,
    }
    if(search.value){
        body.search = search.value
    }
    if(filter.value.status !== 'all'){
        body.filter = {
            status: filter.value.status
        }
    }
    try {
        const response = await queryAnnouncementWithFilters(body);
        announcementCards.value = response;
    } catch (error) {
        console.error(error);
    }
}

const openActiveCardDialog = (announcement: Announcement) => {
    activeCardDialog.value.isOpen = true;
    activeCardDialog.value.announcement = announcement;
    if (announcement.is_active) {
        activeCardDialog.value.title = 'Deactivate Announcement';
        activeCardDialog.value.description = `Do you want to deactivate this announcement?`;
    } else {
        activeCardDialog.value.title = 'Activate Announcement';
        activeCardDialog.value.description = `Do you want to activate this announcement?`;
    }
}

const activateCard = async () => {
    activeCardDialog.value.isOpen = false;
    const announcement = activeCardDialog.value.announcement;
    announcement.is_active = !announcement.is_active;
    await updateAnnouncementFunction(announcement);
    await getAnnouncementList();
}

async function updateAnnouncementFunction(announcement: Announcement) {
  try {
    const payload = {
      announcement_id: announcement.id,
      is_active: announcement.is_active,
      start_date: announcement.start_date || '',
      end_date: announcement.end_date || '',
      title: announcement.title,
      description: announcement.description,
    }

    await updateAnnouncement(payload)

    const description = payload.is_active ? 'Announcement activated successfully' : 'Announcement deactivated successfully';
    
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

const openDeleteDialog = (announcement: Announcement) => {
    deleteDialog.value.isOpen = true;
    deleteDialog.value.announcement = announcement;
    deleteDialog.value.title = 'Delete Announcement';
    deleteDialog.value.description = `Do you want to delete this announcement?`;
    deleteDialog.value.confirmationText = 'DELETE ANNOUNCEMENT';
    deleteDialog.value.showConfirmationInput = true;
}

const deleteAnnouncementFunction = async (data: any) => {
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
        await deleteAnnouncement(deleteDialog.value.announcement.id);
        toast({
            title: 'Success',
            description: 'Announcement deleted successfully',
            variant: 'success',
        })
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to delete announcement',
            variant: 'destructive',
        })
    }
    await getAnnouncementList();
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
                        <p class="text-md text-primary font-semibold">Announcement</p>
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
                    Announcement
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
                    <button class="btn-primary flex items-center gap-2" type="button" @click="openOnboardingDialog()">
                        <Icon icon="heroicons:plus" class="w-5 h-5" />
                        Create Announcement
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
                            placeholder="Search by announcement..."
                            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black w-full transition"
                        />
                    </div>
                    <div class="w-1/6">
                      <Select v-model="filter.status">
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </div>
                <div class="border-t border-dashed border-gray-300"></div>
            </div>
        </div>

        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            v-for="element in announcementCards"
            :key="element.id"
            class="relative h-full"
          >
            <div
              class="bg-white rounded-lg shadow p-4 flex flex-col items-center relative h-full min-h-[400px]"
              :class="{ 'grayscale': element.end_date && new Date(element.end_date) < new Date() }"
            >
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

                <!-- Title -->
                <div class="w-full flex items-center justify-center">
                  <p class="text-lg font-semibold text-gray-800 mb-2 text-center flex items-center justify-center w-full">
                    {{ element.title }}
                  </p>
                </div>

                <div class="w-full flex items-center justify-center">
                  <p class="text-sm text-gray-500">
                    {{
                      (element.start_date
                        ? (() => {
                            const d = new Date(element.start_date);
                            return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
                          })()
                        : ''
                      ) +
                      ' - ' +
                      (element.end_date
                        ? (() => {
                            const d = new Date(element.end_date);
                            return `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
                          })()
                        : ''
                      )
                    }}
                  </p>
                </div>

                <!-- Action -->
                <button
                    :disabled="!!(element.end_date && new Date(element.end_date) < new Date())"
                    class="mt-4 w-full flex items-center justify-center"
                    :class="{ 'btn-primary': element.is_active, 'btn-primary-outline': !element.is_active }"
                    type="button"
                    @click="openActiveCardDialog(element)"
                    >
                    <!-- INSERT_YOUR_CODE -->
                    <span v-if="element.end_date && new Date(element.end_date) < new Date()" class="font-semibold">Expired</span>
                    <span v-else>{{ element.is_active ? 'Active' : 'Inactive' }}</span>
                </button>
            </div>
          </div>
        </div>

    </div>

    <CreateAnnouncementDialog
      :isOpen="announcementDialog.isOpen"
      :isLoading="announcementDialog.isLoading"
      :businessId="businessId"
      :mode="announcementDialog.mode"
      :announcement="announcementDialog.announcement"
      @update:isOpen="announcementDialog.isOpen = $event"
      @submit="getAnnouncementList"
    />
    
    <DynamicDialog
      :isOpen="deleteDialog.isOpen"
      :title="deleteDialog.title"
      :description="deleteDialog.description"
      :confirmationText="deleteDialog.confirmationText"
      :showConfirmationInput="deleteDialog.showConfirmationInput"
      @cancel="deleteDialog.isOpen = false"
      @confirm="deleteAnnouncementFunction"
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
