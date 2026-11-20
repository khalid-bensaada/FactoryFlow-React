import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '../utils/errors.js';

export default function useFetch(fetcher, deps = []) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetcherRef.current());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, ...deps]);

  return { data, loading, error, reload: load };
}
