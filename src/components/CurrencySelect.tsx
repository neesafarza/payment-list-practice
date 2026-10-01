import { CURRENCIES } from "../constants";
import { I18N } from "../constants/i18n";
import { Select } from "./components";

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CurrencySelect = ({ value, onChange }: CurrencySelectProps) => (
  <Select
    aria-label={I18N.CURRENCY_FILTER_LABEL}
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    <option value="">{I18N.CURRENCIES_OPTION}</option>
    {CURRENCIES.map((currency) => (
      <option key={currency} value={currency}>
        {currency}
      </option>
    ))}
  </Select>
);
