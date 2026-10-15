// Every request goes to the Django server that serves this React build, so
// URLs are built from the page's own origin (nothing is hardcoded to
// localhost). During `npm start` the "proxy" entry in package.json forwards
// /djangoapp/* to Django on port 8000. Set REACT_APP_API_URL at build time
// only if the API lives on a different origin.
export const apiUrl = (path) =>
  (process.env.REACT_APP_API_URL || window.location.origin) + path;

// Reads a JSON response, returning null if the body is not valid JSON.
export const readJson = async (res) => {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
};
