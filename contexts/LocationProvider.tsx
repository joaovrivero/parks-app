import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LocationContextType {
  location: Location.LocationObject | null;
  hasPermission: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [status, requestPermissionInternal] = Location.useForegroundPermissions();

  const requestPermission = async () => {
    if (status && !status.granted && status.canAskAgain) {
      await requestPermissionInternal();
    }
  };

  useEffect(() => {
    if (status) {
      setHasPermission(status.granted);
      setIsLoading(false);

      // Auto-request permission on first launch
      if (!status.granted && status.canAskAgain) {
        requestPermissionInternal();
      }
    }
  }, [status, requestPermissionInternal]);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        return;
      }

      try {
        setIsLoading(true);
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [hasPermission]);

  const value: LocationContextType = {
    location,
    hasPermission,
    isLoading,
    requestPermission,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
