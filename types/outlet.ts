import type { Address } from '@/types/common'
import type { Business } from '@/types/business'
import type { User } from '@/types/user'
export interface Outlet {
  id?: string
  business_id: string
  external_id?: string
  name: string
  email: string
  phone: string
  address: Address
  website?: string
  registration_number?: string
  tin?: string
  image_url?: string
  outlet_static_qr?: string
  outlet_status: string
  latitude?: number
  longitude?: number
  is_school_outlet?: boolean
  business?: Business
  created_at?: string
  updated_at?: string
  deleted_at?: string
}

export interface MerchantSecret {
  id?: string
  outlet_id: string
  fiuu_merchant_id?: string
  fiuu_application_code?: string
  fiuu_secret_key?: string
  fiuu_verify_key?: string
  fiuu_offline_secret_key?: string
  fiuu_cloud_erc_secret_key?: string
  fiuu_cloud_erc_account_id?: string
  fiuu_cloud_erc_account_password?: string
  grab_store_id?: string
  grab_integration_status?: string  
  grab_menu_sync_state?: string
  shopee_store_id?: string
  shopee_menu_sync_state?: string
  shopee_integration_status?: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  business_id: string
  business?: Business
  outlet_id: string
  outlet?: Outlet
  user_id: string
  user?: User
  order_number: string
  order_date: string
  order_type: string
  invoice_number: string
  invoice_date: string
  // Order status (pending, payment, completed, cancelled)
  order_status: string
  // total amount refer to the total amount of the order without tax, service charge, and discount
  gross_total: number
  net_total: number
  tax_charge: number
  tax_percentage: number
  service_charge: number
  service_charge_percentage: number
  discount_type: string
  discount_amount: number
  discount_percentage: number
  payment_method: string
  payment_status: string
  notes: string
  table_number: string
  e_invoice_submission_id?: string
  e_invoice_status?: string
  e_invoice_url?: string
  created_at: string
  updated_at?: string
}

export interface OutletGroup {
  id?: string
  name: string
  description?: string
  business_id: string
  business?: Business
  Outlets?: Outlet[]
  Users?: User[]
  created_at?: string
  updated_at?: string
}

export interface OutletOperationSchedule {
  id?: string
  outlet_id: string
  outlet?: Outlet
  day_of_week: string
  is_closed: boolean
  open_time: string
  close_time: string
  break_start_time?: string
  break_end_time?: string
  is_break_active: boolean
  is_active: boolean
  created_at: string
}

export interface OutletOperationTimeSlot {
  id?: string
  outlet_id: string
  outlet?: Outlet
  start_time: string
  end_time: string
  is_pickup_available: boolean
  is_active: boolean
  created_at: string
}