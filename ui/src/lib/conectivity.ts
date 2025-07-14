// Remove the health check API dependency
const checkConnectivity = useCallback(async () => {
  const isOnline = navigator.onLine;
  let isServerReachable = false;
  
  // Use a lightweight HEAD request to an existing API endpoint
  try {
    await api.head('/bookmarks', {
      timeout: 3000,
      validateStatus: (status) => status < 500
    });
    isServerReachable = true;
  } catch (error) {
    isServerReachable = false;
  }
  
  setConnectionStatus({
    isOnline,
    isServerReachable,
    lastChecked: new Date()
  });
  
  return { isOnline, isServerReachable };
}, []);