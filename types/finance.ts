import type { ModifierGroupOption, Product, ProductCategory } from "./menu"
import type { Outlet } from "./outlet"
import type { User } from "./user"

export interface FinanceTransaction {
    order_id: string
    outlet_name: string
    receipt_no: string
    product_names: string
    transaction_date: string
    payment_method: string
    price: number
    item_details: ItemDetail[]
    status: string
  }
  
  export interface ItemDetail {
    product_id: string
    product_name: string
    quantity: number
    price: number
    image_url: string
  }
  
  export interface ExpensesOutlet {
      id: string
      outlet_id: string
      outlet?: Outlet
      expenses_category: string
      expenses_date: string
      expenses_amount: number
      expenses_description: string
      expenses_attachment_url: string
  }
  
  export interface FullReport {
      outlet_id: string
      outlet_name: string
      outlet_image_url: string
      cash: number
      qr: number
      grab: number
      shopee: number
      total_sales: number
      expense_category_labor: number
      expense_category_utilities_and_services: number
      expense_category_cleaning_and_maintenance_supplies: number
      expense_category_transportation_and_logistics: number
      expense_category_marketing_and_promotion: number
      expense_category_equipment_and_supplies: number
      expense_category_administration_and_operational_supplies: number
      expense_category_other: number
      total_expenses: number
  }
  
  export interface GetFullReportResponse {
      total_sales_info: number
      total_sales_product: number
      total_sales_modifier: number
      full_reports: FullReport[]
  }

  export interface FinanceSummary {
    sales_info: SalesInfo
    sales_by_category: SalesByCategory[]
    sales_by_product: SalesByProduct[]
    sales_by_modifier_options: SalesByModifierOptions[]
    sales_by_employee: SalesByEmployee[]
  }

  export interface SalesInfo {
    gross_sales: number
    total_discount: number
    total_service_charge: number
    total_tax: number
    total_net_sales: number
    total_redeem_points: number
    total_cash_rounding: number
    total_sales: number
    total_cost: number
    gross_profit: number
    net_profit: number
    no_of_sales_trans: number
    average_sales_per_trans: number
    no_of_voided_trans: number
    total_voided_amount: number
    total_customer_sign_up_membership: number
    member_sales: number
    non_member_sales: number
    member_sales_quantity: number
    non_member_sales_quantity: number
    unpaid_orders: number
    cash_sales: number
    duitnow_qr_sales: number
    card_sales: number
    cash_closing: number
  }

  export interface SalesByCategory {
    product_category: ProductCategory // Replace with proper ProductCategory type
    gross_sales: number
    quantity_sold: number
    total_discount: number
  }

  export interface SalesByProduct {
    product: Product // Replace with proper Product type
    gross_sales: number
    quantity_sold: number
    total_cost: number
    total_discount: number
    total_profit: number
    sold_by_payment_method: Map<string, number>
  }

  export interface SalesByModifierOptions {
    modifier_options: ModifierGroupOption // Replace with proper ModifierOptions type
    gross_sales: number
    quantity_sold: number
    total_discount: number
  }

  export interface SalesByEmployee {
    employee: User // Replace with proper User type
    number_of_sales: number
    total_net_sales: number
  }

  export interface OverviewPerformance {
    sales_by_product_outlet: SalesByProduct[]
    sales_by_product_grab: SalesByProduct[]
    sales_by_product_shopee: SalesByProduct[]
    sales_by_modifier: SalesByModifierOptions[]
    sales_by_payment_method: SalesByPaymentMethod[]
    hourly_sales_performance: HourlySalesPerformance
  }

  export interface SalesByPaymentMethod {
    payment_method: string
    total_sales: number
    total_quantity: number
  }

  export interface HourlySalesPerformance {
    total_sales: number
    hourly_sales: HourlySale[]
  }
  
  export interface HourlySale {
    total_sales: number
    time: string
  }