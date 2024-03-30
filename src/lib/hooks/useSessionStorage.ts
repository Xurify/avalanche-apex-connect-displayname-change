import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    "session-storage": CustomEvent;
  }
}

type UseSessionStorageOptions<T> = {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
  expireIn?: number;
};

const IS_SERVER = typeof window === "undefined";

export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseSessionStorageOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>] {
  const { initializeWithValue = true, expireIn } = options;

  const serializer = useCallback<(value: T) => string>(
    (value) => {
      if (options.serializer) {
        return options.serializer(value);
      }

      return JSON.stringify(value);
    },
    [options]
  );

  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      if (options.deserializer) {
        return options.deserializer(value);
      }

      if (value === "undefined") {
        return undefined as unknown as T;
      }

      const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return defaultValue;
      }

      return parsed as T;
    },
    [options, initialValue]
  );

  const readValue = useCallback((): T => {
    const initialValueToUse = initialValue instanceof Function ? initialValue() : initialValue;
    if (IS_SERVER) {
      return initialValueToUse;
    }
  
    try {
      const raw = window.sessionStorage.getItem(key);
      const expirationTime = window.sessionStorage.getItem(`${key}_expiration`);
  
      if (expirationTime && Date.now() > parseInt(expirationTime, 10)) {
        window.sessionStorage.removeItem(key);
        window.sessionStorage.removeItem(`${key}_expiration`);
        return initialValueToUse;
      }
  
      return raw ? deserializer(raw) : initialValueToUse;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValueToUse;
    }
  }, [initialValue, key, deserializer]);
  
  const [storedValue, setStoredValue] = useState(() => {
    if (initializeWithValue) {
      return readValue();
    }

    return initialValue instanceof Function ? initialValue() : initialValue;
  });

  const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value) => {
    if (IS_SERVER) {
      console.warn(`Tried setting sessionStorage key “${key}” even though environment is not a client`);
    }

    try {
      const newValue = value instanceof Function ? value(readValue()) : value;
      window.sessionStorage.setItem(key, serializer(newValue));

      console.log('expireIn', expireIn);
      if (expireIn) {
        const expirationTime = Date.now() + expireIn * 1000;
        window.sessionStorage.setItem(`${key}_expiration`, expirationTime.toString());
      }

      setStoredValue(newValue);
      window.dispatchEvent(new StorageEvent("session-storage", { key }));
    } catch (error) {
      console.warn(`Error setting sessionStorage key “${key}”:`, error);
    }
  });

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return;
      }
      const expirationTime = window.sessionStorage.getItem(`${key}_expiration`);
      if (expirationTime && Date.now() > parseInt(expirationTime, 10)) {
        window.sessionStorage.removeItem(key);
        window.sessionStorage.removeItem(`${key}_expiration`);
        setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
      } else {
        setStoredValue(readValue());
      }
    },
    [key, readValue, initialValue]
  );

  useEventListener("storage", handleStorageChange);

  useEventListener("session-storage", handleStorageChange);

  return [storedValue, setValue];
}
