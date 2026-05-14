<script setup lang="ts">
import ProfileDropdown from '~/components/custom/ProfileDropdown.vue';

definePageMeta({
  layout: 'default',
  auth: true,
});

const config = useRuntimeConfig();

useSeoMeta({
  title: config.public.appName + " | Dashboard Admin",
});

const avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane";

</script>
<template>
  <div class="p-6 bg-white">
      <h1>Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Users Card -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Users</p>
              <p class="text-2xl font-semibold">2,453</p>
            </div>
            <div class="p-2 bg-blue-100 rounded-lg">
              <Icon name="heroicons:users" class="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-green-600">+12.5%</span>
            <span class="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <!-- Total Revenue Card -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Revenue</p>
              <p class="text-2xl font-semibold">$42,150</p>
            </div>
            <div class="p-2 bg-green-100 rounded-lg">
              <Icon name="heroicons:currency-dollar" class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-green-600">+8.2%</span>
            <span class="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <!-- Total Orders Card -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Total Orders</p>
              <p class="text-2xl font-semibold">1,257</p>
            </div>
            <div class="p-2 bg-purple-100 rounded-lg">
              <Icon name="heroicons:shopping-cart" class="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-green-600">+5.3%</span>
            <span class="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <!-- Active Users Card -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Active Users</p>
              <p class="text-2xl font-semibold">892</p>
            </div>
            <div class="p-2 bg-green-100 rounded-lg">
              <Icon name="heroicons:user-circle" class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div class="mt-2">
            <span class="text-sm text-red-600">-2.1%</span>
            <span class="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="bg-gray-50 p-6 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Revenue Overview</h2>
          <select class="border rounded-md px-2 py-1 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
        <div class="h-64 flex items-end justify-between gap-2">
          <!-- Dummy bar chart -->
          <div class="w-1/7 bg-blue-500 rounded-t-md" style="height: 60%"></div>
          <div class="w-1/7 bg-blue-500 rounded-t-md" style="height: 75%"></div>
          <div class="w-1/7 bg-blue-500 rounded-t-md" style="height: 45%"></div>
          <div class="w-1/7 bg-blue-500 rounded-t-md" style="height: 90%"></div>
          <div class="w-1/7 bg-blue-500 rounded-t-md" style="height: 65%"></div>
          <div class="w-1/7 bg-blue-500 rounded-t-md" style="height: 80%"></div>
          <div class="w-1/7 bg-blue-500 rounded-t-md" style="height: 70%"></div>
        </div>
        <div class="flex justify-between mt-2 text-sm text-gray-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
  </div>
</template>
