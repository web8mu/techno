declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

export const trackViewItem = (product: any) => {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'view_item', {
    currency: 'MUR',
    value: parseFloat(product.sale_price || product.price),
    items: [{ item_id: product.sku, item_name: product.name, price: parseFloat(product.sale_price || product.price) }],
  });
  window.fbq?.('track', 'ViewContent', {
    content_ids: [product.sku],
    content_name: product.name,
    value: parseFloat(product.sale_price || product.price),
    currency: 'MUR',
  });
};

export const trackAddToCart = (product: any, qty: number) => {
  if (typeof window === 'undefined') return;
  const price = parseFloat(product.sale_price || product.price);
  window.gtag?.('event', 'add_to_cart', {
    currency: 'MUR',
    value: price * qty,
    items: [{ item_id: product.sku, item_name: product.name, price, quantity: qty }],
  });
  window.fbq?.('track', 'AddToCart', { content_ids: [product.sku], value: price * qty, currency: 'MUR' });
};

export const trackBeginCheckout = (cartTotal: number, items: any[]) => {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'begin_checkout', { currency: 'MUR', value: cartTotal, items });
  window.fbq?.('track', 'InitiateCheckout', { value: cartTotal, currency: 'MUR' });
};

export const trackPurchase = (order: any) => {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', 'purchase', {
    transaction_id: order.order_number,
    currency: 'MUR',
    value: parseFloat(order.total),
    items: order.items?.map((i: any) => ({
      item_id: i.sku_snapshot,
      item_name: i.name_snapshot,
      price: parseFloat(i.unit_price),
      quantity: i.qty,
    })),
  });
  window.fbq?.('track', 'Purchase', { value: parseFloat(order.total), currency: 'MUR' });
};
