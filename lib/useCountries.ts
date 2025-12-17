// hooks/useCountrySearch.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
interface Country {
  id: string;
  name: string;
  code_2: string;
  code_3: string;
  phoneCode: string;
}
interface UseCountrySearchResult {
  countries: Country[];
  filteredCountries: Country[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
export const useCountrySearch = (
  apiBase: string = 'https://nuvelserver.godigital.workers.dev'
): UseCountrySearchResult => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Charger tous les pays au montage
  const loadCountries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBase}/countries/all-country`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const result = await response.json();
      setCountries(result.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[useCountrySearch] Erreur:', message);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);
  // Charger au montage
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);
  // Filtrer les pays en fonction de la recherche (temps réel)
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return countries; // Retourner tous si pas de recherche
    }
    const query = searchQuery.toLowerCase().trim();
    return countries.filter(country => {
      // Recherche par nom
      const matchName = country.name.toLowerCase().includes(query);
      
      // Recherche par code (alpha2 ou alpha3)
      const matchCode2 = country.code_2.toLowerCase().includes(query);
      const matchCode3 = country.code_3.toLowerCase().includes(query);
      
      // Recherche par code téléphonique
      const matchPhone = country.phoneCode.includes(query);
      return matchName || matchCode2 || matchCode3 || matchPhone;
    });
  }, [countries, searchQuery]);
  return {
    countries,
    filteredCountries,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    refresh: loadCountries,
  };
};