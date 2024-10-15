/* eslint-disable react/prop-types */
import { Skeleton } from "antd";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const [isValidToken, setIsValidToken] = useState(null); // null means still loading
    const authToken = localStorage.getItem("authToken");

    useEffect(() => {
        const verifyToken = async () => {
            try {
                if (!authToken) {
                    setIsValidToken(false);
                    return;
                }

                // Request to the backend to verify token
                const response = await fetch(`http://localhost:8000/api/v1/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    setIsValidToken(true);
                } else {
                    setIsValidToken(false);
                }
            } catch {
                setIsValidToken(false);
            }
        };

        verifyToken();
    }, [authToken]);

    // Sementara token sedang divalidasi, tampilkan loading atau spinner
    if (isValidToken === null) {
        return (
            <Skeleton.Node
                active={true}
                style={{
                    width: "100vw",
                    height: "100vh",
                }}
            />
        );
    }

    return isValidToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
