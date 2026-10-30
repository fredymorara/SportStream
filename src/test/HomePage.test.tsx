import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { configureStore } from "@reduxjs/toolkit";
import HomePage from "../pages/HomePage";
import matchesReducer from "../store/matchesSlice";
import { api } from "../services/api";
import type { APIMatch } from "../services/api";

const sampleMatches: APIMatch[] = [
  {
    id: "football-1",
    title: "North FC vs South FC",
    category: "Football",
    date: Date.now() + 60 * 60 * 1000,
    endsAt: Date.now() + 2 * 60 * 60 * 1000,
    status: "upcoming",
    uriName: "football-1",
    alwaysLive: false,
    streamLinks: [],
    allowPastStreams: false,
    provider: "ppv",
  },
  {
    id: "baseball-1",
    title: "Harbor Baseball",
    category: "Baseball",
    date: Date.now() + 60 * 60 * 1000,
    endsAt: Date.now() + 2 * 60 * 60 * 1000,
    status: "upcoming",
    uriName: "baseball-1",
    alwaysLive: false,
    streamLinks: [],
    allowPastStreams: false,
    provider: "ppv",
  },
];

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
};

const renderHome = () => {
  const store = configureStore({ reducer: { matches: matchesReducer } });
  return render(
    <HelmetProvider>
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <HomePage />
          <LocationProbe />
        </MemoryRouter>
      </Provider>
    </HelmetProvider>,
  );
};

describe("HomePage navigation and filtering", () => {
  beforeEach(() => {
    vi.spyOn(api, "getAllMatches").mockResolvedValue(sampleMatches);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("isolates football events and persists the filter in the URL", async () => {
    const user = userEvent.setup();
    renderHome();

    await screen.findAllByRole("heading", { name: "North FC vs South FC" });
    await user.click(screen.getAllByRole("button", { name: "Football" })[0]);

    expect(await screen.findByRole("heading", { name: "Football events" })).toBeVisible();
    const cards = screen.getAllByRole("button", { name: /Watch / });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Football");
    expect(screen.getByTestId("location")).toHaveTextContent("/?sport=football");
  });

  it("resets the category and query when Home/logo is clicked", async () => {
    const user = userEvent.setup();
    renderHome();

    await screen.findAllByRole("heading", { name: "North FC vs South FC" });
    await user.click(screen.getAllByRole("button", { name: "Football" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Home" })[0]);

    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: "Watch North FC vs South FC" })[0],
      ).toBeVisible(),
    );
    expect(screen.getByTestId("location")).toHaveTextContent("/");
    expect(screen.getByRole("button", { name: "Watch Now" })).toBeVisible();
  });

  it("activates match cards with the keyboard", async () => {
    const user = userEvent.setup();
    renderHome();

    const card = (
      await screen.findAllByRole("button", {
        name: "Watch North FC vs South FC",
      })
    )[1];
    card.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location")).toHaveTextContent("/watch/football-1");
  });
});
