/*
 * Optional connection to the Python API.
 *
 * The deployed GitHub Pages app keeps using localStorage and works offline.
 * When the app is opened through FastAPI on port 8000, this small client also
 * copies completed rounds to SQLite.  Keeping the boundary here prevents API
 * details from being scattered through the main scoring code.
 */
(function () {
    const isLocalPythonServer =
        ["127.0.0.1", "localhost"].includes(window.location.hostname) &&
        window.location.port === "8000";
    const apiRoot = window.GOLF_API_URL ?? (isLocalPythonServer ? "/api" : null);

    async function request(path, options = {}) {
        if (apiRoot === null) {
            throw new Error("The Python API is not enabled.");
        }

        const response = await fetch(`${apiRoot}${path}`, {
            headers: { "Content-Type": "application/json" },
            ...options
        });

        if (!response.ok) {
            throw new Error(`Python API request failed (${response.status}).`);
        }

        return response.status === 204 ? null : response.json();
    }

    window.golfPythonApi = {
        enabled: apiRoot !== null,

        getRounds: function () {
            return request("/rounds");
        },

        replaceRounds: function (rounds) {
            return request("/rounds", {
                method: "PUT",
                body: JSON.stringify(rounds)
            });
        },

        getStatistics: function () {
            return request("/statistics");
        }
    };
}());
