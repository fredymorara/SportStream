# SportStream

This application consumes a free-to-use API and does not produce, host, or source sports streams itself. It is an educative project only. Any copyright for streams should be directed to the original stream source.

## Overview

SportStream is built to demonstrate how a modern frontend application can fetch and display sports-related data from public APIs. It focuses on structure, state management, and reusable components while keeping the app lightweight and easy to understand.

## Technology Used

- **React**: For the app UI and component-based architecture.
- **Redux**: For managing global application state and keeping data consistent across the app.
- **React Router**: For client-side routing and page navigation.
- **Axios / Fetch**: For API calls to the free data source.
- **Tailwind CSS / Styled Components**: For styling the interface and layouts.

## Structure

The project is organized to separate concerns clearly:

- `components/`: Reusable UI building blocks such as headers, cards, and lists.
- `pages/`: Screen-level components that represent different views or routes.
- `redux/` or `store/`: State management logic, including actions, reducers, and store configuration.
- `services/` or `api/`: API helpers and network request functions.
- `styles/`: Global styles, theme settings, and layout utilities.

## How It Works

1. The app makes requests to a free-to-use sports API.
2. API responses are stored in Redux state.
3. Components consume the Redux state and render sports data.
4. Navigation is handled with React Router to move between screens.

## Notes

- This project is for educational purposes.
- It does not create or provide any stream sources.
- Any legal claims or copyright concerns should be directed to the original stream source.
