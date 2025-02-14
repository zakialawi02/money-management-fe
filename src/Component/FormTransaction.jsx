/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Button, DatePicker, Input, InputNumber, message, Select } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

const FormTransaction = ({ transactionCategory, executed = null }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [category, setCategory] = useState([]);
    const [sending, setSending] = useState(false);
    const [data, setData] = useState({
        date: "",
        amount: 0,
        type: "expense",
        description: "",
        transactions_category_id: "",
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        setSending(true);
        setData({
            ...data,
        });
        const accountId = searchParams.get("accountId");
        if (accountId) {
            data.account_id = accountId;
        }

        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/transactions`, {
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
                        date: "",
                        amount: 0,
                        type: "expense",
                        description: "",
                        transactions_category_id: "",
                    });

                    executed(data.transaction.id);
                } else {
                    message.error(data.message);
                }

                setSending(false);
            })
            .catch((error) => {
                console.error("Error:", error);
                message.error("Failed fetching data. Please try again later.");
                setSending(false);
            });
    };

    useEffect(() => {
        let filteredArray;
        if (data.type === "expense") {
            filteredArray = transactionCategory?.filter(function (item) {
                return item.name !== "Uang Masuk";
            });
        } else if (data.type === "income") {
            filteredArray = transactionCategory?.filter(function (item) {
                return item.name !== "Uang Keluar";
            });
        }
        setCategory(
            filteredArray?.map((item) => ({
                key: item.id,
                value: item.name,
                label: item.name,
            }))
        );
    }, [transactionCategory, data.type]);

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="date" className="block mb-1">
                    Date
                </label>
                <DatePicker
                    id="date"
                    className="w-full"
                    placeholder="Select Date YYYY-MM-DD, if not set will be current date"
                    format={"YYYY-MM-DD"}
                    value={data.date ? dayjs(data.date) : undefined}
                    onChange={(date) => setData({ ...data, date: date ? date.format("YYYY-MM-DD") : "" })}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="amount" className="block mb-1">
                    Amount
                </label>
                <InputNumber
                    id="amount"
                    className="w-full"
                    defaultValue={0}
                    min={0}
                    value={data.amount}
                    formatter={(value) => `Rp. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => Number(value?.replace(/Rp\.\s?|(,*)/g, ""))}
                    controls={false}
                    onChange={(value) => setData({ ...data, amount: value })}
                />
            </div>

            <div className="mb-3">
                <Select
                    id="type"
                    className="w-full"
                    defaultValue="expense"
                    value={data.type}
                    options={[
                        {
                            value: "income",
                            label: "Income",
                        },
                        {
                            value: "expense",
                            label: "Expense",
                        },
                    ]}
                    onChange={(value) => setData({ ...data, type: value })}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="description" className="block mb-1">
                    Description/Note
                </label>
                <Input id="description" className="w-full" max={99} placeholder="Description/Note" prefix={<EditOutlined />} value={data.description} onChange={(event) => setData({ ...data, description: event.target.value })} />
            </div>

            <div className="mb-3">
                <label htmlFor="transactions_category_id" className="block mb-1">
                    Transaction Category
                </label>
                <Select
                    id="transactions_category_id"
                    className="w-full"
                    showSearch
                    placeholder="Select transaction category"
                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                    options={category}
                    optionLabelProp="label"
                    labelInValue
                    value={category?.find((item) => item.key === data.transactions_category_id)}
                    onChange={(value) => setData({ ...data, transactions_category_id: value.key })}
                />
            </div>

            <div className="flex justify-end mb-3">
                <Button type="primary" htmlType="submit" className="w-full md:w-auto" disabled={sending}>
                    {sending ? "Saving..." : "Submit"}
                </Button>
            </div>
        </form>
    );
};

export default FormTransaction;
