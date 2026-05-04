import { useQuery } from "@tanstack/react-query";

export interface ExchangeRates {
  [key: string]: number;
}

const fetchRates = async (): Promise<ExchangeRates> => {
  // Use open.er-api.com for a comprehensive and free set of rates against USD
  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  const data = await response.json();

  if (data.result !== "success") {
    throw new Error("Failed to fetch exchange rates");
  }

  return data.rates;
};

export const useExchangeRates = () => {
  return useQuery<ExchangeRates>({
    queryKey: ["exchange-rates"],
    queryFn: fetchRates,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};