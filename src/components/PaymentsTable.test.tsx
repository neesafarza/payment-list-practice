import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, test } from "vitest";
import { PaymentsTable } from "./PaymentsTable";
import { I18N } from "../constants/i18n";
import type { Payment } from "../types/payment";

const payment: Payment = {
  id: "pay_1",
  customerName: "Alice Green",
  amount: 250,
  customerAddress: "101 Green St",
  currency: "USD",
  status: "completed",
  date: new Date(2024, 3, 15, 11, 0, 0).toISOString(),
  description: "Service payment",
};

describe("PaymentsTable", () => {
  test("renders the six headers in order", () => {
    render(<PaymentsTable payments={[payment]} />);

    const headers = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(headers).toEqual([
      I18N.TABLE_HEADER_PAYMENT_ID,
      I18N.TABLE_HEADER_DATE,
      I18N.TABLE_HEADER_AMOUNT,
      I18N.TABLE_HEADER_CUSTOMER,
      I18N.TABLE_HEADER_CURRENCY,
      I18N.TABLE_HEADER_STATUS,
    ]);
  });

  test("renders a payment's values, formatted", () => {
    render(<PaymentsTable payments={[payment]} />);

    const cells = screen.getAllByRole("cell").map((c) => c.textContent);
    expect(cells).toEqual([
      "pay_1",
      "15/04/2024, 11:00:00",
      "250.00",
      "Alice Green",
      "USD",
      "completed",
    ]);
  });

  test("shows a dash for an empty customer name and currency", () => {
    render(
      <PaymentsTable payments={[{ ...payment, customerName: "", currency: "" }]} />
    );

    const cells = screen.getAllByRole("cell").map((c) => c.textContent);
    expect(cells[3]).toBe(I18N.EMPTY_CUSTOMER);
    expect(cells[4]).toBe(I18N.EMPTY_CURRENCY);
  });

  test("shows the no-payments message instead of a table for an empty list", () => {
    render(<PaymentsTable payments={[]} />);

    expect(screen.getByText(I18N.NO_PAYMENTS_FOUND)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("renders the footer below the rows", () => {
    render(<PaymentsTable payments={[payment]} footer={<p>footer content</p>} />);

    expect(screen.getByText("footer content")).toBeInTheDocument();
  });

  test("renders one row per payment", () => {
    render(
      <PaymentsTable payments={[payment, { ...payment, id: "pay_2", status: "refunded" }]} />
    );

    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("refunded")).toBeInTheDocument();
  });
});
