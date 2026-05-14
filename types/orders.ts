import type { Business } from "./business"
import type { Outlet } from "./outlet"
import type { User } from "./user"
import type { ModifierGroup, ModifierGroupOption, Product } from "./menu"

export interface BuyerData {
    buyer_name: string
    buyer_tin?: string
    buyer_brn: string
    buyer_brn_scheme_id: string
    buyer_address_line_1: string
    buyer_address_line_2: string
    buyer_address_line_3: string
    buyer_city: string
    buyer_postal_code: string
    buyer_country_subentity_code: string
    buyer_telephone: string
    buyer_email: string
}

export interface SubmitEInvoiceByOrderRequest {
order_id: string
buyer_data: BuyerData
}

export interface Order {
    id: string
    business_id: string
    business?: Business
    outlet_id: string
    outlet?: Outlet
    user_id: string
    user?: User
    customer_id: string
    // customer?: Customer
    order_number: string
    order_date: string
	order_type: string
	invoice_number: string
	invoice_date: string
	// Order status (pending, payment, completed, cancelled)
	order_status: string
	// GrabFood Info
	platform: string
	platform_order_id: string
	platform_state: string
	// TaxID              string         `json:"tax_id" gorm:"type:varchar(255)"`
	// TaxAmount          float32        `json:"tax_amount" gorm:"type:decimal(10,2)"`
	// gross total refer to the total amount of the order without tax, service charge, and discount
	gross_total: number
	net_total: number
	rounded_amount: number
	rounded_net_total: number
	amount_received: number
	delivery_fee: number
	tax_charge: number
	tax_percentage: number
	service_charge: number
	service_charge_percentage: number
	discount_type: string
	discount_amount: number
	discount_percentage: number
	payment_method: string
	payment_channel: string
	payment_status: string
	notes: string
	table_number: string
	e_invoice_submission_id: string
	e_invoice_status: string
	e_invoice_url: string
	e_invoice_rejected_reason: string
	order_details: OrderDetails
	order_items: OrderItem[]
	 pickup_at: string
	 completed_at: string
	 points_rewarded: number
	 points_rewarded_at: string
	 voucher_discount_amount: number
	 voucher_discount_type: string
	 voucher_discount_percentage: number
	 exp_rewarded: number
	 exp_rewarded_at: string
}

export interface OrderItem {
	id: string
	order_id: string
	order: Order
	product_id: string
	product: Product
	quantity: number
	unit_price: number
	sub_total: number
	item_notes: string
	selected_modifier_groups: SelectedModifierGroup[]
}

// use for modifier group and modifier option (latest)
export interface SelectedModifierGroup {
	id: string
	order_item_id: string
	order_item: OrderItem
	modifier_group_id: string
	modifier_group: ModifierGroup
	modifier_options_id: string
	modifier_options: ModifierGroupOption
	modifier_option_quantity: number
	created_at: string
	updated_at: string
	deleted_at: string
}

export interface OrderDetails {
	id: string
	order_id: string
	order: Order
	grab_short_order_number: string
	shopeefood_short_order_num: string
	customer_name: string
	customer_phone: string
	customer_address: string
	customer_latitude: number
	customer_longitude: number
	estimated_order_ready_time: string
	max_order_ready_time: string
	customer_voucher_id: string
	// customer_voucher: CustomerVoucher
	// tracking_info: TrackingInfo
	created_at: string
	updated_at: string
	deleted_at: string
}