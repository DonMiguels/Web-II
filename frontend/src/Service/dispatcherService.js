import axios from "axios";

const dispatcherApi = axios.create({
  baseURL:
    import.meta.env.VITE_DISPATCHER_API_URL ||
    import.meta.env.VITE_API_ROOT_URL ||
    "http://localhost:3000",
  withCredentials: true,
});

const normalizeDispatcherResponse = (response) => {
  const body = response?.data;

  if (body && typeof body === "object") {
    const statusCode = Number(body.statusCode) || response?.status || 200;
    return {
      ok: statusCode >= 200 && statusCode < 300,
      statusCode,
      message: body.message || "",
      data: body.data,
      raw: body,
    };
  }

  return {
    ok: response?.status >= 200 && response?.status < 300,
    statusCode: response?.status || 200,
    message: typeof body === "string" ? body : "",
    data: null,
    raw: body,
  };
};

const normalizeDispatcherError = (error) => {
  const body = error?.response?.data;

  if (body && typeof body === "object") {
    return {
      ok: false,
      statusCode: Number(body.statusCode) || error?.response?.status || 500,
      message: body.message || "Error calling dispatcher",
      data: body.data,
      raw: body,
    };
  }

  return {
    ok: false,
    statusCode: error?.response?.status || 500,
    message:
      error?.message ||
      (typeof body === "string" ? body : "Error calling dispatcher"),
    data: null,
    raw: body,
  };
};

const resolveProfile = ({ profile, user }) => {
  if (profile) return profile;
  if (user?.profile) return user.profile;
  if (user?.profile_name) return user.profile_name;
  return "admin";
};

export const runDispatcherTransaction = async ({
  transactionId,
  data = {},
  profile,
  user,
  lang = "es",
}) => {
  if (!transactionId) {
    return {
      ok: false,
      statusCode: 400,
      message: "transactionId is required",
      data: null,
      raw: null,
    };
  }

  const payload = {
    lang,
    transaction_id: Number(transactionId),
    profile: resolveProfile({ profile, user }),
    data,
  };

  try {
    const response = await dispatcherApi.post("/", payload);
    return normalizeDispatcherResponse(response);
  } catch (error) {
    return normalizeDispatcherError(error);
  }
};
