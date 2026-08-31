<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import type { Business } from '@/types/business'
import type { User } from '@/types/user'
import type { Outlet } from '@/types/outlet'
import type { Meta } from '@/types/common'
import BusinessConfiguration from '@/components/custom/business/BusinessConfiguration.vue'
import BusinessDetailsFormDialog from '@/components/custom/business/BusinessDetailsFormDialog.vue'
import DynamicDialog from '~/components/custom/DynamicDialog.vue'
import UserFormDialog from '@/components/custom/business/UserFormDialog.vue'
import OutletFormDialog from '@/components/custom/business/OutletFormDialog.vue'
import DynamicTable from '@/components/custom/DynamicTable.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Option } from '~/types/common'
const route = useRoute()
const router = useRouter()
const { toast } = useToast()
const { getBusiness, updateBusiness, deleteBusiness, uploadBusinessLogo } = useBusinesses()
const { me, getMe, getUsers, createUser, updateUser, deleteUser, isSantéAdmin, isOutletAdmin, checkPermission } = useUsers()
const { getRoleOptions } = useRoles()
const { getOutlets, createOutlet, updateOutlet, deleteOutlet, uploadOutletImage, uploadOutletDuitnowQr } = useOutlets()
const businessStore = useBusinessStore()
const outletStore = useOutletStore()

const editBusinessDialogData = ref({
  isOpen: false,
  mode: 'edit' as 'create' | 'edit',
  business: {} as Business,
  isLoading: false
})

const deleteBusinessDialogData = ref({
  isOpen: false,
  title: 'Delete Business',
  description: 'Are you sure you want to delete this business?',
  confirmation: 'Delete',
  isLoading: false
})

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

const activeTab = ref('User Listing')

const searchName = ref('')
const searchOutlet = ref('')
const users = ref<User[]>([])
const outlets = ref<Outlet[]>([])
const meta = ref<Meta>({
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1
})

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

const outletsColumns: ColumnDef<Outlet, any>[] = [
    {
        id: 'name',
        header: 'Outlet Name',
        accessorKey: 'name',
        cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
            h('span', { class: 'font-bold' }, row.original.name),
            h('span', { class: 'text-gray-500 text-sm' }, row.original.registration_number)
        ]),
    },  
    {
        id: 'address',
        header: 'Outlet Address',
        cell: ({ row }) => h('div', { class: 'flex flex-col gap-2' }, [
            h('span', { class: 'text-gray-500 text-sm' }, [
            row.original?.address?.street_line1,
                row.original?.address?.street_line2,
                row.original?.address?.street_line3,
                row.original?.address?.city,
                row.original?.address?.state,
                row.original?.address?.postal_code,
                row.original?.address?.country
            ].filter(Boolean).join(', ')),
            h('div', { class: 'flex gap-2' }, [
                h('span', { 
                    class: [
                      'px-2 py-1 text-xs rounded-full',
                      {
                        'border border-blue-500 text-blue-500 bg-blue-50': row.original?.address?.state === 'Selangor',
                        'border border-green-500 text-green-500 bg-green-50': row.original?.address?.state === 'Kuala Lumpur' || row.original?.address?.state === 'Johor',
                        'border border-purple-500 text-purple-500 bg-purple-50': row.original?.address?.state === 'Penang',
                        'border border-gray-500 text-gray-500 bg-gray-50': !['Selangor', 'Kuala Lumpur', 'Penang', 'Johor'].includes(row.original?.address?.state || '')
                      }
                    ]
                }, row.original?.address?.state)
            ])
        ]),
    },
    {
        id: 'outletManager',
        header: 'Outlet Manager Details',
        accessorKey: 'email',
    },
    {
        id: 'openingDate',
        header: 'Opening Date',
        accessorKey: 'created_at',
        cell: ({ row }) => {
            const date = new Date(row.original.created_at as string)
            return date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear()
        },
    },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'outlet_status',
        cell: ({ row }) => h('div', { class: 'flex flex-col font-medium' }, [
            h('span', { 
                class: [
                    'text-sm px-2 py-1 rounded-full w-fit',
                    row.original.outlet_status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : row.original.outlet_status === 'closed'
                            ? 'bg-red-100 text-red-700'
                            : row.original.outlet_status === 'on-hold'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                ]
            }, 
            row.original.outlet_status
                ? row.original.outlet_status.charAt(0).toUpperCase() + row.original.outlet_status.slice(1).replace(/_/g, ' ')
                : ''
            ),
        ]),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
        h(Button, {
            variant: 'ghost',
            size: 'icon',
            onClick: () => handleEditOutletButton(row.original),
            class: checkPermission('update_outlet') ? '' : 'hidden'
        }, () => h(Icon, { icon: 'heroicons:pencil-square' })),
        h(DropdownMenu, {}, {
            default: () => [
                h(DropdownMenuTrigger, { asChild: true }, () =>
                    h(Button, { variant: 'ghost', size: 'icon' }, () =>
                        h(Icon, { icon: 'heroicons:ellipsis-vertical' })
                    )
                ),
                h(DropdownMenuContent, {}, () => [
                    h(DropdownMenuItem, {
                        onClick: () => handleViewOutletButton(row.original),
                        class: checkPermission('read_outlet') ? '' : 'hidden'
                    }, () => [
                        h(Icon, { icon: 'heroicons:eye', class: 'mr-2 h-4 w-4' }),
                        'View'
                    ]),
                    h(DropdownMenuItem, {
                        onClick: () => handleDeleteOutletButton(row.original),
                        class: checkPermission('delete_outlet') ? '' : 'hidden'
                    }, () => [
                        h(Icon, { icon: 'heroicons:trash', class: 'mr-2 h-4 w-4' }),
                        'Delete'
                    ])
                ])
            ]
        })
        ])
    },
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
    if (isOutletAdmin()) {
        navigateTo('/business/business-details/outlet-details')
    }
    await fetchBusiness()
    await fetchUsers()
    await fetchRoleOptions()
})

watch(() => activeTab.value, async () => {
  if(activeTab.value === 'Outlet Listing'){
    await fetchOutlets()
  }
  else if(activeTab.value === 'User Listing'){
    await fetchUsers()
  }
})

const fetchBusiness = async () => {
    try {
        if(isSantéAdmin()){
        const selectedBusiness = businessStore.selectedBusiness
        const business = await getBusiness(selectedBusiness?.id as string)
        editBusinessDialogData.value.business = business
        }else{
        const business = await getBusiness(me.value?.business_id as string)
        editBusinessDialogData.value.business = business
        }
    } catch (error: any) {
        toast({
        title: 'Error',
        description: error?.message || 'Failed to fetch business details',
        variant: 'destructive'
        })
    }
}

const fetchOutlets = async () => {
  const body = {
    page: meta.value.page,
    page_size: meta.value.page_size,
    business_id: editBusinessDialogData.value.business.id as string,
    filter: {
      search: searchOutlet.value
    }
  }
  const res = await getOutlets(body)
  outlets.value = res.data
  meta.value = res.meta
}

const handleCancel = () => {
  businessStore.setSelectedBusiness({} as Business)
  router.push('/business')
}

const handleEditBusiness = () => {
  editBusinessDialogData.value.isOpen = true
  editBusinessDialogData.value.mode = 'edit'
}

const handleViewOutletButton = (outlet: Outlet) => {
    outletStore.setSelectedOutlet(outlet)
    navigateTo(`/business/business-details/outlet-details`)
}

const handleAddOutletButton = () => {
    outletFormDialogData.value.outlet = {} as Outlet
    outletFormDialogData.value.isOpen = true
    outletFormDialogData.value.mode = 'create'
}

const handleManageOutletGroupButton = () => {
    navigateTo(`/business/business-details/outlet-group`)
}

const handleSaveBusiness = async (data: any) => {
    const businessData: Business = { ...data }
    const logoFile = data.logo_file as File

    editBusinessDialogData.value.isLoading = true
    try {
        await new Promise(resolve => setTimeout(resolve, 500))

        await updateBusiness(businessData)

        if (logoFile) {
            if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(logoFile.type)) {
                throw new Error('Logo format is not supported')
            }
            await uploadBusinessLogo(businessData.id as string, logoFile)
        }
        
        await fetchBusiness()
        businessStore.setSelectedBusiness(editBusinessDialogData.value.business)
            
        editBusinessDialogData.value.isOpen = false
        toast({
            title: 'Success',
            description: 'Business details successfully updated',
            variant: 'success',
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error?.data?.message || error?.message || 'Failed to update business details',
            variant: 'destructive',
        })
    } finally {
        editBusinessDialogData.value.isLoading = false
    }
}

const handleSaveOutlet = async (data: any) => {
  const outletData: Outlet = { ...data }
  const imageFile = data.image_file as File
  const duitnowQrFile = data.duitnow_qr_file as File

  outletFormDialogData.value.isLoading = true

  try {
    if(outletFormDialogData.value.mode === 'create'){
      outletData.business_id = editBusinessDialogData.value.business.id as string
      const res = await createOutlet(outletData)
      outletData.id = res.id
    }else{
      await updateOutlet(outletData)
    }

    if(imageFile){
      await uploadOutletImage(outletData.id as string, imageFile)
    }
    // Upload static duitnow qr code
    if(duitnowQrFile){
      await uploadOutletDuitnowQr(outletData.id as string, duitnowQrFile)
    }

    toast({
      title: 'Success',
      description: 'Outlet details successfully updated',
      variant: 'success',
    })
  } catch (error: any) {
    toast({
      title: 'Error',
      description: error.data?.message ?? 'Failed to update outlet details',
      variant: 'destructive',
    })
  } finally {
    outletFormDialogData.value.isOpen = false
    outletFormDialogData.value.isLoading = false
    await fetchOutlets()
  }
}

const openDeleteBusinessDialog = () => {
    deleteBusinessDialogData.value.confirmation = 'Delete Business ' + editBusinessDialogData.value.business.name
    deleteBusinessDialogData.value.isOpen = true
}

const handleDeleteBusiness = async (data: any) => {
    const confirmation = data as string
    if (confirmation != deleteBusinessDialogData.value.confirmation) {
        toast({
            title: 'Error',
            description: 'Invalid confirmation',
            variant: 'destructive',
        })
        return
    }

    try {
        await deleteBusiness(editBusinessDialogData.value.business.id as string)
        toast({
            title: 'Success',
            description: 'Business details successfully deleted',
            variant: 'success',
        })
        deleteBusinessDialogData.value.isOpen = false
        router.push('/business')
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to delete business',
            variant: 'destructive',
        })
    }
}

const handlePageSizeChange = async (newSize: number) => {
  meta.value.page_size = newSize
  meta.value.page = 1
  if(activeTab.value === 'User Listing'){
    await fetchUsers()
  }else if(activeTab.value === 'Outlet Listing'){
    await fetchOutlets()
  }
}

const handlePageChange = async (newPage: number) => {
  meta.value.page = newPage
  if(activeTab.value === 'User Listing'){
    await fetchUsers()
  }else if(activeTab.value === 'Outlet Listing'){
    await fetchOutlets()
  }
}

const fetchUsers = async () => {
    const page = meta.value.page
    const page_size = meta.value.page_size
    const filter = {
        business_id: editBusinessDialogData.value.business.id as string,
        name: searchName.value
    }

    const res = await getUsers({ page: page, page_size: page_size, filter: filter })
    users.value = res.data
    meta.value = res.meta
}

const handleAddUserButton = () => {
    userFormDialogData.value.user = {
        business_id: editBusinessDialogData.value.business.id as string,
    } as User
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
            userData.business_id = editBusinessDialogData.value.business.id as string
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
        userFormDialogData.value.roleOptions = await getRoleOptions(editBusinessDialogData.value.business.id as string)
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

const handleEditOutletButton = async (outlet: Outlet) => {
//   const res = await getUser(user.id as string)
  outletFormDialogData.value.outlet = outlet
  outletFormDialogData.value.isOpen = true
  outletFormDialogData.value.mode = 'edit'
}

const handleDeleteOutletButton = async (outlet: Outlet) => {
    deleteOutletDialogData.value.outlet = outlet
    deleteOutletDialogData.value.isOpen = true
    deleteOutletDialogData.value.confirmation = 'Delete Outlet ' + outlet.name
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
        await fetchOutlets()
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

let debounceTimer: any = null
watch(searchName, (newVal: string) => {
  clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    meta.value.page = 1
    fetchUsers()
  }, 500) // Delay in milliseconds
})

watch(searchOutlet, (newVal: string) => {
  clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    meta.value.page = 1
    fetchOutlets()
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
                      <BreadcrumbPage>
                          Business Details
                      </BreadcrumbPage>
                  </BreadcrumbItem>
              </BreadcrumbList>
          </Breadcrumb>
          <div class="flex flex-row items-center my-8 gap-4">
              <div
                  class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                  <Icon icon="heroicons:building-office-2" class="w-6 h-6" />
              </div>
              <span class="flex flex-col">
                  <h1 class="text-2xl font-bold">Business Details</h1>
                  <span class="text-sm text-gray-500">View business details and manage business</span>
              </span>
              <Button v-if="isSantéAdmin()" variant="outline" @click="handleCancel" class="ml-auto">
                <Icon icon="heroicons:arrow-left" class="mr-2" />
                Back
              </Button>
          </div>
      
          <div>
              <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                          <h2 class="text-xl font-semibold">Company Details</h2>
                      </div>
                      <div class="flex items-center gap-2">
                          <Button v-if="checkPermission('delete_business')" variant="outline" @click="openDeleteBusinessDialog">
                              <Icon icon="heroicons:trash" class="w-5 h-5 mr-2" />
                              Delete
                          </Button>
                          <Button v-if="checkPermission('update_business')" @click="handleEditBusiness" class="btn-primary">
                              <Icon icon="heroicons:pencil-square" class="w-5 h-5 mr-2" />
                              Edit
                          </Button>
                          <!-- <Button variant="destructive" @click="openDeleteBusinessDialog">
                              <Icon icon="heroicons:trash" class="w-5 h-5 mr-2" />
                              Delete
                          </Button> -->
                      </div>
                  </div>
                  
                  <div class="grid grid-cols-[200px_1fr] overflow-hidden">
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500">Company Logo</div>
                      <div class="p-4 text-gray-600">
                          <img v-if="editBusinessDialogData.business?.logo_url" :src="editBusinessDialogData.business.logo_url" alt="Company Logo" class="h-20 w-20 object-contain">
                          <div v-else class="h-20 w-20 bg-gray-100 flex items-center justify-center rounded">
                              <Icon icon="heroicons:building-office-2" class="w-10 h-10 text-gray-400" />
                          </div>
                      </div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Company Name</div>
                      <div class="p-4 border-t">{{ editBusinessDialogData.business?.name }}</div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">SSM No.</div>
                      <div class="p-4 text-gray-500 border-t">{{ editBusinessDialogData.business?.registration_number }}</div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t">Address</div>
                      <div class="p-4 text-gray-500 border-t">
                          {{ editBusinessDialogData.business?.address?.street_line1 }}<br v-if="editBusinessDialogData.business?.address?.street_line2">
                          {{ editBusinessDialogData.business?.address?.street_line2 }}<br v-if="editBusinessDialogData.business?.address?.street_line2">
                          {{ editBusinessDialogData.business?.address?.city }}
                      </div>
      
                      <div class="bg-gray-50 p-4 font-semibold text-gray-500 border-t border-b">Postcode</div>
                      <div class="text-gray-500 border-t border-b grid grid-cols-3 gap-4">
                          <div class="p-4">{{ editBusinessDialogData.business?.address?.postal_code }}</div>
                          <div class="font-semibold bg-gray-50 p-4">State</div>
                          <div class="p-4">{{ editBusinessDialogData.business?.address?.state }}</div>
                      </div>
      
                  </div>
              </div>
          </div>

          <BusinessConfiguration />

          <!-- User List and Outlet List -->
          <div class="mt-8">
                <!-- User List and Outlet List Tabs -->
                <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            v-for="tab in [
                                { name: 'User Listing', icon: 'heroicons:users', current: activeTab === 'User Listing' },
                                { name: 'Outlet Listing', icon: 'heroicons:building-storefront', current: activeTab === 'Outlet Listing' }
                            ]"
                            :key="tab.name"
                            @click="activeTab = tab.name"
                            :class="[
                                tab.current
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2'
                            ]"
                        >
                            <Icon :icon="tab.icon" class="w-5 h-5" />
                            {{ tab.name }}
                        </button>
                    </nav>
                </div>
                <!-- User Listing -->
                <div class="mt-4" v-if="activeTab === 'User Listing'">
                        
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
                <!-- Outlet Listing -->
                <div class="mt-4" v-if="activeTab === 'Outlet Listing'">
                    <div class="flex flex-row justify-between items-center mb-4">
                        <div class="relative w-96 mt-4">
                            <span class="absolute inset-y-0 left-3 flex items-center">
                                <Icon icon="heroicons:magnifying-glass" class="h-5 w-5 text-gray-500" />
                            </span>
                            <Input 
                                v-model="searchOutlet"
                                placeholder="Search"
                                class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                            />
                        </div>

                        <div class="flex gap-2">
                            <Button v-if="checkPermission('create_outlet')" @click="handleManageOutletGroupButton"
                                class="btn-primary">
                                Manage Outlet Group
                            </Button>
                            <Button v-if="checkPermission('create_outlet')" @click="handleAddOutletButton"
                                class="btn-primary">
                                <Icon icon="ph:plus-bold" class="w-4 h-4" />
                                Add Outlet
                            </Button>
                        </div>
                    </div>
                    <DynamicTable 
                        :columns="outletsColumns" 
                        :data="outlets" 
                        :currentPage="meta.page"
                        :totalPages="meta.total_pages"
                        @pageSizeChange="handlePageSizeChange"
                        @pageChange="handlePageChange"
                        :disable-filter="true"
                        :disable-toolbar="true"
                    >
                    </DynamicTable>
                </div>
            </div>
        </div>

        <BusinessDetailsFormDialog
          :is-open="editBusinessDialogData.isOpen"
          :mode="editBusinessDialogData.mode"
          :business="editBusinessDialogData.business"
          :is-loading="editBusinessDialogData.isLoading"
          @submit="handleSaveBusiness"
          @cancel="editBusinessDialogData.isOpen = false"
        />

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
          :is-open="deleteBusinessDialogData.isOpen"
          :title="deleteBusinessDialogData.title"
          :description="deleteBusinessDialogData.description"
          :confirmation-text="deleteBusinessDialogData.confirmation"
          :show-confirmation-input="true"
          @confirm="handleDeleteBusiness"
          @cancel="deleteBusinessDialogData.isOpen = false"
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
