# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm start` - Starts Expo development server
- **Run on Android**: `npm run android` - Builds and runs on Android device/emulator
- **Run on iOS**: `npm run ios` - Builds and runs on iOS device/simulator
- **Web development**: `npm run web` - Starts web development server
- **Build**: `npm run build` - Builds web version
- **Prebuild**: `npm run prebuild` - Generates native code
- **Lint**: `npm run lint` - Runs ESLint and Prettier checks
- **Format**: `npm run format` - Auto-fixes ESLint issues and formats with Prettier

## Architecture Overview

This is a React Native/Expo mobile application for park events management built with:

### Core Stack
- **Framework**: Expo SDK 52 with React Native 0.76.6
- **Routing**: Expo Router with file-based routing and typed routes
- **UI**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase for authentication and database
- **Maps**: Mapbox via @rnmapbox/maps
- **Language**: TypeScript with strict mode

### Authentication System
- Supabase authentication with custom secure storage implementation
- `AuthProvider` context manages session state across the app
- Custom `LargeSecureStore` class for encrypted token storage using AES encryption
- Auth state guards protect authenticated routes

### App Structure
- **File-based routing** with Expo Router
- **Route groups**: `(auth)` for login/signup, `(tabs)` for main app
- **Tab navigation** with events, create, and profile tabs
- **Modal presentations** for overlays
- **Dynamic routes** like `/event/[id]` for individual events

### Key Features
- **Location-based events** with Mapbox integration
- **Image uploads** via Expo Image Picker and Supabase Storage
- **Address autocomplete** with custom implementation
- **Real-time data** from Supabase
- **Event creation and management**
- **User profiles and authentication**

### Database Schema
- Uses TypeScript types from `~/types/supabase.ts` and `~/types/db.ts`
- Events have location points stored as PostGIS geometry
- User authentication managed by Supabase Auth

### Path Aliasing
- `~/` prefix maps to project root via TypeScript path mapping
- Enables clean imports like `~/components/Button`

### Styling Approach
- NativeWind for utility-first styling
- Global styles in `global.css`
- Component-specific styling with Tailwind classes