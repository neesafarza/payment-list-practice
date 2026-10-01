import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { PaymentsPage } from "./PaymentsPage";
import { API_URL, CURRENCIES } from "../constants";
import { I18N } from "../constants/i18n";
import { server } from "../mocks/node";

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// A fresh client per test, so one test's cache cannot satisfy another's query.
const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PaymentsPage />
    </QueryClientProvider>
  );
};

// Simulates a transient failure: only the next request gets a 500.
const failNextRequest = () =>
  server.use(
    http.get(`*${API_URL}`, () => HttpResponse.json({ message: "boom" }, { status: 500 }), {
      once: true,
    })
  );

const waitForRows = (count: number) =>
  waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(count));

const getInput = () => screen.getByRole("searchbox", { name: I18N.SEARCH_LABEL });
const getSearchButton = () => screen.getByRole("button", { name: I18N.SEARCH_BUTTON });
const queryClearButton = () => screen.queryByRole("button", { name: I18N.CLEAR_FILTERS });

describe("PaymentsPage search and clear", () => {
  test("hides Clear Filters until there is input", async () => {
    renderPage();
    await waitForRows(6);

    expect(queryClearButton()).not.toBeInTheDocument();
  });

  test("shows Clear Filters on typing, without changing the table", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_205" } });

    expect(queryClearButton()).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(6);
    expect(screen.getByText("pay_134_1")).toBeInTheDocument();
  });

  test("searches when the form is submitted", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_134_1" } });
    fireEvent.submit(getInput().closest("form")!);

    await waitForRows(2);
    expect(screen.getByText("pay_134_1")).toBeInTheDocument();
  });

  test("trims spaces around the search term", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "  pay_134_1  " } });
    fireEvent.click(getSearchButton());

    await waitForRows(2);
    expect(screen.getByText("pay_134_1")).toBeInTheDocument();
  });

  test("treats a whitespace-only search as no search", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "   " } });
    fireEvent.click(getSearchButton());

    expect(screen.getAllByRole("row")).toHaveLength(6);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("shows an error for a search with no matches and recovers on clear", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "zzz" } });
    fireEvent.click(getSearchButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(I18N.PAYMENT_NOT_FOUND);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(getInput()).toBeInTheDocument();

    fireEvent.click(queryClearButton()!);

    await waitForRows(6);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("shows the server error message when the API returns 500", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_500" } });
    fireEvent.click(getSearchButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(I18N.INTERNAL_SERVER_ERROR);
  });

  test("shows the generic message for any other error status", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "401" } });
    fireEvent.click(getSearchButton());

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(I18N.SOMETHING_WENT_WRONG);
  });

  test("retries a failed search when the same term is submitted again", async () => {
    renderPage();
    await waitForRows(6);

    failNextRequest();
    fireEvent.change(getInput(), { target: { value: "pay_134_1" } });
    fireEvent.click(getSearchButton());
    await screen.findByRole("alert");

    fireEvent.click(getSearchButton());

    await waitForRows(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("retries a failed initial load when an empty search is submitted", async () => {
    failNextRequest();
    renderPage();
    await screen.findByRole("alert");

    fireEvent.click(getSearchButton());

    await waitForRows(6);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("Clear Filters empties the input, restores the list and hides itself", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_134_1" } });
    fireEvent.click(getSearchButton());
    await waitForRows(2);

    fireEvent.click(queryClearButton()!);

    expect(getInput()).toHaveValue("");
    await waitForRows(6);
    expect(queryClearButton()).not.toBeInTheDocument();
  });

  test("Clear Filters moves focus to the search input", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_134_1" } });
    fireEvent.click(queryClearButton()!);

    expect(getInput()).toHaveFocus();
  });
});

const getCurrencySelect = () =>
  screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL });

// Currency is the fifth column of each data row.
const getCurrencyColumn = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.querySelectorAll("td")[4]?.textContent);

const waitForOnlyCurrency = (currency: string, rows: number) =>
  waitFor(() => {
    const column = getCurrencyColumn();
    expect(column).toHaveLength(rows);
    expect(column.every((value) => value === currency)).toBe(true);
  });

describe("PaymentsPage currency filter", () => {
  test("lists an all-currencies option followed by every currency", () => {
    renderPage();

    const options = Array.from(getCurrencySelect().querySelectorAll("option"));
    expect(options.map((option) => option.value)).toEqual(["", ...CURRENCIES]);
    expect(options[0]).toHaveTextContent(I18N.CURRENCIES_OPTION);
    expect(getCurrencySelect()).toHaveValue("");
  });

  test("filters by currency as soon as one is selected", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getCurrencySelect(), { target: { value: "USD" } });

    await waitForOnlyCurrency("USD", 5);
  });

  test("combines the applied search with the selected currency", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_134" } });
    fireEvent.click(getSearchButton());
    await waitForRows(6);

    fireEvent.change(getCurrencySelect(), { target: { value: "USD" } });

    await waitForOnlyCurrency("USD", 1);
    expect(screen.getByText("pay_134_1")).toBeInTheDocument();
  });

  test("does not apply unsubmitted search text when the currency changes", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_134" } });
    fireEvent.change(getCurrencySelect(), { target: { value: "USD" } });

    await waitForOnlyCurrency("USD", 5);
  });

  test("shows Clear Filters when only a currency is selected, and clearing resets it", async () => {
    renderPage();
    await waitForRows(6);
    expect(queryClearButton()).not.toBeInTheDocument();

    fireEvent.change(getCurrencySelect(), { target: { value: "USD" } });
    await waitForOnlyCurrency("USD", 5);

    fireEvent.click(queryClearButton()!);

    expect(getCurrencySelect()).toHaveValue("");
    await waitFor(() => expect(new Set(getCurrencyColumn()).size).toBeGreaterThan(1));
    expect(queryClearButton()).not.toBeInTheDocument();
  });

  test("shows payment not found when the search and currency have no match", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.change(getInput(), { target: { value: "pay_134" } });
    fireEvent.click(getSearchButton());
    await waitForRows(6);

    fireEvent.change(getCurrencySelect(), { target: { value: "ZAR" } });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(I18N.PAYMENT_NOT_FOUND);
  });
});

const getPreviousButton = () => screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON });
const getNextButton = () => screen.getByRole("button", { name: I18N.NEXT_BUTTON });
const pageLabel = (page: number) => `${I18N.PAGE_LABEL} ${page}`;

// Page 1 of the unfiltered list starts with pay_134_1, page 2 with pay_456_1.
const goToPageTwo = async () => {
  fireEvent.click(getNextButton());
  await screen.findByText("pay_456_1");
};

describe("PaymentsPage pagination", () => {
  test("starts on page 1 with Previous disabled and Next enabled", async () => {
    renderPage();
    await waitForRows(6);

    expect(screen.getByText(pageLabel(1))).toBeInTheDocument();
    expect(getPreviousButton()).toBeDisabled();
    expect(getNextButton()).toBeEnabled();
  });

  test("Next shows the following page and enables Previous", async () => {
    renderPage();
    await waitForRows(6);

    await goToPageTwo();

    expect(screen.getByText(pageLabel(2))).toBeInTheDocument();
    expect(screen.queryByText("pay_134_1")).not.toBeInTheDocument();
    expect(getPreviousButton()).toBeEnabled();
  });

  test("Previous returns to the earlier page", async () => {
    renderPage();
    await waitForRows(6);
    await goToPageTwo();

    fireEvent.click(getPreviousButton());

    await screen.findByText("pay_134_1");
    expect(screen.getByText(pageLabel(1))).toBeInTheDocument();
    expect(getPreviousButton()).toBeDisabled();
  });

  test("keeps the current rows visible while the next page loads", async () => {
    renderPage();
    await waitForRows(6);

    fireEvent.click(getNextButton());

    expect(screen.getByText("pay_134_1")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await screen.findByText("pay_456_1");
  });

  test("disables Next on the last page", async () => {
    renderPage();
    await waitForRows(6);

    // CZK has a single payment, so its results fit on one page.
    fireEvent.change(getCurrencySelect(), { target: { value: "CZK" } });

    await waitForRows(2);
    expect(getNextButton()).toBeDisabled();
    expect(getPreviousButton()).toBeDisabled();
  });

  test("a new search returns to page 1", async () => {
    renderPage();
    await waitForRows(6);
    await goToPageTwo();

    fireEvent.change(getInput(), { target: { value: "pay_205" } });
    fireEvent.click(getSearchButton());

    await screen.findByText("pay_205_1");
    expect(screen.getByText(pageLabel(1))).toBeInTheDocument();
  });

  test("changing the currency returns to page 1", async () => {
    renderPage();
    await waitForRows(6);
    await goToPageTwo();

    fireEvent.change(getCurrencySelect(), { target: { value: "USD" } });

    await waitForOnlyCurrency("USD", 5);
    expect(screen.getByText(pageLabel(1))).toBeInTheDocument();
  });

  test("Clear Filters returns to page 1", async () => {
    renderPage();
    await waitForRows(6);
    fireEvent.change(getCurrencySelect(), { target: { value: "USD" } });
    await waitForOnlyCurrency("USD", 5);
    fireEvent.click(getNextButton());
    await screen.findByText(pageLabel(2));

    fireEvent.click(queryClearButton()!);

    await screen.findByText("pay_134_1");
    expect(screen.getByText(pageLabel(1))).toBeInTheDocument();
  });
});
