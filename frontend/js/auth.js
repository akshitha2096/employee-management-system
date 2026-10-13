// Handles admin login state. The credentials are verified by the backend
// (HTTP Basic over HTTPS) and kept only for the current browser tab session.
const Auth = (() => {
  const KEY = "ems_auth";
  const base = () => window.APP_CONFIG.API_BASE_URL.replace(/\/+$/, "");

  const getToken = () => sessionStorage.getItem(KEY);
  const logout = () => { sessionStorage.removeItem(KEY); window.location.replace("index.html"); };

  async function login(username, password) {
    const token = "Basic " + btoa(unescape(encodeURIComponent(username + ":" + password)));
    let res;
    try {
      res = await fetch(base() + "/api/auth/login", { headers: { Authorization: token } });
    } catch (e) {
      throw new Error("Cannot reach the server. Please try again later.");
    }
    if (res.status === 401) throw new Error("Invalid username or password");
    if (!res.ok) throw new Error("Login failed (" + res.status + ")");
    sessionStorage.setItem(KEY, token);
  }

  return { login, logout, getToken, base };
})();
