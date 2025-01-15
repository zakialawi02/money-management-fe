import { Form, Input, Button, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, values);
            localStorage.setItem("authToken", response.data.token);
            message.success("Login successful!");
            navigate("/");
        } catch {
            message.error("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkToken = async () => {
            const authToken = localStorage.getItem("authToken");
            if (authToken) {
                // Request to the backend to verify token
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    // Jika token valid, redirect ke homepage
                    navigate("/");
                }
            }
        };

        checkToken();
    }, [navigate]);

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Form name="login_form" className="login-form" initialValues={{ remember: true }} onFinish={onFinish} style={{ maxWidth: 300 }}>
                <div className="mb-4 text-2xl font-bold text-center">
                    <h2>Login</h2>
                </div>

                <Form.Item name="id_user" rules={[{ required: true, message: "Please input your Username/Email!" }]}>
                    <Input size="large" prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username/Email" />
                </Form.Item>
                <Form.Item className="mb-10" name="password" rules={[{ required: true, message: "Please input your Password!" }]}>
                    <Input.Password size="large" prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" loading={loading} block>
                        Log in
                    </Button>
                </Form.Item>
            </Form>

            <div className="d-block">
                <p>
                    Don&lsquo;t have an account?{" "}
                    <Link className="text-blue-500" to="/register">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
