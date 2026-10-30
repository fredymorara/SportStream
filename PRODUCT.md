# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People who want a simpler way to discover live and upcoming sports events through a single interface. The primary creator context is also educational: the project is used to learn React, state management, and UI/UX design.

## Product Purpose

SportStream turns live-sports data from third-party APIs into an efficient event discovery and viewing interface. It reduces the hassle of finding an event, understanding its status and sport, and opening an available stream source. Success means people can scan current events quickly and reach an available viewing surface with minimal friction, while the project remains a clear learning vehicle for frontend development.

## Positioning

SportStream is a learning project focused on making third-party live-sports data easier to consume through a focused React interface. Its meaningful position is not exclusive sports coverage or original streaming infrastructure; it is the combination of practical stream discovery and hands-on frontend/UI learning.

## Operating Context

The app fetches event data from public third-party APIs, refreshes the event list periodically, and presents live, upcoming, and ended events by sport. People can search and filter the event list, select an event, choose among available stream variants, and use the player surface, including fullscreen playback.

## Capabilities and Constraints

- React web application with Redux state management and client-side routing.
- Home experience for featured events, search, sport categories, live status, upcoming times, and fallback imagery.
- Player route for an event with available stream selection, embedded playback, loading/error states, poster fallbacks, and fullscreen controls.
- Data is sourced from third-party APIs and may be unavailable, incomplete, or changed outside the app's control.
- Educational project only.
- SportStream does not create, host, or independently source sports streams; playback is based on sources returned by third-party APIs.
- Future work must not imply ownership, licensing, or distribution of third-party streams.

## Brand Commitments

- The product name is SportStream.
- Existing product copy must preserve the educational purpose and the third-party-source disclaimer.

## Evidence on Hand

- [README.md](./README.md) documents the educational purpose, public API approach, and legal/source boundary.
- [src/pages/HomePage.tsx](./src/pages/HomePage.tsx) implements live/upcoming event loading, refresh, search, sport grouping, and featured-event selection.
- [src/pages/PlayerPage.tsx](./src/pages/PlayerPage.tsx) implements event playback, stream selection, poster fallbacks, and fullscreen behavior.
- [src/services/api.ts](./src/services/api.ts) defines the third-party API integrations and normalized event/stream data model.

## Product Principles

1. Make live-sports discovery fast and low-friction.
2. Keep event status, timing, sport, and source choices understandable at a glance.
3. Be resilient to changing third-party data and unavailable media.
4. Preserve a clear educational and legal boundary around external stream sources.
5. Use the product as a practical, maintainable vehicle for learning frontend and UI/UX craft.
