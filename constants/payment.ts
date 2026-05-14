export enum PaymentMethod {
  FPX = 'fpx',
  EWallet = 'e-wallet',
  Cash = 'cash',
  StaticQR = 'static_qr',
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  BNPL = 'bnpl',
}

export const PaymentMethodOptions = [
  { id: PaymentMethod.FPX, name: 'FPX', selected: false },
  { id: PaymentMethod.EWallet, name: 'E-Wallet', selected: false },
  { id: PaymentMethod.Cash, name: 'Cash', selected: false },
  { id: PaymentMethod.StaticQR, name: 'Static QR', selected: false },
  { id: PaymentMethod.CreditCard, name: 'Credit Card', selected: false },
  { id: PaymentMethod.DebitCard, name: 'Debit Card', selected: false },
  { id: PaymentMethod.BNPL, name: 'BNPL', selected: false },
]

export type PaymentMethodType = 'fpx' | 'e-wallet' | 'cash' | 'static_qr' | 'credit_card' | 'debit_card' | 'bnpl'
