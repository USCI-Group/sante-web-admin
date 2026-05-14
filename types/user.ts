import type { Address } from '@/types/common'

export interface User {
  id: string | null
  business_id: string | null
  outlet_id: string | null
  first_name: string
  surname: string
  group_role_id: string | null
  identification_no: string
  employee_no: string
  email: string
  phone: string
  address: Address
  GroupRole: GroupRole
}

export interface GroupRole {
  id: string | null
  role_id: string
  business_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  permissions: Permission[]
  Role: Role
}

export interface Permission {
  id: string | null
  name: string
  role_id: string
  enabled: boolean
  group_role_id: string
  module: string
  sub_module: string
}

export interface PermissionPreset {
	ID: string | null
	Name: string
	Module: string
	SubModule: string
	RoleID: string | null
	Enabled: boolean
  Description: string
}

export interface Role {
    id?: string
    name: string
    role_type: string
    business_id: string | null
    description: string
    created_at?: string
    updated_at?: string
    permission_presets: PermissionPresetType[]
}

export type PermissionPresetType = {
  ID: string
  Type: string
  Name: string
  Description: string
  Module: string
  SubModule: string
  ModuleOrder: number
  SubModuleOrder: number
  PermissionOrder: number
  Enabled: boolean
}