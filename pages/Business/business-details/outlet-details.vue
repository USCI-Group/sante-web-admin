<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import type { Business } from '@/types/business'
import type { User } from '@/types/user'
import type { Outlet, MerchantSecret } from '@/types/outlet'
import type { Meta } from '@/types/common'
import BusinessDetailsFormDialog from '@/components/custom/business/BusinessDetailsFormDialog.vue'
import DynamicDialog from '~/components/custom/DynamicDialog.vue'
import UserFormDialog from '@/components/custom/business/UserFormDialog.vue'
import OutletFormDialog from '@/components/custom/business/OutletFormDialog.vue'
import MerchantSecretsFormDialog from '@/components/custom/business/MerchantSecretsFormDialog.vue'
import DynamicTable from '@/components/custom/DynamicTable.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Option } from '~/types/common'
const router = useRouter()
const { toast } = useToast()
const { me, getMe, getUsers, createUser, updateUser, deleteUser, isOutletAdmin, isSantéAdmin, checkPermission } = useUsers()
const { getRoleOptions } = useRoles()
const { updateOutlet, deleteOutlet, getOutlet, uploadOutletImage, getOutletSecrets, updateOutletSecrets, getSelfServeJourneyURL, uploadOutletDuitnowQr, updateOutletStoreId } = useOutlets()
const { syncMenuToShopee } = useMenu()
const outletStore = useOutletStore()

const deleteUserDialogData = ref({
  isOpen: false,
  title: 'Delete User',
  description: 'Are you sure you want to delete this user? Please enter the following text to confirm:',
  confirmation: 'Delete',
  isLoading: false,
  user: {} as User
})

const deleteOutletDialogData = ref({
  isOpen: false,
  title: 'Delete Outlet',
  description: 'Are you sure you want to delete this outlet? Please enter the following text to confirm:',
  confirmation: 'Delete',
  isLoading: false,
  outlet: {} as Outlet
})

const merchantSecretsFormDialogData = ref({
  isOpen: false,
  isLoading: false,
})

const searchName = ref('')
const users = ref<User[]>([])
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

const secrets = ref<MerchantSecret>({} as MerchantSecret)
const showApplicationCode = ref(false)
const showCloudErcAccountId = ref(false)
const showVerifyKey = ref(false)

const usersColumns: ColumnDef<User, any>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'first_name',
  },  
  {
    id: 'employeeId',
    header: 'Employee ID',
    accessorKey: 'employee_no',
  },
  {
    id: 'role',
    header: 'Role',
    accessorKey: 'GroupRole.Role.name',
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'phoneNumber',
    header: 'Phone Number',
    accessorKey: 'phone',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        onClick: () => handleEditUserButton(row.original),
      }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
      h(Button, {
        variant: 'ghost',
        size: 'icon',
        onClick: () => handleDeleteUserButton(row.original),
      }, () => h(Icon, { icon: 'heroicons:trash' }))
    ])
  }
]

const userFormDialogData = ref({
  isOpen: false,
  mode: 'create' as 'create' | 'edit',
  user: {} as User,
  isLoading: false,
  roleOptions: [] as Option[]
})

const outletFormDialogData = ref({
  isOpen: false,
  mode: 'create' as 'create' | 'edit',
  outlet: {} as Outlet,
  isLoading: false,
})

onMounted(async () => {
  await getMe()
  await fetchOutlet()
  await fetchUsers()
  await fetchRoleOptions()
  await fetchOutletSecrets()
})

const fetchOutlet = async () => {
  try {
    if(isOutletAdmin()){
      const outlet = await getOutlet(me.value?.outlet_id as string)
      outletFormDialogData.value.outlet = outlet
    }else{
      const selectedOutlet = outletStore.selectedOutlet
      const outlet = await getOutlet(selectedOutlet?.id as string)
      outletFormDialogData.value.outlet = outlet
    }
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.message || 'Failed to fetch business details',
      variant: 'destructive'
    })
  }
}

const fetchOutletSecrets = async () => {
  try {
    const outletId = outletFormDialogData.value.outlet.id as string
    const res = await getOutletSecrets(outletId)
    secrets.value = res
  } catch (error: any) {
    
  }
}

const handleCancel = () => {
  outletStore.setSelectedOutlet({} as Outlet)
  router.push('/business/business-details')
}

const handleSaveOutlet = async (data: any) => {
  const outletData: Outlet = { ...data }
  const imageFile = data.image_file as File
  const duitnowQrFile = data.duitnow_qr_file as File

  outletFormDialogData.value.isLoading = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await updateOutlet(outletData)

    if(imageFile){
      await uploadOutletImage(outletData.id as string, imageFile)
    }

    if(duitnowQrFile){
      await uploadOutletDuitnowQr(outletData.id as string, duitnowQrFile)
    }

    toast({
      title: 'Success',
      description: 'Outlet details successfully updated',
      variant: 'success',
    })
    outletFormDialogData.value.isOpen = false
    outletFormDialogData.value.isLoading = false
    await fetchOutlet()
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to update outlet details',
      variant: 'destructive',
    })
  }
}

const openDeleteOutletDialog = () => {
    deleteOutletDialogData.value.confirmation = 'Delete Outlet ' + outletFormDialogData.value.outlet.name
    deleteOutletDialogData.value.isOpen = true
}

const handlePageSizeChange = async (newSize: number) => {
  meta.value.page_size = newSize
  meta.value.page = 1
  await fetchUsers()
}

const handlePageChange = async (newPage: number) => {
  meta.value.page = newPage
  await fetchUsers()
}

const fetchUsers = async () => {
    const page = meta.value.page
    const page_size = meta.value.page_size
    const filter = {
        outlet_id: outletFormDialogData.value.outlet.id as string,
        name: searchName.value
    }
    const res = await getUsers({ page: page, page_size: page_size, filter: filter })
    users.value = res.data
    meta.value = res.meta
}

const handleAddUserButton = () => {
    userFormDialogData.value.user = {} as User
    userFormDialogData.value.isOpen = true
    userFormDialogData.value.mode = 'create'
}

const handleSaveUser = async (data: any) => {
    const userData: User = { ...data }
    const { role_id, password } = data
    
    userFormDialogData.value.isLoading = true

    try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if(userFormDialogData.value.mode === 'create'){
            userData.business_id = outletFormDialogData.value.outlet.business_id as string
            userData.outlet_id = outletFormDialogData.value.outlet.id as string
            const result = await createUser({
                first_name: userData.first_name,
                surname: userData.surname,
                email: userData.email,
                phone: userData.phone,
                employee_no: userData.employee_no,
                role_id: role_id,
                business_id: userData.business_id,
                outlet_id: userData.outlet_id,
                password: password,
            })
        }else{
            await updateUser(userData, role_id)
        }
        
        userFormDialogData.value.isOpen = false
        toast({
            title: 'Success',
            description: userFormDialogData.value.mode === 'create' ? 'User created successfully' : 'User updated successfully',
            variant: 'success',
        })
        await fetchUsers()
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to create user account',
            variant: 'destructive',
        })
    } finally {
        userFormDialogData.value.isLoading = false
    }
}

const fetchRoleOptions = async () => {
    try {
        userFormDialogData.value.roleOptions = await getRoleOptions(outletFormDialogData.value.outlet.business_id as string)
    } catch (error) {
        userFormDialogData.value.roleOptions = []
    }
}

const handleEditUserButton = async (user: User) => {
//   const res = await getUser(user.id as string)
  userFormDialogData.value.user = user
  userFormDialogData.value.isOpen = true
  userFormDialogData.value.mode = 'edit'
}

const handleDeleteUserButton = (user: User) => {
    deleteUserDialogData.value.user = user
    deleteUserDialogData.value.isOpen = true
    deleteUserDialogData.value.confirmation = 'Delete User ' + user.first_name + ' ' + user.surname
}

const handleDeleteUser = async (data: any) => {
    const confirmation = data as string
    if (confirmation != deleteUserDialogData.value.confirmation) {  
        toast({
            title: 'Error',
            description: 'Invalid confirmation',
            variant: 'destructive',
        })
        return
    }

    try {
        await deleteUser(deleteUserDialogData.value.user.id as string)
        toast({
            title: 'Success',
            description: 'User deleted successfully',
            variant: 'success',
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to delete user',
            variant: 'destructive',
        })
    } finally {
        await fetchUsers()
        deleteUserDialogData.value.isOpen = false
    }
}

const handleEditOutletButton = async () => {
  outletFormDialogData.value.isOpen = true
  outletFormDialogData.value.mode = 'edit'
}

const handleDeleteOutletDialog = async (data: any) => {
    const confirmation = data as string
    if(confirmation != deleteOutletDialogData.value.confirmation){
        toast({
            title: 'Error',
            description: 'Invalid confirmation',
            variant: 'destructive',
        })
        return
    }
    try {
        await deleteOutlet(deleteOutletDialogData.value.outlet.id as string)
        toast({
            title: 'Success',
            description: 'Outlet deleted successfully',
            variant: 'success',
        })
        navigateTo('/business/business-details')
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to delete outlet',
            variant: 'destructive',
        })
    }finally{
        deleteOutletDialogData.value.isOpen = false
        deleteOutletDialogData.value.isLoading = false
    }
}


const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast({
    title: 'Success',
    description: 'Copied to clipboard',
    variant: 'success',
  })
}

let debounceTimer: any = null
watch(searchName, (newVal: string) => {
  clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    fetchUsers()
  }, 500) // Delay in milliseconds
})

</script>

<template>
    <div>
        <div class="container py-6">
          <Breadcrumb class="mb-6">
              <BreadcrumbList>
                  <BreadcrumbItem>
                      <BreadcrumbLink>
                          Home
                      </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                      <BreadcrumbLink>
                          <NuxtLink to="/business">
                              Business Management
                          </NuxtLink>
                      </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                      <BreadcrumbLink>
                          <NuxtLink to="/business/business-details">
                              Business Details
                          </NuxtLink>
                      </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                      <BreadcrumbPage>
                          Outlet Details
                      </BreadcrumbPage>
                  </BreadcrumbItem>
              </BreadcrumbList>
          </Breadcrumb>
          <div class="flex flex-row items-center my-8 gap-4">
              <div
                  class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                  <Icon icon="heroicons:building-storefront" class="w-6 h-6" />
              </div>
              <span class="flex flex-col">
                  <h1 class="text-2xl font-bold">Outlet Details</h1>
                  <span class="text-sm text-gray-500">View outlet details and manage outlet</span>
              </span>
              <Button v-if="!isOutletAdmin()" variant="outline" @click="handleCancel" class="ml-auto">
                <Icon icon="heroicons:arrow-left" class="mr-2" />
                Back
              </Button>
          </div>
      
          <div>
              <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                          <h2 class="text-xl font-semibold">Outlet Details</h2>
                      </div>
                      <div class="flex items-center gap-2">
                          <Button v-if="checkPermission('delete_outlet')" variant="outline" @click="openDeleteOutletDialog">
                              <Icon icon="heroicons:trash" class="w-5 h-5 mr-2" />
                              Delete
                          </Button>
                          <Button v-if="checkPermission('update_outlet')" class="btn-primary" @click="handleEditOutletButton()">
                              <Icon icon="heroicons:pencil-square" class="w-5 h-5 mr-2" />
                              Edit
                          </Button>
                      </div>
                  </div>
                  
                  <div class="grid grid-cols-[200px_1fr] overflow-hidden">
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500">Company Logo</div>
                      <div class="p-4 text-gray-600">
                          <img v-if="outletFormDialogData.outlet?.image_url" :src="outletFormDialogData.outlet.image_url" alt="Company Logo" class="h-20 w-20 object-contain">
                          <div v-else class="h-20 w-20 bg-gray-100 flex items-center justify-center rounded">
                              <Icon icon="heroicons:building-office-2" class="w-10 h-10 text-gray-400" />
                          </div>
                      </div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Outlet Name</div>
                      <div class="p-4 border-t">{{ outletFormDialogData.outlet?.name }}</div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">SSM No.</div>
                      <div class="p-4 text-gray-500 border-t">{{ outletFormDialogData.outlet?.registration_number }}</div>

                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">TIN No.</div>
                      <div class="p-4 text-gray-500 border-t">{{ outletFormDialogData.outlet?.tin ?? 'N/A' }}</div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Address</div>
                      <div class="p-4 text-gray-500 border-t">
                          {{ outletFormDialogData.outlet?.address?.street_line1 }}<br v-if="outletFormDialogData.outlet?.address?.street_line2">
                          {{ outletFormDialogData.outlet?.address?.street_line2 }}<br v-if="outletFormDialogData.outlet?.address?.street_line2">
                          {{ outletFormDialogData.outlet?.address?.city }}
                      </div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t border-b">Postcode</div>
                      <div class="text-gray-500 border-t border-b grid grid-cols-3 gap-4">
                          <div class="p-4">{{ outletFormDialogData.outlet?.address?.postal_code }}</div>
                          <div class="font-semibold bg-gray-50 p-4">State</div>
                          <div class="p-4">{{ outletFormDialogData.outlet?.address?.state }}</div>
                      </div>
      
                  </div>
              </div>
          </div>

            <div class="grid grid-cols-1 gap-4 mt-2">
              <div class="bg-white rounded-lg shadow-sm border p-4">
                <!-- Santé -->
                <div>
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="font-medium">Santé</h3>
                  </div>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium">Outlet UUID</p>
                        <div class="flex items-center mt-1">
                          <p class="text-sm text-gray-500">{{ outletFormDialogData.outlet?.id }}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" @click="copyToClipboard(outletFormDialogData.outlet?.id as string)">
                        <Icon icon="heroicons:clipboard" class="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>


          <div class="mt-10">
                <!-- User Listing -->
                <div class="mt-4">
                  <div class="flex flex-row justify-between items-center mb-4">
                        <div class="relative w-96 mt-4">
                            <span class="absolute inset-y-0 left-3 flex items-center">
                                <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 text-gray-500" />
                            </span>
                            <Input 
                                v-model="searchName"
                                placeholder="Search"
                                class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                            />
                        </div>
                        <Button v-if="checkPermission('create_user')" @click="handleAddUserButton"
                            class="btn-primary">
                            <Icon icon="ph:plus-bold" class="w-4 h-4" />
                            Add User
                        </Button>
                    </div>
                    <DynamicTable 
                        :columns="usersColumns" 
                        :data="users" 
                        :currentPage="meta.page"
                        :totalPages="meta.total_pages"
                        @pageSizeChange="handlePageSizeChange"
                        @pageChange="handlePageChange"
                        :disable-toolbar="true"
                    >
                        <template #toolbar-buttons>
                        </template> 
                    </DynamicTable>
                </div>

            </div>
        </div>



        <UserFormDialog
          :is-open="userFormDialogData.isOpen"
          :mode="userFormDialogData.mode"
          :user="userFormDialogData.user"
          :is-loading="userFormDialogData.isLoading"
          :role-options="userFormDialogData.roleOptions"
          @submit="handleSaveUser"
          @cancel="userFormDialogData.isOpen = false"
        />
      
        <OutletFormDialog
          :is-open="outletFormDialogData.isOpen"
          :mode="outletFormDialogData.mode"
          :outlet="outletFormDialogData.outlet"
          :is-loading="outletFormDialogData.isLoading"
          @submit="handleSaveOutlet"
          @cancel="outletFormDialogData.isOpen = false"
        />


        <DynamicDialog
          :is-open="deleteUserDialogData.isOpen"
          :title="deleteUserDialogData.title"
          :description="deleteUserDialogData.description"
          :confirmation-text="deleteUserDialogData.confirmation"
          :show-confirmation-input="true"
          @confirm="handleDeleteUser"
          @cancel="deleteUserDialogData.isOpen = false"
        />

        <DynamicDialog
          :is-open="deleteOutletDialogData.isOpen"
          :title="deleteOutletDialogData.title"
          :description="deleteOutletDialogData.description"
          :confirmation-text="deleteOutletDialogData.confirmation"
          :show-confirmation-input="true"
          @confirm="handleDeleteOutletDialog"
          @cancel="deleteOutletDialogData.isOpen = false"
        />
    </div>
</template>
