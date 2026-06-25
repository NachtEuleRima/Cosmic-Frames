import { useEffect, useState } from "react";

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function useCartId() {
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("starframe_cart_id");
    if (!id) {
      id = generateUUID();
      localStorage.setItem("starframe_cart_id", id);
    }
    setCartId(id);
  }, []);

  return cartId;
}
