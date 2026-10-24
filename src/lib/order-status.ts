export const orderTransitions: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};
export const orderStatusOptions = (status: string) => [status, ...(orderTransitions[status] || [])];
