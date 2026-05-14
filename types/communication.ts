import type { Business } from '@/types/business';


export interface Onboarding {
	id: string;
	business_id: string;
	business?: Business;
	title: string;
	description?: string;
	image_url?: string;
	is_active: boolean;
	sort_order: number;
	created_at: string;
	updated_at?: string;
}

export interface Announcement {
	id: string;
	business_id: string;
	business?: Business;
	title: string;
	description: string;
	image_url?: string;
	is_active: boolean;
	sort_order: number;
	start_date?: string;
	end_date?: string;
	created_at: string;
	updated_at?: string;
	_showDropdown?: boolean;
}

export interface Delivery {
	id: string;
	business_id: string;
	business?: Business;
	image_url?: string;
	delivery_type: string;
	is_active: boolean;
	created_at: string;
	updated_at?: string;
	_showDropdown?: boolean;
}

export interface FeedbackQuestion {
	id: string;
	business_id: string;
	business?: Business;
	question: string;
	section: string;
	image_url?: string;
	is_active: boolean;
	sort_order: number;
	created_at: string;
	updated_at?: string;
}