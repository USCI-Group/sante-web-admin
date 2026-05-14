<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useOutlets } from "@/composables/useOutlets";
import type { Option } from "@/types/common";
import { useOutletOperation } from "@/composables/useOutletOperation";
import { useToast } from "@/components/ui/toast/use-toast";
import type { OutletOperationTimeSlot } from "@/types/outlet";
import DynamicDialog from "@/components/custom/DynamicDialog.vue";

// --- EXISTING QUERIES/METHODS ---
const { getOutletsOptions } = useOutlets()
const {
  getPickupTimeSlot,
  toggleSlotAvailability,
} = useOutletOperation()
const { toast } = useToast();

const { myProfile } = useMyProfileStore()

const outletOptions = ref<Option[]>([])
const selectedOutlet = ref<string>('All Outlets')

// Store slot data by outlet id
const slotListByOutlet = ref<Map<string, OutletOperationTimeSlot[]>>(new Map());

// Edit, loading, dialog states
const isEditing = ref(false);
const isLoading = ref(false);

const updateAllOutletOperationScheduleDialogData = ref({
  isOpen: false,
  title: 'Update All Outlet Operation Schedule',
  description: 'Are you sure you want to update all outlet operation schedule? Any specific outlet schedules will be overridden.',
  confirmationText: 'Update All Outlet Operation Schedule',
  showConfirmationInput: true,
  isLoading: false,
});

// --- DUMMY DATA FALLBACK (for demo, fallback used if no real data) ---
// generates slots every 30 min from 10:00:00 to 21:30:00 (each slot: 30 minutes)
function generateSlotsForOutlet(outletId: string) {
  const slots: OutletOperationTimeSlot[] = [];
  let slotIndex = 1;
  // 10:00 to 22:00, so last slot is 21:30-22:00
  for (let hour = 10; hour <= 21; hour++) {
    for (let min of [0, 30]) {
      const startH = hour.toString().padStart(2, "0");
      const startM = min.toString().padStart(2, "0");
      let endHour = hour;
      let endMin = min + 30;
      if (endMin === 60) {
        endHour += 1;
        endMin = 0;
      }
      // Do not let any slot go past 22:00
      if (endHour > 22 || (endHour === 22 && endMin > 0)) continue;
      const endH = endHour.toString().padStart(2, "0");
      const endM = endMin.toString().padStart(2, "0");
      slots.push({
        id: `s${outletId}-${slotIndex++}`,
        outlet_id: outletId,
        start_time: `${startH}:${startM}:00`,
        end_time: `${endH}:${endM}:00`,
        is_pickup_available: true,
        is_active: true,
        created_at: "",
      });
    }
  }
  return slots;
}

const dummySlots = {
  outlet1: generateSlotsForOutlet("outlet1"),
  outlet2: generateSlotsForOutlet("outlet2"),
};

// Use real data if loaded, otherwise dummy
function currentSlotMap() {
  if (slotListByOutlet.value) {
    return slotListByOutlet.value;
  }
  return dummySlots;
}

function getOutletName(outletId: string) {
  if (outletId === "All Outlets") return "General";
  return outletOptions.value.find(o => o.id === outletId)?.name || outletId;
}

// For view: prepare [{outletId,slots}] for current table display
function getCurrentSlotData() {
  const slotObj = currentSlotMap();
  return Object.entries(slotObj).map(([outletId, slots]) => ({ outletId, slots }));
}

function allSlotsEmpty() {
  const slotObj = currentSlotMap();
  return Object.values(slotObj).every(arr => !arr.length);
}

// For column headers: find unique slot {start_time, end_time} for the visible outlets
function getAllSlotDefinitions() {
  // We want definitions for every 30min from 10am to 10pm
  const slotDefs = [];
  for (let hour = 10; hour <= 21; hour++) {
    for (let min of [0, 30]) {
      const startH = hour.toString().padStart(2, "0");
      const startM = min.toString().padStart(2, "0");
      let endHour = hour;
      let endMin = min + 30;
      if (endMin === 60) {
        endHour += 1;
        endMin = 0;
      }
      // last slot ends at 22:00
      if (endHour > 22 || (endHour === 22 && endMin > 0)) continue;
      const endH = endHour.toString().padStart(2, "0");
      const endM = endMin.toString().padStart(2, "0");
      slotDefs.push({
        start_time: `${startH}:${startM}:00`,
        end_time: `${endH}:${endM}:00`
      });
    }
  }
  return slotDefs;
}

// For a table row, align actual slots to slotDef column order (for editable highlight etc)
function getRowSlots(slotDefs: { start_time: string; end_time: string }[], actualSlots: OutletOperationTimeSlot[], includeUnavailable: boolean = false) {
  return slotDefs.map(def =>
    actualSlots.find(
      slot =>
        slot.start_time === def.start_time &&
        slot.end_time === def.end_time
        && (includeUnavailable ? true : slot.is_pickup_available)
    ) || null
  );
}

// --- QUERIES : DO NOT REMOVE ---
onMounted(async () => {
  await queryOutletOptions();
  await queryOutletPickupTimeSlot();
});

watch(selectedOutlet, async () => {
  await queryOutletPickupTimeSlot();
})

async function queryOutletOptions() {
  try {
    const res = await getOutletsOptions(myProfile?.business_id as string);
    outletOptions.value = res || [];
  } catch (e) {}
}

async function queryOutletPickupTimeSlot() {
  try {
    const body: any = {
      business_id: myProfile?.business_id as string,
    }

    if (selectedOutlet.value !== 'All Outlets') {
      body.outlet_id = selectedOutlet.value;
    }
    const res = await getPickupTimeSlot(body);
    slotListByOutlet.value = res.data;
  } catch (e) {
    slotListByOutlet.value = new Map();
  }
}

function startEdit() {
  isEditing.value = true;
}
function cancelEdit() {
  isEditing.value = false;
}
function saveEdit() {
  isEditing.value = false;
}

async function triggerToggleSlotAvailability(slot: OutletOperationTimeSlot) {
  try {
    await toggleSlotAvailability(slot.id as string);
    toast({
      title: 'Success',
      description: `${!slot.is_pickup_available ? 'Slot is now available' : 'Slot is now unavailable'}`,
      variant: 'success',
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to update slot availability',
      variant: 'destructive',
    })
  }
  await queryOutletPickupTimeSlot();
}

</script>

<template>
  <div class="w-full h-full pb-8 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 min-h-screen">
    <!-- Header -->
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
                <p class="text-md text-primary font-semibold">Order Slot</p>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>

    <!-- Main Card -->
    <div class="py-7 sm:px-14 container mx-auto min-h-screen flex flex-col gap-6">
      <div class="rounded-2xl bg-white shadow border flex flex-col gap-0 sm:gap-3 px-0 sm:px-6 py-4 sm:py-7">

        <!-- Title & Actions -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 px-6 pb-2">
          <div>
            <h1 class="text-xl md:text-2xl font-semibold mb-1 tracking-tight text-slate-900">
              Slot Time Table
            </h1>
            <div class="text-slate-500 text-sm">
              Manage operational slots across all outlets. Shift rows, slot columns, modern look.
            </div>
          </div>
          <div class="flex items-center gap-2 mt-1 ml-auto">
            <!-- <button
              v-if="!isEditing"
              @click="startEdit"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition text-base">
              <Icon icon="heroicons:pencil-square" class="w-5 h-5" />
              Edit Slots
            </button> -->
          </div>
        </div>
        <!-- Filter Selector -->
        <div class="flex items-center justify-end px-6 pt-1 sm:pt-0">
          <div class="min-w-[220px]">
            <Select v-model="selectedOutlet">
              <SelectTrigger>
                <SelectValue placeholder="All Outlets" />
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
        <!-- Slot table and actions -->
        <div class="w-full pt-6 pb-2 px-0 sm:px-6">
          <div class="flex flex-wrap items-center justify-between mb-4 gap-2 px-0">
            <p class="text-lg sm:text-xl font-bold text-primary-900 flex gap-2 items-baseline">
              <span v-if="selectedOutlet !== 'All Outlets'">
                {{ outletOptions.find(outlet => outlet.id === selectedOutlet)?.name }}
              </span>
              <span v-else>General</span>
              <span class="ml-1 text-base font-normal text-gray-400">Slot Overview</span>
            </p>
            <div v-if="isEditing" class="flex gap-2">
              <button
                @click="cancelEdit"
                class="px-4 py-2 rounded-md border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                :disabled="isLoading"
                @click="saveEdit"
                class="px-4 py-2 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary-dark transition flex items-center gap-1"
              >
                <span>{{ isLoading ? 'Saving...' : 'Save' }}</span>
                <Icon icon="mdi:loading" v-if="isLoading" class="animate-spin w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="relative">
            <div
              v-if="getCurrentSlotData().length && getAllSlotDefinitions().length"
              class="overflow-x-auto bg-gradient-to-tr from-white via-white/90 to-slate-100 rounded-2xl border border-slate-200 shadow"
            >
              <table class="w-full border-collapse text-[15px] font-medium modern-slot-table">
                <thead>
                  <tr class="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
                    <th class="sticky left-0 z-10 bg-inherit px-5 py-3 text-primary-600 text-xs font-bold uppercase tracking-widest border-r border-slate-200 shadow-sm min-w-[7rem] rounded-tl-2xl">
                      Outlet
                    </th>
                    <th
                      v-for="slotDef in getAllSlotDefinitions()"
                      :key="slotDef.start_time + '_' + slotDef.end_time"
                      class="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600 border-l border-slate-100 bg-primary/5"
                    >
                      <div class="flex flex-col items-center justify-center gap-1">
                        <span class="text-base font-bold text-primary-800">
                          {{ slotDef.start_time.slice(0,5) }} - {{ slotDef.end_time.slice(0,5) }}
                        </span>
                        <span class="block w-6 h-1 rounded bg-gradient-to-r from-primary/40 to-primary/10"></span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="({ outletId, slots }) in getCurrentSlotData()"
                    :key="outletId"
                    class="group hover:bg-primary/5 transition"
                  >
                    <!-- Outlet Name/ID -->
                    <td class="sticky left-0 bg-white px-5 py-4 whitespace-nowrap font-semibold text-primary border-r border-slate-200 align-middle rounded-bl-2xl" style="background-color: #fff !important;">
                      <div class="p-2 rounded-lg" style="background-color: #fff !important;">
                        <span class="block">
                          {{ getOutletName(outletId) }}
                        </span>
                        <!-- <template v-if="selectedOutlet==='All Outlets' || getCurrentSlotData().length>1">
                          <span class="block text-xs text-gray-400 font-mono">({{ outletId }})</span>
                        </template> -->
                      </div>
                    </td>
                    <!-- Slots -->
                    <td
                      v-for="(def, slotIdx) in getAllSlotDefinitions()"
                      :key="def.start_time + '_' + def.end_time"
                      class="border-l border-slate-100 px-3 py-2 text-center align-middle transition"
                    >
                      <template v-if="getRowSlots(getAllSlotDefinitions(), slots)[slotIdx]">
                        <div
                          class="rounded-xl bg-green-50 text-primary font-semibold px-2 py-2 flex flex-col items-center shadow-md border border-green-100 min-w-[80px] cursor-pointer hover:bg-green-100 hover:border-green-300 transition-colors"
                          @click="triggerToggleSlotAvailability(getRowSlots(getAllSlotDefinitions(), slots)[slotIdx] as OutletOperationTimeSlot)"
                        >
                          <span class="text-xs text-green-600 mt-1 font-medium flex items-center gap-1" >
                            <Icon icon="heroicons:check-circle-solid" class="w-4 h-4" />
                            Available
                          </span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="cursor-pointer" @click="triggerToggleSlotAvailability(getRowSlots(getAllSlotDefinitions(), slots, true)[slotIdx] as OutletOperationTimeSlot)">
                          <span class="block h-[38px] text-slate-300 font-mono text-lg flex items-center justify-center">
                            &mdash;
                          </span>
                        </div>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="allSlotsEmpty()" class="text-center text-gray-400 py-14 flex flex-col items-center">
              <Icon icon="mdi:calendar-remove-outline" class="w-12 h-12 mb-4 text-gray-300" />
              <span class="text-lg font-semibold mb-1">No slots available</span>
              <span class="text-sm text-slate-400">Use "Edit Slots" to add or manage time slots for your outlets</span>
            </div>
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
      @confirm="() => {}"
    />
  </div>
</template>

<style scoped>
/* Table - for "shift" modern look */
.modern-slot-table th,
.modern-slot-table td {
  transition: background 0.12s, box-shadow 0.12s;
}

/* Table scroll sticky effect on outlet column */
.modern-slot-table th.sticky,
.modern-slot-table td.sticky {
  position: sticky;
  left: 0;
  z-index: 2;
  background: inherit;
}

/* Soft shadow hover on row */
.modern-slot-table tr.group:hover td,
.modern-slot-table tr.group:hover th {
  background: #f0f7ff;
}

/* Stylish rounded corners for outer th/tds */
.modern-slot-table th:first-child { border-top-left-radius: 1rem; }
.modern-slot-table th:last-child { border-top-right-radius: 1rem; }
.modern-slot-table td:first-child { border-bottom-left-radius: 1rem; }
.modern-slot-table td:last-child { border-bottom-right-radius: 1rem; }
</style>
