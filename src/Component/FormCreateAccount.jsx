/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Button, Input, InputNumber, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const FormCreateAccount = ({ closeModal = null }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState({
        name: "",
        description: "",
        balance: 0,
    });

    const createAccount = (event) => {
        event.preventDefault();

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/accounts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success === true) {
                    message.success(data.message);
                    setData({
                        name: "",
                        description: "",
                        balance: 0,
                    });
                    setSearchParams({});
                    closeModal();
                } else {
                    message.error(data.message);
                }
            })
            .catch((error) => {
                console.error(error);
                message.error("Failed to create account. Please try again later.");
            });
    };

    return (
        <form onSubmit={createAccount}>
            <div className="mb-2">
                <label htmlFor="name" className="block mb-1">
                    Name of Pocket
                </label>
                <Input showCount id="name" className="w-full" size="large" placeholder="Enter name of pocket" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} maxLength="20" />
            </div>

            <div className="mb-2">
                <label htmlFor="description" className="block mb-1">
                    Description of Pocket
                </label>
                <TextArea showCount id="description" className="w-full" size="large" placeholder="Enter description of pocket" value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} maxLength="50" />
            </div>

            <div className="mb-2">
                <label htmlFor="balance" className="block mb-1">
                    Initial Balance
                </label>
                <InputNumber
                    id="balance"
                    className="w-full"
                    size="large"
                    defaultValue={0}
                    min={0}
                    value={data.balance}
                    formatter={(value) => `Rp. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => Number(value?.replace(/Rp\.\s?|(,*)/g, ""))}
                    controls={false}
                    onChange={(value) => setData({ ...data, balance: value })}
                />
                <div className="flex justify-end mt-3">
                    <Button type="primary" htmlType="submit">
                        Create
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default FormCreateAccount;
