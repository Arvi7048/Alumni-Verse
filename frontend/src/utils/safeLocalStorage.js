export const safeLocalStorage = {
  getItem(key) {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        return null;
      }
    }
    return null;
  },
  setItem(key, value) {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.error("Error setting localStorage item:", error);
      }
    }
  },
  removeItem(key) {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing localStorage item:", error);
      }
    }
  },
  clear() {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.error("Error clearing localStorage:", error);
      }
    }
  }
};
