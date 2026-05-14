<script setup lang="ts">
import { NuxtImg } from "#components";
import { Icon } from "@iconify/vue";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
} from '@/components/ui/sidebar'

const route = useRoute();
const { signOut } = useAuth();
const isCollapsed = ref(false);
const selectedItem = ref<string>('/business/business-details');
const { myProfile, checkPermission } = useMyProfileStore()

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  enabled?: boolean;
  submenu?: {
    title: string;
    path: string;
    icon: string;
    enabled?: boolean;
  }[];
}

const mainMenuItems: MenuItem[] = [
  // ... (menu items definition unchanged)
  // (omitted for brevity, as in your original file)
  {
    title: "User Management",
    path: "#",
    icon: "heroicons:user-group",
    enabled: true,
    submenu: [{
      title: "User Administration",
      path: "/user/user-administration",
      icon: "heroicons:users",
      enabled: checkPermission('read_user')
    },
    {
      title: "Access Control",
      path: "/user/access-control",
      icon: "heroicons:key",
      enabled: checkPermission('create_role')
    },
    {
      title: "Activity Logging",
      path: "/activity-logging",
      icon: "heroicons:clock",
      enabled: checkPermission('activity_log')
    }]
  },
  {
    title: "Business Management",
    path: "/business",
    icon: "heroicons:building-office-2",
    enabled: checkPermission('create_business')
  },
  {
    title: "Business Management",
    path: "/business/business-details",
    icon: "heroicons:building-office-2",
    enabled: checkPermission('read_business') && !checkPermission('create_business')
  },
  {
    title: "School-based Outlets",
    path: "/school-canteen",
    icon: "heroicons:academic-cap",
    enabled: true
  },
  {
    title: "Operation Management",
    path: "#operation",
    icon: "heroicons:calendar",
    enabled: checkPermission('create_outlet'),
    submenu: [
      {
        title: "Schedule",
        path: "/operation/schedule", 
        icon: "heroicons:calendar",
        enabled: checkPermission('create_product')
      },
      {
        title: "Delivery Slots",
        path: "/operation/slot", 
        icon: "heroicons:clock",
        enabled: checkPermission('create_product')
      },
    ]
  },
  {
      title: "Outlet Management",
      path: "/business/business-details/outlet-details",
      icon: "heroicons:storefront",
      enabled: checkPermission('read_outlet') && !checkPermission('create_outlet')
  },
  {
    title: "Product Management",
    path: "#product",
    icon: "heroicons:clipboard-document-list",
    enabled: checkPermission('create_product') || checkPermission('read_stock'),
    submenu: [
      {
        title: "Products",
        path: "/product/products",
        icon: "heroicons:shopping-bag",
        enabled: checkPermission('read_product')
      },
      {
        title: "Categories",
        path: "/product/categories",
        icon: "heroicons:squares-2x2",
        enabled: checkPermission('read_product')
      },
      {
        title: "Sub Categories", 
        path: "/product/sub-categories",
        icon: "heroicons:tag",
        enabled: checkPermission('read_product')
      },
      {
        title: "Stock Management",
        path: "/product/stock",
        icon: "heroicons:archive-box-arrow-down",
        enabled: checkPermission('read_stock')
      },
    ]
  },
  {
    title: "Sales",
    path: "#finance",
    icon: "heroicons:banknotes",
    enabled: checkPermission('read_finance_overview') || checkPermission('read_finance_full_report') || checkPermission('read_finance_payout_report') || checkPermission('read_finance_transaction'),
    submenu: [
      {
        title: "Overview",
        path: "/finance/overview", 
        icon: "heroicons:chart-bar",
        enabled: checkPermission('read_finance_overview')
      },
      {
        title: "Full Report",
        path: "/finance/full-report",
        icon: "heroicons:document-chart-bar",
        enabled: checkPermission('read_finance_full_report')
      },
      {
        title: "Payout Report", 
        path: "/finance/payout-report",
        icon: "heroicons:document-text",
        enabled: checkPermission('read_finance_payout_report')
      },
      {
        title: "Transaction", 
        path: "/finance/transaction",
        icon: "heroicons:clock",
        enabled: checkPermission('read_finance_transaction')
      }
    ]
  },
  {
    title: "Communication Management",
    path: "#communication",
    icon: "heroicons:chat-bubble-bottom-center-text",
    enabled: checkPermission('manage_onboarding') || checkPermission('manage_announcement') || checkPermission('manage_order_method') || checkPermission('manage_feedback'),
    submenu: [
      {
        title: "Onboarding",
        path: "/communication/onboarding", 
        icon: "heroicons:clipboard-document",
        // icon: "heroicons:user-plus",
        enabled: checkPermission('manage_onboarding')
      },
      {
        title: "Announcement",
        path: "/communication/announcement", 
        icon: "heroicons:megaphone",
        enabled: checkPermission('manage_announcement')
      },
      {
        title: "Order Method",
        path: "/communication/order-method", 
        icon: "heroicons:truck",
        enabled: checkPermission('manage_order_method')
      },
      {
        title: "Feedback",
        path: "/communication/feedback", 
        icon: "heroicons:star",
        enabled: checkPermission('manage_feedback')
      },
    ]
  },
];

const analysisMenuItems: MenuItem[] = [
  {
    title: "Outlet Analysis",
    path: "#",
    icon: "heroicons:chart-bar",
  },
  {
    title: "Rising Star Analysis",
    path: "#",
    icon: "heroicons:star",
  },
  {
    title: "State Analysis",
    path: "#",
    icon: "heroicons:globe-alt",
  },
  {
    title: "Sales Analysis",
    path: "#",
    icon: "heroicons:presentation-chart-line",
  },
  {
    title: "Low Performance",
    path: "#",
    icon: "heroicons:exclamation-triangle",
  },
];

// Mock user data - replace with your actual user data
const userName = ref("Santé System Administrator");
const userEmail = ref("super.admin@sante.com");
const userAvatar = ref("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");

onMounted(async () => {
  const fullName = myProfile?.first_name + " " + myProfile?.surname
  userName.value = (fullName === "Super Admin Sante" || !myProfile?.first_name) ? "Santé System Administrator" : fullName
  userEmail.value = myProfile?.email || "super.admin@sante.com"
})

watch(
  () => route.path,
  (newPath, oldPath) => {
    handleMenuSelect(newPath)
  }
)

const handleMenuSelect = (path: string): void => {
  selectedItem.value = path;
  if (window.innerWidth < 1024) {
    emit('close');
  }
};

const emit = defineEmits<{
  'toggleSidebar': [collapsed: boolean]
  'close': []
}>();

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('toggleSidebar', isCollapsed.value);
};

// --- Add for exclusive collapse control ---

/**
 * This state tracks which mainMenuIndex (with submenu) is open. Only one at a time.
 * Value is the index in filteredMenuItems, or null (none open)
 */
const openMenuIndex = ref<number|null>(null);

/**
 * Only main menu items that are enabled:
 */
const filteredMenuItems = computed(() => mainMenuItems.filter(item => item.enabled));

/**
 * Helper that returns a boolean for if the given menu index (i.e., in filteredMenuItems) is open.
 */
function isMenuOpen(i: number) {
  return openMenuIndex.value === i;
}

/**
 * When a menu with submenu is triggered, open it (or close if already open), closing others.
 */
function handleCollapsibleTrigger(i: number) {
  if (openMenuIndex.value === i) {
    openMenuIndex.value = null;
  } else {
    openMenuIndex.value = i;
  }
}

// If the route path changes and matches submenu, automatically open the corresponding collapsible.
watch(
  () => route.path,
  (newPath) => {
    // Find in filteredMenuItems if any, which submenu contains this path
    for (let i = 0; i < filteredMenuItems.value.length; i++) {
      const item = filteredMenuItems.value[i];
      if (item.submenu?.some(sub => sub.path === newPath)) {
        openMenuIndex.value = i;
        return;
      }
    }
    // If not found, close all
    openMenuIndex.value = null;
  },
  { immediate: true }
);

const handleLogout = async () => {
  try {
    await signOut({
      redirect: false
    });
    await navigateTo('/login', { external: true });
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

</script>

<script lang="ts">
export default {
  name: 'Sidebar'
}
</script>

<template>
  <div class="fixed top-4 left-4 h-[calc(100vh-32px)] bg-white z-30 border border-gray-100 shadow-xl rounded-2xl transition-all duration-300" :class="[
    isCollapsed ? 'w-[70px]' : 'w-[260px]'
  ]">
    <SidebarProvider variant="sidebar" class="flex flex-col h-full">
      <!-- Header -->
      <SidebarHeader class="flex-none">
        <SidebarMenu>
          <SidebarMenuItem>
            <div class="px-3 py-2 flex items-center justify-center">
              <NuxtImg @click="toggleSidebar" v-show="!isCollapsed" src="/images/sante_logo.png" alt="Santé" width="110px"
                class="lg:block cursor-pointer mt-5" />
                
              <button v-if="isCollapsed" @click="toggleSidebar" class="p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center mx-auto w-10 h-10 mt-4">
                <Icon icon="heroicons:leaf" class="h-7 w-7 text-primary transition-colors hover:text-green-700" />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <!-- Content -->
      <SidebarContent class="flex-1">
        <SidebarGroup>
          <Collapsible class="px-2">
            <div v-for="(item, i) in filteredMenuItems" :key="item.title">
              <Collapsible 
                v-if="item.submenu" 
                class="group rounded-lg transition-colors"
                :open="isMenuOpen(i)"
                @update:open="handleCollapsibleTrigger(i)"
              >
                <CollapsibleTrigger class="w-full">
                  <!-- Only prevent NuxtLink navigation if submenu exists: so remove NuxtLink, just click to toggle menu, or keep it (depending on route UX) -->
                  <div 
                    class="flex items-center px-3 py-2 text-gray-600 rounded-lg transition-colors cursor-pointer group hover:text-primary hover:bg-green-50" 
                    :class="[
                      { 'bg-primary text-white': selectedItem === item.path || (isCollapsed && item.submenu?.some(sub => route.path === sub.path)) },
                      isCollapsed ? 'justify-center px-0' : ''
                    ]"
                  >
                    <span :class="{ 'mr-3': !isCollapsed }">
                      <Icon :icon="item.icon" class="h-5 w-5" />
                    </span>
                    <span v-show="!isCollapsed" class="text-sm font-medium mr-3 text-left">{{ item.title }}</span>
                    <Icon v-if="!isCollapsed" icon="heroicons:chevron-right"
                      class="h-4 w-4 ml-auto transition-transform duration-200"
                      :class="{ 'rotate-90': isMenuOpen(i) }"
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent v-show="!isCollapsed">
                  <div v-for="subItem in item.submenu" :key="subItem.title">
                    <NuxtLink v-if="subItem.enabled" :to="subItem.path" @click="handleMenuSelect(subItem.path)">
                        <div class="flex items-center px-3 py-2 rounded-lg transition-colors group" :class="[
                        selectedItem === subItem.path ? 'text-white bg-primary shadow-sm' : 'text-gray-500 hover:text-primary hover:bg-green-50'
                      ]">
                        <span class="mr-3 ml-4">
                          <Icon :icon="subItem.icon" class="h-5 w-5" />
                        </span>
                        <span class="text-sm font-medium">{{ subItem.title }}</span>
                      </div>
                    </NuxtLink>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              <NuxtLink v-else :to="item.path" @click="handleMenuSelect(item.path)">
                <div class="flex items-center px-3 py-2 rounded-lg transition-colors group" :class="[
                  selectedItem === item.path ? 'text-white bg-primary shadow-sm' : 'text-gray-600 hover:text-primary hover:bg-green-50',
                  isCollapsed ? 'justify-center' : ''
                ]">
                  <span :class="{ 'mr-3': !isCollapsed }">
                    <Icon :icon="item.icon" class="h-5 w-5" />
                  </span>
                  <span v-show="!isCollapsed" class="text-sm font-medium">{{ item.title }}</span>
                </div>
              </NuxtLink>
            </div>
          </Collapsible>
        </SidebarGroup>
        <div class="border-b border-gray-200 mx-3 mb-4"></div>

        <div class="px-2">
          <Collapsible v-slot="{ open }">
            <!-- Settings Trigger -->
            <CollapsibleTrigger as-child>
              <div class="mb-2">
                <div class="flex items-center py-3 text-gray-700 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 group px-3">
                  <Icon icon="heroicons:cog-6-tooth" class="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                  <span v-show="!isCollapsed" class="ml-3 font-medium text-gray-600 group-hover:text-primary">Settings</span>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <!-- Collapsible Content (User Profile & Logout) -->
            <CollapsibleContent v-if="!isCollapsed" class="px-2 pb-4 space-y-4">
              <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <img :src="userAvatar" alt="User avatar" class="h-10 w-10 rounded-full border-2 border-slate-50" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 truncate">{{ userName }}</p>
                  <p class="text-xs text-slate-500 truncate">{{ userEmail }}</p>
                </div>
              </div>
              
              <button
                @click="handleLogout"
                class="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm"
              >
                <Icon icon="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
                <span>Logout</span>
              </button>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <!-- Analysis Menu Removed -->
      </SidebarContent>
    </SidebarProvider>
  </div>
</template>