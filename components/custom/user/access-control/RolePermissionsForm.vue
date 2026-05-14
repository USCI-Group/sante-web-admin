<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { reactive } from 'vue'
import type { PermissionPresetType } from '@/types/user'
import { numberToAlphabet } from '@/constants/common'

const props = defineProps<{
    permissionPresetTypes: PermissionPresetType[] | null
}>()

type PermissionsByNestedGrouped = Record<string, Record<string, PermissionPresetType[]>>

const permissionsByNestedGrouped = ref<PermissionsByNestedGrouped>({})

onMounted(async () => {
  console.log(props.permissionPresetTypes)
  mapPermissionPresetTypes()
})

const mapPermissionPresetTypes = () => {
  const permissionPresetTypesGroupedByModule = props.permissionPresetTypes?.reduce((acc, permission) => {
    if (!acc[permission.Module]) {
      acc[permission.Module] = []
    }
    acc[permission.Module].push(permission)
    return acc
  }, {} as Record<string, PermissionPresetType[]>)


  for (const module in permissionPresetTypesGroupedByModule) {
    const permissions = permissionPresetTypesGroupedByModule[module]

    const permissionsGroupedBySubModule = permissions.reduce((acc, permission) => {
      if (!acc[permission.SubModule]) {
        acc[permission.SubModule] = []
      }
      acc[permission.SubModule].push(permission)
      return acc
    }, {} as Record<string, PermissionPresetType[]>)

    permissionsByNestedGrouped.value[module] = permissionsGroupedBySubModule
  }
}

const isModuleExpanded = ref<Record<string, boolean>>({
  'User Management': true,
})
const isModuleCheckboxChecked = ref<Record<string, boolean>>({})
const isSubModuleCheckboxChecked = ref<Record<string, boolean>>({})

const toggleModule = (module: string) => {
  isModuleExpanded.value[module] = !isModuleExpanded.value[module]
}

const getModuleOrder = (module: string) => {
  return props.permissionPresetTypes?.find(p => p.Module === module)?.ModuleOrder ?? 0
}

watch(() => ({...permissionsByNestedGrouped.value}), (newVal, oldVal) => {
  Object.entries(newVal).forEach(([module, subModules]) => {
    const allSubModulesEnabled = Object.values(subModules).every(subModule => subModule.every(permission => permission.Enabled))
    isModuleCheckboxChecked.value[module] = allSubModulesEnabled
    Object.entries(subModules).forEach(([subModule, permissions]) => {
      // Check if all permissions in submodule are enabled
      const allPermissionsEnabled = permissions.every(permission => permission.Enabled)
      isSubModuleCheckboxChecked.value[subModule] = allPermissionsEnabled

    })
  })
}, { deep: true })

watch(() => ({...isSubModuleCheckboxChecked.value}), (newVal, oldVal) => {
  if(Object.keys(oldVal).length === 0) return
  const changedSubModules = Object.entries(newVal).filter(([subModule, value]) => value !== oldVal[subModule])
  changedSubModules.forEach(([subModule, isSubModuleCheckboxChecked]) => {
    props.permissionPresetTypes?.forEach(permission => {
      if (permission.SubModule === subModule) {
        permission.Enabled = isSubModuleCheckboxChecked
      }
    })
  })

}, { deep: true })

watch(() => ({...isModuleCheckboxChecked.value}), (newVal, oldVal) => {
  if(Object.keys(oldVal).length === 0) return
  const changedModules = Object.entries(newVal).filter(([module, value]) => value !== oldVal[module])
  changedModules.forEach(([module, isModuleCheckboxChecked]) => {
    props.permissionPresetTypes?.forEach(permission => {
      if (permission.Module === module) {
        permission.Enabled = isModuleCheckboxChecked
      }
    })
  })
}, { deep: true })


</script>

<template>
    <div class="mt-2">
        <div class="py-2">
            <Label class="text-gray-500">Permission</Label>
        </div>

        <!-- Actions Header -->
        <div class="bg-gray-100 px-4 py-2">
            <span class="text-sm font-medium text-gray-700">Actions</span>
        </div>

        <div v-if="permissionPresetTypes">
            <div v-for="(module, key) in permissionsByNestedGrouped" class="border-b">
                <!-- Module Permission Header -->
                <div class="flex items-center justify-between p-4 cursor-pointer bg-gray-50" @click="toggleModule(key)">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium">{{ getModuleOrder(key) }}. {{ key }}</span>
                    </div>
                    <div class="flex items-center gap-5">
                        <Icon :icon="isModuleExpanded[key] ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-5 h-5" />
                        <Checkbox @click.stop v-model="isModuleCheckboxChecked[key]" />
                    </div>
                </div>

                <div v-show="isModuleExpanded[key]" class="border-t">
                  <!-- Sub Module Permission -->
                  <div v-for="(subModule, subModuleKey) in module"
                      :class="{'border-b': false}" class="p-4 pl-8">
                      <div class="flex items-center justify-between mb-3">
                          <span class="text-sm">{{ getModuleOrder(key) }}.{{ subModule[0].SubModuleOrder }} {{ subModuleKey }}</span>
                          <Checkbox v-model="isSubModuleCheckboxChecked[subModuleKey]" />
                      </div>

                      <div class="space-y-2 pl-4" >
                        <div v-for="(actionPermission, actionPermissionKey) in subModule"
                            class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">{{ numberToAlphabet(actionPermission.PermissionOrder) }}) {{ actionPermission.Description }}</span>
                            <Checkbox v-model="actionPermission.Enabled" />
                        </div>
                      </div>
                  </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
export default {
    name: 'RolePermissionsForm'
}
</script>