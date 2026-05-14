export interface Meta {
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface Option {
  id: string
  name: string
}

export interface OptionWithValue {
  name: string
  value: string
}

export interface SelectOption {
  id: string
  name: string
  selected: boolean
}

export interface Address {
  street_line1: string
  street_line2: string
  street_line3: string
  city: string
  state: string
  postal_code: string
  country: string
}