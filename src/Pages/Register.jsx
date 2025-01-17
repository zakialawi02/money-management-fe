import { Form, Input, Button, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmitRegister = async (values) => {
        setLoading(true);
        setErrors({});
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, values);
            localStorage.setItem("authToken", response.data.token);
            message.success(response.data.message || "Registration successful!");
            navigate("/");
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error("An error occurred.", error);
            }
            message.error(error.response.data.message || "Registration failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Form name="register_form" initialValues={{ remember: true }} onFinish={handleSubmitRegister} style={{ maxWidth: 300 }}>
                <div className="mb-4 text-2xl font-bold text-center">
                    <h2>Register</h2>
                </div>

                <Form.Item name="name" rules={[{ required: true, message: "Please input your Name!" }]} help={errors.name} validateStatus={errors.name ? "error" : ""}>
                    <Input size="large" prefix={<UserOutlined />} placeholder="Name" />
                </Form.Item>

                <Form.Item name="username" rules={[{ required: true, message: "Please input your Username!" }]} help={errors.username} validateStatus={errors.username ? "error" : ""}>
                    <Input size="large" prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: "Please input your Email!" },
                        { type: "email", message: "Invalid email!" },
                    ]}
                    help={errors.email}
                    validateStatus={errors.email ? "error" : ""}
                >
                    <Input size="large" prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: "Please input your Password!" }]} help={errors.password} validateStatus={errors.password ? "error" : ""}>
                    <Input.Password size="large" prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>

                <Form.Item name="password_confirmation" rules={[{ required: true, message: "Please confirm your Password!" }]} help={errors.password_confirmation} validateStatus={errors.password_confirmation ? "error" : ""}>
                    <Input.Password size="large" prefix={<LockOutlined />} placeholder="Confirm Password" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="register-form-button" loading={loading} block>
                        Register
                    </Button>
                </Form.Item>
            </Form>

            <div className="d-block">
                <p>
                    Already have an account?{" "}
                    <Link className="text-blue-500" to="/login">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
