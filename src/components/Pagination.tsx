import { I18N } from "../constants/i18n";
import { PaginationButton, PaginationRow } from "./components";

interface PaginationProps {
  page: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const Pagination = ({
  page,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
}: PaginationProps) => (
  <PaginationRow>
    <PaginationButton type="button" onClick={onPrevious} disabled={!canGoBack}>
      {I18N.PREVIOUS_BUTTON}
    </PaginationButton>
    <span>{`${I18N.PAGE_LABEL} ${page}`}</span>
    <PaginationButton type="button" onClick={onNext} disabled={!canGoForward}>
      {I18N.NEXT_BUTTON}
    </PaginationButton>
  </PaginationRow>
);
