import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { PaymentsPage } from "./PaymentsPage";
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
    expect(alert).toHaveTextContent(I18N.SOMETHING_WENT_WRONG);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(getInput()).toBeInTheDocument();

    fireEvent.click(queryClearButton()!);

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
});
