import React from "react";
import { useNavigate, useSearchParams } from "react-router";

export function useOnLogin() {
  const navigate = useNavigate();
  const [search] = useSearchParams(window.location.search);

  return React.useCallback(() => {
    if (search.has("token")) window.close();
    else navigate("/" + window.location.search, { viewTransition: true });
  }, [search, navigate]);
}
