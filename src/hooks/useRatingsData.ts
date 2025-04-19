import { useState, useEffect } from 'react';
import { Rating, FilterState } from '../models/types';
import { useRatingService } from '../context/RatingServiceContext';

interface RatingsDataResult {
  ratings: Rating[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching ratings data based on filters
 * 
 * @param filters Optional filters to apply to the ratings query
 * @returns Object containing ratings, loading state, error, and refetch function
 */
export const useRatingsData = (filters?: Partial<FilterState>): RatingsDataResult => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchCounter, setRefetchCounter] = useState<number>(0);
  
  // Get the rating service
  const ratingService = useRatingService();
  
  // Fetch ratings when filters change or refetch is called
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchRatings = async () => {
      try {
        const data = await ratingService.getRatings(filters);
        
        if (isMounted) {
          setRatings(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchRatings();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [filters, refetchCounter, ratingService]);
  
  // Function to trigger a refetch
  const refetch = () => {
    setRefetchCounter(prev => prev + 1);
  };
  
  return { ratings, loading, error, refetch };
};

/**
 * Custom hook for fetching a rating summary based on filters
 * 
 * @param filters Optional filters to apply to the summary query
 * @returns Object containing summary data, loading state, and error
 */
export const useRatingSummary = (filters?: Partial<FilterState>) => {
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get the rating service
  const ratingService = useRatingService();
  
  // Fetch summary when filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchSummary = async () => {
      try {
        const data = await ratingService.getRatingSummary(filters);
        
        if (isMounted) {
          setSummary(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchSummary();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [filters, ratingService]);
  
  return { summary, loading, error };
};

/**
 * Custom hook for fetching rating distribution data based on filters
 * 
 * @param filters Optional filters to apply to the distribution query
 * @returns Object containing distribution data, loading state, and error
 */
export const useRatingDistribution = (filters?: Partial<FilterState>) => {
  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get the rating service
  const ratingService = useRatingService();
  
  // Fetch distribution when filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchDistribution = async () => {
      try {
        const data = await ratingService.getRatingDistribution(filters);
        
        if (isMounted) {
          setDistribution(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchDistribution();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, [filters, ratingService]);
  
  return { distribution, loading, error };
};