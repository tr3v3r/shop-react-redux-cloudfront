import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";
import { useAvailableProducts } from "./products";

export function useCart() {
  const products = useAvailableProducts();

  return useQuery<CartItem[], AxiosError>("cart", async () => {
    const res = await axios.get<{
      items: [{ count: number; product_id: string; product_price: number }];
    }>(`${API_PATHS.cart}/profile/cart`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    });

    return res.data.items.map((item) => {
      const product = products.data?.find((p) => p.id === item.product_id);
      if (!product) {
        throw new Error("Product not found");
      }
      return { product, count: item.count };
    });
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    []
  );
}

export function useUpsertCart() {
  return useMutation(
    (values: { count: number; product_id: string; product_price: number }) =>
      axios.put<CartItem[]>(`${API_PATHS.cart}/profile/cart`, values, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      })
  );
}
