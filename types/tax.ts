export interface Tax {
    id?: string;
    external_id?: string;
    business_id: string;
    name: string;
    rate_percentage: number;
    is_inclusive: boolean;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProductTax {
    id?: string;
    product_id: string;
    tax_id: string;
    tax?: Tax;
    created_at?: string;
}
