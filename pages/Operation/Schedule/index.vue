<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useOutlets } from "@/composables/useOutlets";
import type { Option } from "@/types/common";
import { useOutletOperation } from "@/composables/useOutletOperation";
import { useToast } from "@/components/ui/toast/use-toast";
import type { OutletOperationSchedule } from "@/types/outlet";
import DynamicDialog from "@/components/custom/DynamicDialog.vue";

const { getOutletsOptions } = useOutlets()
const { getOutletOperationSchedule, updateOutletOperationSchedule, updateAllOutletOperationSchedule } = useOutletOperation()
const { toast } = useToast();

const { myProfile } = useMyProfileStore() 

const outletOptions = ref<Option[]>([])
const selectedOutlet = ref<string>('All Outlets')

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

const schedule = ref<OutletOperationSchedule[]>(
[]);

// -- Edit State --
const isEditing = ref(false);
const isLoading = ref(false);

const updateAllOutletOperationScheduleDialogData = ref({
  isOpen: false,
  title: 'Update All Outlet Operation Schedule',
  description: 'Are you sure you want to update all outlet operation schedule? Any specific outlet schedules will be overridden.',
  confirmationText: 'Update All Outlet Operation Schedule',
  showConfirmationInput: true,
  isLoading: false,
})

onMounted(async () => {
  await queryOutletOptions()
  const firstOutlet = outletOptions.value[0]
  if (firstOutlet) {
    await queryOutletOperationSchedule(firstOutlet.id)
  }
})

watch(selectedOutlet, async () => {
  if (selectedOutlet.value !== 'All Outlets') {
    await queryOutletOperationSchedule(selectedOutlet.value)
  } else {
    const firstOutlet = outletOptions.value[0]
    if (firstOutlet) {
      await queryOutletOperationSchedule(firstOutlet.id)
    }
  }
})

function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
}

function saveEdit() {
  if (selectedOutlet.value === 'All Outlets') {
    updateAllOutletOperationScheduleDialogData.value.isOpen = true
  } else {
    triggerUpdateOutletOperationSchedule()
  }
  isEditing.value = false;
}

async function queryOutletOptions() {
  try {
    const res = await getOutletsOptions(myProfile?.business_id as string)
    outletOptions.value = res || []
  } catch (e) {
  }
}

async function queryOutletOperationSchedule(outletId: string) {
  try {
    const res = await getOutletOperationSchedule(outletId)
    // Arrange by day of week
    schedule.value = res.data

    schedule.value = schedule.value.sort((a, b) => daysOfWeek.indexOf(a.day_of_week) - daysOfWeek.indexOf(b.day_of_week))
  } catch (e) {
    schedule.value = []
  }
}

async function triggerUpdateOutletOperationSchedule() {
  isLoading.value = true
  try {
    const schedules: OutletOperationSchedule[] = schedule.value.map(item => ({
      ...item,
      open_time: new Date(`2025-01-01T${item.open_time}`).toISOString(),
      close_time: new Date(`2025-01-01T${item.close_time}`).toISOString(),
    }))
    await updateOutletOperationSchedule(selectedOutlet.value, schedules)
    toast({
      title: 'Success',
      description: 'Outlet operation schedule updated successfully',
      variant: 'success',
    })
  } catch (e) {
    toast({
      title: 'Error',
      description: 'Failed to update outlet operation schedule',
      variant: 'destructive',
    })
  }
  isLoading.value = false
}

async function triggerUpdateAllOutletOperationSchedule(data: any) {
  const confirmation = data as string
  if(confirmation != updateAllOutletOperationScheduleDialogData.value.confirmationText){
    toast({
      title: 'Error',
      description: 'Invalid confirmation',
      variant: 'destructive',
    })
    return
  }

  updateAllOutletOperationScheduleDialogData.value.isLoading = true
  try {
    const schedules: OutletOperationSchedule[] = schedule.value.map(item => ({
      ...item,
      open_time: new Date(`2025-01-01T${item.open_time}`).toISOString(),
      close_time: new Date(`2025-01-01T${item.close_time}`).toISOString(),
    }))
    await updateAllOutletOperationSchedule({ business_id: myProfile?.business_id as string, operation_schedules: schedules })
    toast({
      title: 'Success',
      description: 'All outlet operation schedule updated successfully',
      variant: 'success',
    })
  } catch (e) {
    toast({
      title: 'Error',
      description: 'Failed to update all outlet operation schedule',
      variant: 'destructive',
    })
  }
  updateAllOutletOperationScheduleDialogData.value.isLoading = false
  updateAllOutletOperationScheduleDialogData.value.isOpen = false
}

</script>

<template>
  <div class="w-full h-full">
    <div class="bg-white shadow-md rounded-b-xl border-t py-5 px-8 mt-2 z-10 relative flex items-center">
      <div class="flex-1 min-w-0">
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
                <p class="text-md text-gray-500">Operation</p>
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <p class="text-md text-primary font-semibold">Schedule</p>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>

    <div class="py-6 px-12 bg-gray-100 min-h-screen">
      <div class="bg-white rounded-lg p-4 flex flex-col gap-4">
        <!-- Header title of page -->
        <div class="flex items-center justify-between w-full gap-4">
            <p class="text-lg ml-3">
              Operation Schedule
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
                <button class="btn-primary flex items-center gap-2"
                  v-if="!isEditing"
                  type="button" @click="startEdit">
                  <Icon icon="heroicons:pencil-square" class="w-5 h-5" />
                  Edit Schedule
                </button>
            </div>
        </div>

        <div>
            <div class="border-t border-dashed border-gray-300"></div>
            <!-- <div class="flex items-center gap-2 w-full my-2">
                <div class="relative w-full">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Icon icon="heroicons:magnifying-glass" class="w-5 h-5" />
                    </span>
                    <input
                        v-model="search"
                        type="text"
                        placeholder="Search by ranking..."
                        class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black w-full transition"
                    />
                </div>
            </div> -->

            <div class="flex items-center gap-2 w-full my-2 justify-end">
              <div class="w-1/6">
                <Select v-model="selectedOutlet">
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Outlets">All Outlets</SelectItem>
                    <SelectItem v-for="outlet in outletOptions" :key="outlet.id" :value="outlet.id">
                      {{ outlet.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="border-t border-dashed border-gray-300"></div>
        </div>
      </div>

      <div class="py-8">
        <div class="bg-white rounded-xl p-6 shadow-lg flex flex-col gap-8 mx-auto">

          <div class="flex items-center justify-between">
            <p class="text-2xl font-bold text-gray-900">
              <span v-if="selectedOutlet !== 'All Outlets'">{{ outletOptions.find(outlet => outlet.id === selectedOutlet)?.name }} </span>
              <span v-else>General </span>
              Schedule
            </p>
            <div v-if="isEditing" class="flex gap-2">
              <button 
                @click="cancelEdit"
                class="px-4 py-2 rounded-lg border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                :disabled="isLoading"
                @click="saveEdit"
                class="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary-dark transition"
              >
                {{ isLoading ? 'Saving...' : 'Save' }} <Icon icon="mdi:loading" v-if="isLoading" class="animate-spin" />
              </button>
            </div>
          </div>

          <div class="border-t border-dashed border-gray-300"></div>

          <div class="overflow-x-auto">
            <table class="w-full whitespace-nowrap text-left border-separate [border-spacing:0_0.5rem]">
              <thead>
                <tr class="text-xs font-bold tracking-wide text-gray-700 uppercase bg-gray-50">
                  <th class="py-2 px-4 rounded-l-lg">Day</th>
                  <th class="py-2 px-4">Open</th>
                  <th class="py-2 px-4">Close</th>
                  <th v-if="isEditing" class="py-2 px-4 rounded-r-lg text-center">Closed</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(item, idx) in schedule"
                  :key="item.day_of_week"
                  class="bg-white hover:shadow-sm rounded-xl transition"
                >
                  <td class="py-3 px-4 rounded-l-lg font-medium text-gray-900">
                    <span class="capitalize">{{ item.day_of_week.charAt(0).toUpperCase() + item.day_of_week.slice(1) }}</span>
                  </td>
                  <td class="py-3 px-4">
                    <template v-if="isEditing">
                      <input
                        v-if="!item.is_closed"
                        v-model="item.open_time"
                        type="time"
                        class="w-28 px-2 py-1 rounded border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span v-else class="text-gray-400 italic pl-1">Closed</span>
                    </template>
                    <template v-else>
                      <span v-if="!item.is_closed" class="font-mono text-blue-700">{{ item.open_time?.slice(0,5) }}</span>
                      <span v-else class="text-gray-400 italic">Closed</span>
                    </template>
                  </td>
                  <td class="py-3 px-4">
                    <template v-if="isEditing">
                      <input
                        v-if="!item.is_closed"
                        v-model="item.close_time"
                        type="time"
                        class="w-28 px-2 py-1 rounded border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span v-else class="text-gray-400 italic pl-1">Closed</span>
                    </template>
                    <template v-else>
                      <span v-if="!item.is_closed" class="font-mono text-blue-700">{{ item.close_time?.slice(0,5) }}</span>
                      <span v-else class="text-gray-400 italic">Closed</span>
                    </template>
                  </td>
                  <td 
                    v-if="isEditing"
                    class="py-3 px-4 rounded-r-lg text-center"
                  >
                    <label class="inline-flex items-center cursor-pointer select-none gap-2">
                      <input 
                        type="checkbox"
                        v-model="item.is_closed"
                        class="form-checkbox h-5 w-5 text-primary focus:ring-primary border-gray-200"
                      />
                      <span class="text-sm text-gray-600">
                        Closed
                      </span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
    
    <DynamicDialog
      :isOpen="updateAllOutletOperationScheduleDialogData.isOpen"
      :title="updateAllOutletOperationScheduleDialogData.title"
      :description="updateAllOutletOperationScheduleDialogData.description"
      :confirmationText="updateAllOutletOperationScheduleDialogData.confirmationText"
      :showConfirmationInput="updateAllOutletOperationScheduleDialogData.showConfirmationInput"
      :isLoading="updateAllOutletOperationScheduleDialogData.isLoading"
      @cancel="updateAllOutletOperationScheduleDialogData.isOpen = false"
      @confirm="triggerUpdateAllOutletOperationSchedule"
    />
  </div>

</template>
