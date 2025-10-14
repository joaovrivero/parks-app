# Tech Stack Documentation

## Overview

This document provides an in-depth analysis of the technology stack used in the Parks Events Management mobile application. The application is built as a cross-platform solution using modern React Native tooling and cloud-based services.

## Table of Contents

1. [Core Framework - Expo](#core-framework---expo)
2. [UI Framework - React Native](#ui-framework---react-native)
3. [Styling - NativeWind](#styling---nativewind)
4. [Backend Services - Supabase](#backend-services---supabase)
5. [Maps Integration - Mapbox](#maps-integration---mapbox)
6. [Routing - Expo Router](#routing---expo-router)
7. [State Management](#state-management)
8. [Type Safety - TypeScript](#type-safety---typescript)
9. [Development Tools](#development-tools)
10. [Architecture Patterns](#architecture-patterns)

---

## Core Framework - Expo

### What is Expo?

Expo is a production-grade framework built on top of React Native that provides a complete development environment for building native iOS, Android, and web applications using JavaScript and React.

### Version Used
- **Expo SDK 52** with React Native 0.76.6

### Why Expo?

1. **Unified Development Experience**: Single codebase for iOS, Android, and web
2. **Pre-configured Native Modules**: Access to camera, location, notifications without native code
3. **Over-the-Air Updates**: Deploy updates without app store approval (via EAS Update)
4. **Simplified Build Process**: EAS Build handles complex native compilation
5. **Development Tools**: Expo Go app for instant testing, DevTools for debugging

### Key Expo Features Used

#### File-Based Routing (Expo Router)
Expo Router provides a file-system based routing solution inspired by Next.js, eliminating the need for manual route configuration.

#### EAS (Expo Application Services)
- **EAS Build**: Cloud-based build service for iOS and Android
- **EAS Submit**: Automated app store submission
- **EAS Update**: Over-the-air updates for JavaScript bundles

#### Expo Modules
The application leverages several Expo modules:
- `expo-location`: GPS and geolocation services
- `expo-image-picker`: Camera and gallery access
- `expo-secure-store`: Encrypted local storage
- `expo-crypto`: Cryptographic operations for secure storage
- `expo-constants`: Environment and build constants
- `expo-splash-screen`: Native splash screen control

### Configuration

Expo configuration is managed through:
- `app.json`: Basic app metadata and configuration
- `app.config.js`: Dynamic configuration with environment variables
- `eas.json`: EAS Build and Submit profiles

---

## UI Framework - React Native

### What is React Native?

React Native is a framework for building native mobile applications using React and JavaScript. Unlike hybrid solutions, React Native renders actual native UI components, providing true native performance and feel.

### Version Used
- **React Native 0.76.6**
- **React 18.3.1**

### Core Principles

1. **Learn Once, Write Anywhere**: Use React knowledge to build mobile apps
2. **Native Performance**: Direct bridge to native platform APIs
3. **Hot Reloading**: Instant feedback during development
4. **Component-Based**: Reusable UI components with isolated logic

### Native Components Used

- **View**: Fundamental container component (maps to UIView/ViewGroup)
- **Text**: Text rendering with native typography
- **ScrollView/FlatList**: Performant scrollable lists
- **TextInput**: Native text input with platform-specific keyboards
- **Pressable**: Touch handling with native feedback
- **Image**: Optimized image rendering

### Platform-Specific Code

React Native allows platform-specific implementations when needed:
```typescript
import { Platform } from 'react-native';

const styles = Platform.select({
  ios: { paddingTop: 20 },
  android: { paddingTop: 10 },
  web: { paddingTop: 0 }
});
```

### Performance Optimizations

1. **FlatList Virtualization**: Only renders visible items in large lists
2. **Memo/Callback Hooks**: Prevents unnecessary re-renders
3. **Native Driver Animations**: Offloads animations to native thread
4. **Image Optimization**: Lazy loading and caching strategies

---

## Styling - NativeWind

### What is NativeWind?

NativeWind brings the Tailwind CSS utility-first styling approach to React Native, providing a consistent styling system across web and mobile platforms.

### Version Used
- **NativeWind 4.1.23**
- **Tailwind CSS 3.4.17**

### Benefits

1. **Utility-First CSS**: Rapid UI development with pre-defined classes
2. **Responsive Design**: Platform-specific styling with ease
3. **Type Safety**: IntelliSense support for Tailwind classes
4. **Consistency**: Shared design system across the application
5. **Performance**: Styles compiled at build time, minimal runtime overhead

### Configuration

#### Tailwind Config (`tailwind.config.js`)
Defines the design system tokens:
- Colors, spacing, typography scales
- Custom plugins and extensions
- Content paths for class detection

#### Global Styles (`global.css`)
Base styles and Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Metro Configuration
NativeWind integrates with Metro bundler using `nativewind/metro`:
```javascript
const { withNativeWind } = require('nativewind/metro');
```

### Usage Pattern

```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Hello World
  </Text>
</View>
```

### Advanced Features

- **Dark Mode Support**: `dark:` variant for dark mode styles
- **Platform Variants**: `ios:` and `android:` prefixes
- **Custom Classes**: Extended via Tailwind configuration
- **Dynamic Styles**: Conditional class application with `clsx` pattern

---

## Backend Services - Supabase

### What is Supabase?

Supabase is an open-source Firebase alternative providing backend-as-a-service with PostgreSQL database, authentication, real-time subscriptions, and storage.

### Components Used

#### 1. Supabase Database (PostgreSQL)

**Features:**
- **Relational Database**: Full SQL support with foreign keys and joins
- **PostGIS Extension**: Geospatial data support for location-based features
- **Row Level Security (RLS)**: Database-level authorization
- **Auto-generated REST API**: Instant API from database schema

**Schema Design:**
- `users`: User profiles linked to auth.users
- `events`: Event data with PostGIS geometry for locations
- `attendance`: Event participation tracking
- `comments`: User comments on events

**Geospatial Queries:**
```sql
-- Find events within radius using PostGIS
SELECT * FROM events
WHERE ST_DWithin(
  location,
  ST_MakePoint(longitude, latitude)::geography,
  radius_in_meters
);
```

#### 2. Supabase Authentication

**Authentication Methods:**
- Email/Password authentication
- OAuth providers (configurable)
- Magic link authentication
- JWT-based sessions

**Security Implementation:**
- **Custom Secure Storage**: AES-256 encryption for tokens
- **Session Management**: Automatic token refresh
- **Auth State Persistence**: Encrypted local storage

**LargeSecureStore Implementation:**
```typescript
// Custom secure storage with AES encryption
class LargeSecureStore {
  private async encrypt(value: string): Promise<string> {
    const key = await this.getEncryptionKey();
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      value + key
    );
  }

  async setItem(key: string, value: string) {
    const encrypted = await this.encrypt(value);
    await SecureStore.setItemAsync(key, encrypted);
  }
}
```

#### 3. Supabase Storage

**Features:**
- S3-compatible object storage
- Image upload and retrieval
- Access control with RLS policies
- CDN-optimized delivery

**Usage in App:**
- Event images storage in `event-images` bucket
- Avatar images in `avatars` bucket
- Automatic URL generation for stored files
- Image transformation and optimization

#### 4. Real-time Subscriptions

**Capabilities:**
- Live database changes via WebSockets
- Subscribe to specific tables or queries
- Real-time event updates
- Presence and broadcasting features

**Example:**
```typescript
supabase
  .channel('events')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'events' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

### Type Generation

Supabase CLI generates TypeScript types from database schema:
```bash
supabase gen types typescript --project-id <id> > types/supabase.ts
```

This ensures type safety between frontend and database.

---

## Maps Integration - Mapbox

### What is Mapbox?

Mapbox provides customizable maps, geocoding, and location-based services with high-performance native rendering.

### Library Used
- **@rnmapbox/maps**: React Native wrapper for Mapbox SDKs

### Features Implemented

#### 1. Interactive Maps
- Pan, zoom, and rotate gestures
- Custom map styles and themes
- Marker clustering for performance
- User location tracking

#### 2. Geocoding Services
- **Forward Geocoding**: Address → Coordinates
- **Reverse Geocoding**: Coordinates → Address
- Address autocomplete with Mapbox Search API

#### 3. Location Visualization
- Event markers on map
- User location indicator
- Radius/boundary visualization
- Custom marker icons

### Address Autocomplete Implementation

```typescript
// Custom address autocomplete with Mapbox API
const searchAddress = async (query: string) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}`
  );
  const data = await response.json();
  return data.features; // Address suggestions
};
```

### Performance Considerations

1. **Native Rendering**: Maps rendered on native thread
2. **Marker Clustering**: Groups nearby markers at low zoom levels
3. **Lazy Loading**: Load map tiles as needed
4. **Memory Management**: Efficient marker recycling

---

## Routing - Expo Router

### What is Expo Router?

Expo Router is a file-system based routing library for React Native, bringing Next.js-style routing to mobile apps.

### Version Used
- **Expo Router 4.0.17**

### Routing Structure

```
app/
├── (auth)/              # Auth route group
│   ├── _layout.tsx      # Auth stack layout
│   ├── login.tsx        # Login screen
│   └── signup.tsx       # Signup screen
├── (tabs)/              # Main app tabs
│   ├── _layout.tsx      # Tab navigator layout
│   ├── index.tsx        # Home/Events feed
│   ├── create.tsx       # Create event
│   ├── profile.tsx      # User profile
│   └── events/          # Events section
│       ├── _layout.tsx  # Events stack
│       └── index.tsx    # Events list
├── event/[id]/          # Dynamic routes
│   ├── index.tsx        # Event details
│   └── attendance.tsx   # Attendance list
├── _layout.tsx          # Root layout
└── modal.tsx            # Modal presentations
```

### Key Features

#### 1. File-Based Routing
Routes automatically generated from file structure:
- `app/login.tsx` → `/login`
- `app/event/[id]/index.tsx` → `/event/:id`

#### 2. Route Groups
Parentheses create layout groups without affecting URL:
- `(auth)` groups authentication screens
- `(tabs)` creates tab navigation

#### 3. Typed Routes
TypeScript types for type-safe navigation:
```typescript
import { router } from 'expo-router';

// Type-safe navigation with params
router.push({
  pathname: '/event/[id]',
  params: { id: '123' }
});
```

#### 4. Layouts
Shared layouts wrap child routes:
```tsx
// app/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="create" />
    </Tabs>
  );
}
```

#### 5. Navigation Patterns
- **Stack Navigation**: Hierarchical screen stack
- **Tab Navigation**: Bottom tab bar
- **Modal Presentation**: Overlay screens
- **Deep Linking**: URL-based navigation

---

## State Management

### Context API

The application uses React Context API for global state management:

#### 1. AuthProvider
Manages authentication state across the app:
```typescript
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  // Auto-refresh session
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, session }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2. LocationProvider
Manages user location and permissions:
- GPS permission handling
- Location updates
- Location accuracy settings

#### 3. QueryProvider
Wraps React Query for server state:
- Data fetching and caching
- Infinite scroll pagination
- Optimistic updates

### React Query (TanStack Query)

Used for server-side state management:

**Features:**
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Infinite scroll support

**Example Usage:**
```typescript
const { data, isLoading, refetch } = useQuery({
  queryKey: ['events', filters],
  queryFn: () => fetchEvents(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Local State
- Component state with `useState`
- Form state management
- UI state (modals, dropdowns)

---

## Type Safety - TypeScript

### Configuration

**Strict Mode Enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true
  }
}
```

### Type System

#### 1. Database Types
Auto-generated from Supabase schema:
```typescript
// types/supabase.ts
export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          location: unknown; // PostGIS geometry
          created_at: string;
        };
        Insert: { /* ... */ };
        Update: { /* ... */ };
      };
    };
  };
};
```

#### 2. Domain Types
Custom types for business logic:
```typescript
// types/db.ts
export type Event = Database['public']['Tables']['events']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
```

#### 3. API Types
Request/response types:
```typescript
// types/api.ts
export type CreateEventRequest = {
  title: string;
  description: string;
  location: { lat: number; lng: number };
};
```

### Path Aliases

TypeScript path mapping for clean imports:
```json
{
  "paths": {
    "~/*": ["./*"]
  }
}
```

Usage:
```typescript
import { Button } from '~/components/Button';
import { useAuth } from '~/contexts/AuthProvider';
```

---

## Development Tools

### Build Tools

#### Metro Bundler
- JavaScript bundler for React Native
- Fast refresh for instant updates
- Tree shaking for smaller bundles
- Source maps for debugging

#### Babel
- Transpiles modern JavaScript/TypeScript
- NativeWind transformations
- Plugin ecosystem for optimizations

### Code Quality

#### ESLint
Static code analysis:
- Expo recommended rules
- React hooks rules
- TypeScript-specific rules
- Custom project rules

#### Prettier
Code formatting:
- Consistent code style
- Auto-formatting on save
- Integration with ESLint

### Development Workflow

```bash
# Start development
npm start

# Run on platforms
npm run android
npm run ios
npm run web

# Code quality
npm run lint      # Check for issues
npm run format    # Auto-fix formatting

# Build
npm run build     # Web build
npm run prebuild  # Generate native code
```

---

## Architecture Patterns

### Component Architecture

#### 1. Presentational Components
Pure UI components without business logic:
```tsx
// components/Button.tsx
export const Button = ({ title, onPress, variant }) => (
  <Pressable onPress={onPress} className={`btn-${variant}`}>
    <Text>{title}</Text>
  </Pressable>
);
```

#### 2. Container Components
Components with business logic and state:
```tsx
// app/(tabs)/events/index.tsx
export default function EventsScreen() {
  const { data: events } = useNearbyEvents();
  const { user } = useAuth();

  return <EventsList events={events} currentUser={user} />;
}
```

#### 3. Custom Hooks
Reusable logic extraction:
```tsx
// hooks/useNearbyEvents.tsx
export const useNearbyEvents = () => {
  const { location } = useLocation();

  return useQuery({
    queryKey: ['events', 'nearby', location],
    queryFn: () => fetchNearbyEvents(location),
    enabled: !!location,
  });
};
```

### Data Flow

1. **User Input** → Component
2. **Component** → Custom Hook
3. **Custom Hook** → Supabase Client
4. **Supabase** → PostgreSQL/Storage
5. **Response** → React Query Cache
6. **Cache** → Component Re-render

### Security Architecture

#### 1. Authentication Flow
```
User Login → Supabase Auth → JWT Token →
Encrypted Storage → Auto-refresh → Session Management
```

#### 2. Authorization
- Row Level Security (RLS) in database
- JWT claims for user identity
- API route protection
- Client-side auth guards

#### 3. Data Security
- HTTPS for all API calls
- AES-256 encryption for local storage
- Secure token transmission
- Environment variable protection

### Performance Patterns

#### 1. Lazy Loading
- Dynamic imports for screens
- Image lazy loading
- Infinite scroll pagination

#### 2. Memoization
```typescript
const MemoizedComponent = memo(Component);
const cachedValue = useMemo(() => compute(), [deps]);
const cachedCallback = useCallback(() => {}, [deps]);
```

#### 3. Virtualization
- FlatList for large lists
- Window size optimization
- Item recycling

---

## Conclusion

This tech stack represents a modern, scalable approach to cross-platform mobile development:

- **Expo** provides the foundation for rapid development and deployment
- **React Native** delivers native performance and user experience
- **NativeWind** ensures consistent, maintainable styling
- **Supabase** offers a complete backend solution with real-time capabilities
- **Mapbox** powers location-based features with high-performance maps
- **TypeScript** guarantees type safety and developer experience

The architecture emphasizes:
- **Developer Experience**: Fast iteration with hot reload and type safety
- **User Experience**: Native performance with smooth animations
- **Scalability**: Cloud-based services and efficient data patterns
- **Maintainability**: Clear separation of concerns and reusable components
- **Security**: Encrypted storage, RLS policies, and secure authentication

This combination enables building a production-ready mobile application with a single codebase across iOS, Android, and web platforms.
