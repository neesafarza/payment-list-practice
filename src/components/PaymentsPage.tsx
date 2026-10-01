import { useState } from "react";
import { I18N } from "../constants/i18n";
import { usePayments } from "../hooks/usePayments";
import { getPaymentsErrorMessage } from "../utils/errorMessage";
import { Container, ErrorBox, Spinner, Title } from "./components";
import { Pagination } from "./Pagination";
import { PaymentsTable } from "./PaymentsTable";
import { SearchBar } from "./SearchBar";

const FIRST_PAGE = 1;
const PAGE_SIZE = 5;

export const PaymentsPage = () => {
  // searchInput is what is typed; appliedSearch is what was last submitted.
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  // Currency applies as soon as it is selected; there is no draft value.
  const [currency, setCurrency] = useState("");
  const [page, setPage] = useState(FIRST_PAGE);

  const query = usePayments({
    search: appliedSearch || undefined,
    currency: currency || undefined,
    page,
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
    setPage(FIRST_PAGE);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    setPage(FIRST_PAGE);
  };

  const handleClear = () => {
    setSearchInput("");
    setAppliedSearch("");
    setCurrency("");
    setPage(FIRST_PAGE);
  };

  const hasActiveFilter = searchInput !== "" || appliedSearch !== "" || currency !== "";

  const totalPages = query.data ? Math.ceil(query.data.total / query.data.pageSize) : 0;
  // While placeholder data is showing, the real total for this page is unknown.
  const canGoForward = !query.isPlaceholderData && page < totalPages;

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onSubmit={handleSearch}
        onClear={handleClear}
        showClear={hasActiveFilter}
      />
      {query.isPending && <Spinner role="status" />}
      {query.isError && (
        <ErrorBox role="alert">{getPaymentsErrorMessage(query.error)}</ErrorBox>
      )}
      {query.isSuccess && (
        <PaymentsTable
          payments={query.data.payments}
          footer={
            <Pagination
              page={page}
              canGoBack={page > FIRST_PAGE}
              canGoForward={canGoForward}
              onPrevious={() => setPage((current) => current - 1)}
              onNext={() => setPage((current) => current + 1)}
            />
          }
        />
      )}
    </Container>
  );
};
