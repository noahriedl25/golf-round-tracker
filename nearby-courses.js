/* Nearby search works on the hosted phone app as well as the Python version.
 * ZIP codes describe an area, so their distances are approximate. GPS uses a
 * single position fix, not continuous tracking. Both reuse scorecard loading.
 */
(function () {
    const form = document.getElementById("nearby-course-form");
    const zipInput = document.getElementById("nearby-zip");
    const radiusInput = document.getElementById("nearby-radius");
    const locationButton = document.getElementById("nearby-location-button");

    async function readJson(url) {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) {
            throw new Error(response.status === 404
                ? "That ZIP code was not found. Check the five digits and try again."
                : "The search service is unavailable. Please try again later.");
        }
        return response.json();
    }

    async function searchNearby(getCoordinates) {
        if (courseSearchButton.disabled) return;
        setSearchLoading(true);
        courseSearchResults.replaceChildren();
        teeGroup.classList.add("hidden");
        courseSearchMessage.textContent = "Finding your search area…";
        try {
            const position = await getCoordinates();
            const radius = Number(radiusInput.value);
            const query = new URLSearchParams({
                lat: position.latitude, lng: position.longitude,
                radius_mi: radius, limit: 50
            });
            courseSearchMessage.textContent = "Searching nearby U.S. courses…";
            const data = await readJson(
                `https://api.opengolfapi.org/api/v1/courses/search?${query}`
            );
            const courses = (Array.isArray(data.courses) ? data.courses : [])
                .filter(course => US_STATE_CODES.has(String(course.state).toUpperCase()))
                .sort((a, b) => (a.distance_mi ?? Infinity) - (b.distance_mi ?? Infinity));
            renderCourseSearchResults(courses);
            courseSearchMessage.textContent = courses.length
                ? `${courses.length === 50 ? "First 50" : courses.length} courses within ${radius} miles of ${position.label}. Distances are straight-line estimates.`
                : `No listed U.S. courses within ${radius} miles. Try a larger radius, search by name, or add a custom course.`;
        } catch (error) {
            courseSearchMessage.textContent = error instanceof TypeError || error.name === "TimeoutError"
                ? "Search needs an internet connection. Try again, or choose a saved course."
                : error.message;
        } finally {
            setSearchLoading(false);
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const zip = zipInput.value.trim();
        if (!/^\d{5}$/.test(zip)) {
            courseSearchMessage.textContent = "Enter a five-digit U.S. ZIP code.";
            return;
        }
        searchNearby(async function () {
            const data = await readJson(`https://api.zippopotam.us/us/${zip}`);
            const place = data.places?.[0];
            const latitude = Number(place?.latitude);
            const longitude = Number(place?.longitude);
            if (!place || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                throw new Error("This ZIP code has no usable location. Try another ZIP.");
            }
            return { latitude, longitude, label: `ZIP ${zip} (${place["place name"]})` };
        });
    });

    locationButton.addEventListener("click", function () {
        searchNearby(function () {
            return new Promise(function (resolve, reject) {
                if (!window.isSecureContext || !navigator.geolocation) {
                    reject(new Error("Phone location requires the HTTPS app link. You can also search by ZIP."));
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    position => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        label: "your current location" }),
                    error => reject(new Error(error.code === 1
                        ? "Location permission was denied. Search by ZIP, or enable location for this site in your browser settings."
                        : "Could not find your location. Try outdoors or search by ZIP.")),
                    { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
                );
            });
        });
    });
}());
