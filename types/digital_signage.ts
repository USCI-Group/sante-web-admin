export interface DigitalSignageContent {
	id: string
	business_id: string
	content_type: string
	content_url: string
	sort_order: number
	created_at: string
	updated_at: string
    _showDropdown: boolean
}

export interface DigitalSignageSlide {
	id: string
	business_id: string
	title: string
	digital_signage_slide_items: DigitalSignageSlideItem[]
	created_at: string
	updated_at: string
}

export interface DigitalSignageSlideItem {
	id: string
	content_id: string
	content: DigitalSignageContent
	sort_order: number
	created_at: string
	updated_at: string
}
