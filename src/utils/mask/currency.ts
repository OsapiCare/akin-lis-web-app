export const _formatPrice = (price_?: number) => {
    return price_
      ? `${price_.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")} Kz`
      : "0.00 Kz";
  };