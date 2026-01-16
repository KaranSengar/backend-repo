export function calculateDiscount(price: number, discount: number) {
  return price - (price * discount) / 100;
}
