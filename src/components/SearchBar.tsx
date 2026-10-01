import { useRef, type FormEvent } from "react";
import { I18N } from "../constants/i18n";
import { ClearButton, FilterRow, SearchButton, SearchInput } from "./components";
import { CurrencySelect } from "./CurrencySelect";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  showClear: boolean;
}

export const SearchBar = ({
  value,
  onChange,
  currency,
  onCurrencyChange,
  onSubmit,
  onClear,
  showClear,
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleClear = () => {
    onClear();
    // The Clear button unmounts on click; keep keyboard focus in the form.
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FilterRow>
        <SearchInput
          ref={inputRef}
          type="search"
          aria-label={I18N.SEARCH_LABEL}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <CurrencySelect value={currency} onChange={onCurrencyChange} />
        <SearchButton type="submit">{I18N.SEARCH_BUTTON}</SearchButton>
        {showClear && (
          <ClearButton type="button" onClick={handleClear}>
            {I18N.CLEAR_FILTERS}
          </ClearButton>
        )}
      </FilterRow>
    </form>
  );
};
