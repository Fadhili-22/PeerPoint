import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ResourcesContext = createContext(null);

export function ResourcesProvider({ children }) {
  const [counsellorActivity, setCounsellorActivity] = useState([]);
  const [adminResourceActivity, setAdminResourceActivity] = useState([]);

  const pushCounsellorActivity = useCallback((text, variant = "primary", icon = "done") => {
    setCounsellorActivity((prev) =>
      [
        {
          id: `counsellor-activity-${Date.now()}-${prev.length}`,
          icon,
          variant,
          text,
          time: "Just now",
        },
        ...prev,
      ].slice(0, 10),
    );
  }, []);

  const pushAdminResourceActivity = useCallback(
    (title, description, variant = "primary") => {
      setAdminResourceActivity((prev) =>
        [
          {
            id: `admin-resource-activity-${Date.now()}-${prev.length}`,
            title,
            description,
            time: "Just now",
            variant,
          },
          ...prev,
        ].slice(0, 10),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      counsellorActivity,
      adminResourceActivity,
      pushCounsellorActivity,
      pushAdminResourceActivity,
    }),
    [
      counsellorActivity,
      adminResourceActivity,
      pushCounsellorActivity,
      pushAdminResourceActivity,
    ],
  );

  return (
    <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error("useResources must be used within a ResourcesProvider");
  }
  return context;
}
