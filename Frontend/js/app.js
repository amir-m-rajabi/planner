import { Header } from "../Components/header/header.js";
import { router } from "./router.js";
import { setupNavigation } from "./navigation.js";


const app = document.querySelector("#app");


app.innerHTML = `
    ${Header()}

    <main id="page-content"></main>
`;


setupNavigation();

router();