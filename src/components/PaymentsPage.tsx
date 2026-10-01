import { useState } from "react";
import { I18N } from "../constants/i18n";
import { usePayments } from "../hooks/usePayments";
import { getPaymentsErrorMessage } from "../utils/errorMessage";
import { Container, ErrorBox, Spinner, Title } from "./components";
import { PaymentsTable } from "./PaymentsTable";
import { SearchBar } from "./SearchBar";

const PAGE = 1;
const PAGE_SIZE = 5;

export const PaymentsPage = () => {
  // searchInput is what is typed; appliedSearch is what was last submitted.
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  // Currency applies as soon as it is selected; there is no draft value.
  const [currency, setCurrency] = useState("");

  const query = usePayments({
    search: appliedSearch || undefined,
    currency: currency || undefined,
    page: PAGE,
    pageSize: PAGE_SIZE,
  });

  const handleSearch = () => {
    const term = searchInput.trim();
    // An unchanged term leaves the query key as it was, so a failed request
    // would never be retried; refetch it explicitly.
    if (term === appliedSearch && query.isError) {
      query.refetch();
      return;
    }
    setAppliedSearch(term);
  };

  const handleClear = () => {
    setSearchInput("");
    setAppliedSearch("");
    setCurrency("");
  };

  const hasActiveFilter = searchInput !== "" || appliedSearch !== "" || currency !== "";

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        currency={currency}
        onCurrencyChange={setCurrency}
        onSubmit={handleSearch}
        onClear={handleClear}
        showClear={hasActiveFilter}
      />
      {query.isPending && <Spinner role="status" />}
      {query.isError && (
        <ErrorBox role="alert">{getPaymentsErrorMessage(query.error)}</ErrorBox>
      )}
      {query.isSuccess && <PaymentsTable payments={query.data.payments} />}
    </Container>
  );
};
