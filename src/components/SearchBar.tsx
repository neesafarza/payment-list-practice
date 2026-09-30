import type { FormEvent } from "react";
import { I18N } from "../constants/i18n";
import { ClearButton, FilterRow, SearchButton, SearchInput } from "./components";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  showClear: boolean;
}

export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  onClear,
  showClear,
}: SearchBarProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FilterRow>
        <SearchInput
          type="search"
          aria-label={I18N.SEARCH_LABEL}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <SearchButton type="submit">{I18N.SEARCH_BUTTON}</SearchButton>
        {showClear && (
          <ClearButton type="button" onClick={onClear}>
            {I18N.CLEAR_FILTERS}
          </ClearButton>
        )}
      </FilterRow>
    </form>
  );
};
