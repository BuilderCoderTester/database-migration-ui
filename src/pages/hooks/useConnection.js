 
 import { API } from "../constants/api";
 import { safeJson } from "../utils/http";
 export const getConnectionId = async () => {
    const res = await fetch(`${API}/get-connection`);
    return safeJson(res);
  };
