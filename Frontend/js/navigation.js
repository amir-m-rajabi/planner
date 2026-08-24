import { router } from "./router.js";

export function setupNavigation() {

    document.addEventListener("click", (event) => {
        

        const routeElement = event.target.closest("[data-route]");

        if (!routeElement) {
            return;
        }


        event.preventDefault();


        const path = routeElement.dataset.route;


        history.pushState({}, "", path);


        router();
    });


    window.addEventListener("popstate", () => {
        router();
    });
}