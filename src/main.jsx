import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import NotFound from "./Pages/NotFound.jsx";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import PrivateRoute from "./PrivateRoute.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <PrivateRoute>
                <Home />
            </PrivateRoute>
        ),
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "*",
        element: <NotFound />,
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
