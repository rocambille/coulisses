import { screen, waitFor } from "@testing-library/react";
import PlayLayout from "../../src/react/components/play/PlayLayout";
import { mockCsrfToken, mockFetch, renderAsync, stubRoute } from "./utils";

beforeEach(() => {
  mockCsrfToken();
  mockFetch();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("<PlayLayout />", () => {
  it("should mount successfully", async () => {
    const Stub = stubRoute("/plays/:playId", () => <PlayLayout />);

    await renderAsync(<Stub initialEntries={["/plays/1"]} />);

    await waitFor(() => screen.getByRole("heading", { level: 1 }));
  });
});
