export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type PurchaseSource = 'shopify' | 'zettle' | 'manual'

export interface Customer {
  id: string
  user_id: string
  email: string
  name: string
  member_id: string
  points_balance: number
  tier: Tier
  avatar_url: string | null
  created_at: string
}

export interface Purchase {
  id: string
  customer_id: string
  source: PurchaseSource
  reference_number: string | null
  total_amount: number
  points_awarded: number
  claimed_at: string
  created_at: string
}

export interface PurchaseItem {
  id: string
  purchase_id: string
  sku: string
  product_name: string
  brand: string
  quantity: number
  unit_price: number
  image_url: string | null
  created_at: string
}

export interface ClaimToken {
  id: string
  token: string
  zettle_transaction_id: string
  expires_at: string
  claimed_at: string | null
  purchase_id: string | null
  line_items: LineItem[]
  total_amount: number
  created_at: string
}

export interface LineItem {
  sku: string
  product_name: string
  brand: string
  quantity: number
  unit_price: number
}

export interface Product {
  id: string
  sku: string
  product_name: string
  brand: string
  unit_price: number
  image_url: string | null
  active: boolean
  created_at: string
}

export interface UnclaimedShopifyOrder {
  id: string
  email: string
  shopify_order_id: string
  total_amount: number
  line_items: LineItem[]
  created_at: string
}

// Supabase Database type shape (used to type the client)
export type Database = {
  public: {
    Tables: {
      customers: { Row: Customer; Insert: Omit<Customer, 'id' | 'created_at'>; Update: Partial<Customer> }
      purchases: { Row: Purchase; Insert: Omit<Purchase, 'id' | 'created_at'>; Update: Partial<Purchase> }
      purchase_items: { Row: PurchaseItem; Insert: Omit<PurchaseItem, 'id' | 'created_at'>; Update: Partial<PurchaseItem> }
      claim_tokens: { Row: ClaimToken; Insert: Omit<ClaimToken, 'id' | 'created_at'>; Update: Partial<ClaimToken> }
      unclaimed_shopify_orders: { Row: UnclaimedShopifyOrder; Insert: Omit<UnclaimedShopifyOrder, 'id' | 'created_at'>; Update: Partial<UnclaimedShopifyOrder> }
    }
  }
}
