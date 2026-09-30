import { I18N } from "../constants/i18n";
import { usePayments } from "../hooks/usePayments";
import { Container, ErrorBox, Spinner, Title } from "./components";
import { PaymentsTable } from "./PaymentsTable";

const PAGE = 1;
const PAGE_SIZE = 5;

export const PaymentsPage = () => {
  const query = usePayments({ page: PAGE, pageSize: PAGE_SIZE });

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      {query.isPending && <Spinner role="status" />}
      {query.isError && <ErrorBox role="alert">{I18N.SOMETHING_WENT_WRONG}</ErrorBox>}
      {query.isSuccess && <PaymentsTable payments={query.data.payments} />}
    </Container>
  );
};
