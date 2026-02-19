import {useQuery} from "@tanstack/react-query"

export interface ExchangeRates {
  USD: number;
  EUR: number;
  ZAR: number;
}

const fetchRates = async(): Promise<ExchangeRates> => {
 const [usd, eur] = await Promise.all([
    fetch('https://hexarate.paikama.co/api/rates/USD/ZAR/latest').then(r => r.json()),
    fetch('https://hexarate.paikama.co/api/rates/EUR/ZAR/latest').then(r => r.json()),
  ]);

  return {
    USD: usd.data.mid,
    EUR: eur.data.mid,
    ZAR: 1,
  };
}

export const useExchangeRates = () => {
  return useQuery<ExchangeRates>({
    queryKey: ['exchange-rates'],
    queryFn: fetchRates,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
  });
};