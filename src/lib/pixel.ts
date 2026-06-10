declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const fbq = (...args: unknown[]) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
};

export const trackPurchase = (data: {
  value: number;
  orderId: string;
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
}) => {
  fbq(
    "track",
    "Purchase",
    {
      value: data.value,
      currency: "INR",
      content_type: "product",
      order_id: data.orderId,
      contents: data.contents ?? [],
    },
    { eventID: `purchase_${data.orderId}` }
  );
};

export const trackCompleteRegistration = () => {
  fbq("track", "CompleteRegistration", { status: true });
};

export const trackInitiateCheckout = (data: { value: number; numItems: number }) => {
  fbq("track", "InitiateCheckout", {
    value: data.value,
    currency: "INR",
    num_items: data.numItems,
  });
};

export const trackViewContent = (data: {
  id: string;
  name: string;
  value?: number;
}) => {
  fbq("track", "ViewContent", {
    content_ids: [data.id],
    content_name: data.name,
    content_type: "product",
    value: data.value,
    currency: "INR",
  });
};
