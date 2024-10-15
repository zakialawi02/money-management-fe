/* eslint-disable react/prop-types */
import { Button, message, Popconfirm, Space, Table, Tag, Typography } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const TableTransaction = ({ transactionData = [], stored = null }) => {
    const [dataSource, setDataSource] = useState([]);

    const handleDelete = (id) => {
        fetch(`http://localhost:8000/api/v1/transactions/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
        }).then((response) => {
            if (response.ok) {
                message.success("Transaction deleted successfully");

                stored(id);
            } else {
                message.error("Failed to delete transaction");
            }
        });
    };

    useEffect(() => {
        const formattedData = transactionData.map((data) => ({
            key: data.id,
            date: new Date(data.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
            type: data.type,
            amount: data.type === "expense" ? `-${data.amount}` : `+${data.amount}`,
            category: data.category.name,
        }));
        setDataSource(formattedData);
    }, [transactionData]);

    // Kolom-kolom tabel
    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => <Typography.Text style={{ color: type === "expense" ? "red" : "green" }}>{type === "expense" ? "Expense" : "Income"}</Typography.Text>,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount, record) => <Typography.Text style={{ color: record.type === "expense" ? "red" : "green" }}>{amount}</Typography.Text>,
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (category) => {
                let color = "";
                switch (category) {
                    case "Uang Masuk":
                        color = "green";
                        break;
                    case "Uang Keluar":
                        color = "red";
                        break;
                    default:
                        color = "blue";
                        break;
                }
                return <Tag color={color}>{category}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm title="Are you sure delete this transaction? Your balance will be adjusted" onConfirm={() => handleDelete(record.key)} okText="Yes" cancelText="No">
                        <Button className="px-0" type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ y: 240 }} />
        </>
    );
};

export default TableTransaction;
