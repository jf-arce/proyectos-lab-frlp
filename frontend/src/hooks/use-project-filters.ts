import { useSearchParams } from 'react-router';
import { useDebounce } from './use-debounce';

export function useProjectFilters(onFilterChange?: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') ?? '';
  const selectedLab = searchParams.get('lab') ?? 'all';
  const selectedSkills = searchParams.getAll('skills');

  const debouncedQuery = useDebounce(searchQuery, 400);

  function handleSearchChange(value: string) {
    onFilterChange?.();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('q', value);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  }

  function handleLabChange(value: string) {
    onFilterChange?.();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== 'all') next.set('lab', value);
        else next.delete('lab');
        return next;
      },
      { replace: true },
    );
  }

  function setSkills(skills: string[]) {
    onFilterChange?.();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('skills');
        skills.forEach((s) => next.append('skills', s));
        return next;
      },
      { replace: true },
    );
  }

  return {
    searchQuery,
    selectedLab,
    selectedSkills,
    debouncedQuery,
    handleSearchChange,
    handleLabChange,
    setSkills,
  };
}
