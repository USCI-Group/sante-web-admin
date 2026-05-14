import type { Address } from '@/types/common'

export interface Business {
	id?: string
	name: string
	email: string
	phone: string
	address: Address
	website: string
	registration_number: string
	logo_url?: string
	created_at: string
	updated_at: string
	status: string | 'ACTIVE'
}

export interface BusinessConfiguration {
	id: string
	business_id: string
	business?: Business
	grab_client_id?: string
	grab_client_secret?: string
	grab_express_client_id?: string
	grab_express_client_secret?: string
	shopee_client_id?: string
	shopee_client_secret?: string
	terms_of_service?: string
	privacy_policy?: string
	created_at: string
}