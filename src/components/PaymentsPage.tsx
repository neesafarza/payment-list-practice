import { useState } from "react";
import { I18N } from "../constants/i18n";
import { usePayments } from "../hooks/usePayments";
import { Container, ErrorBox, Spinner, Title } from "./components";
import { PaymentsTable } from "./PaymentsTable";
import { SearchBar } from "./SearchBar";

const PAGE = 1;
const PAGE_SIZE = 5;

export const PaymentsPage = () => {
  // searchInput is what is typed; appliedSearch is what was last submitted.
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const query = usePayments({
    search: appliedSearch || undefined,
    page: PAGE,
    pageSize: PAGE_SIZE,
  });

  const handleSearch = () => setAppliedSearch(searchInput.trim());

  const handleClear = () => {
    setSearchInput("");
    setAppliedSearch("");
  };

  const hasActiveFilter = searchInput !== "" || appliedSearch !== "";

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      <SearchBar
        value={searchInput}
        onChange={setSearchInput}
        onSubmit={handleSearch}
        onClear={handleClear}
        showClear={hasActiveFilter}
      />
      {query.isPending && <Spinner role="status" />}
      {query.isError && <ErrorBox role="alert">{I18N.SOMETHING_WENT_WRONG}</ErrorBox>}
      {query.isSuccess && <PaymentsTable payments={query.data.payments} />}
    </Container>
  );
};
