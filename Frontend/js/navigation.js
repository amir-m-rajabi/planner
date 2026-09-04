// File: Frontend/js/navigation.js

import { router } from "./router.js";
import { updateActiveNav } from "../Components/header/header.js";

// ============================================================
// Navigation Setup
// ============================================================

export function setupNavigation() {
    // Handle click on navigation links
    document.addEventListener("click", (event) => {
        const routeElement = event.target.closest("[data-route]");

        if (!routeElement) {
            return;
        }

        event.preventDefault();

        const path = routeElement.dataset.route;

        history.pushState({}, "", path);

        router();

        // Update active link after route change
        updateActiveNav(path);
    });

    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
        router();

        // Update active link after route change
        const path = window.location.pathname;
        updateActiveNav(path);
    });
}