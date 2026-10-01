import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, test } from "vitest";
import { getPaymentsErrorMessage } from "./errorMessage";
import { I18N } from "../constants/i18n";

const axiosErrorWithStatus = (status: number) =>
  new AxiosError("Request failed", undefined, undefined, undefined, {
    status,
    statusText: "",
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe("getPaymentsErrorMessage", () => {
  test("maps 404 to payment not found", () => {
    expect(getPaymentsErrorMessage(axiosErrorWithStatus(404))).toBe(I18N.PAYMENT_NOT_FOUND);
  });

  test("maps 500 to internal server error", () => {
    expect(getPaymentsErrorMessage(axiosErrorWithStatus(500))).toBe(
      I18N.INTERNAL_SERVER_ERROR
    );
  });

  test("maps other 5xx statuses to internal server error", () => {
    expect(getPaymentsErrorMessage(axiosErrorWithStatus(503))).toBe(
      I18N.INTERNAL_SERVER_ERROR
    );
  });

  test("maps other statuses to the generic message", () => {
    expect(getPaymentsErrorMessage(axiosErrorWithStatus(401))).toBe(
      I18N.SOMETHING_WENT_WRONG
    );
  });

  test("maps a network error with no response to the generic message", () => {
    const error = new AxiosError("Network Error", AxiosError.ERR_NETWORK);
    expect(getPaymentsErrorMessage(error)).toBe(I18N.SOMETHING_WENT_WRONG);
  });

  test("maps a non-axios error to the generic message", () => {
    expect(getPaymentsErrorMessage(new Error("boom"))).toBe(I18N.SOMETHING_WENT_WRONG);
  });
});
