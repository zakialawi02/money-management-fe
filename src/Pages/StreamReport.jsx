import { useState, useEffect } from "react";
import { Table, Typography, Card, Space, Divider, Row, Col, Skeleton } from "antd";

const { Title, Text } = Typography;

const StreamReport = () => {
    const url = window.location.pathname;
    const urlParts = url.split("/");
    const userId = urlParts[2];
    const accountId = urlParts[3];
    const date = urlParts[4];

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    // Kolom untuk tabel transaksi
    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) => new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => <Text type={type === "expense" ? "danger" : "success"}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>,
        },

        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (category) => (
                <span className="px-[3px] py-[1.5px] rounded" style={{ backgroundColor: category.color, color: "black" }}>
                    {category.name}
                </span>
            ),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (desc) => desc || "-",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (amount, record) => (
                <Typography.Text style={{ color: record.type === "expense" ? "red" : "green" }}>{new Intl.NumberFormat("en-ID", { style: "currency", currency: "IDR" }).format(record.type === "expense" ? `-${amount}` : `+${amount}`)}</Typography.Text>
            ),
        },
    ];

    // Fetch data dari API
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/stream-report/${userId}/${accountId}/${date}`);
            const data = await response.json();
            console.log(data.data);
            setData(data.data);
        } catch (error) {
            console.error("Error fetching stream report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!data) {
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

    return (
        <div style={{ padding: "24px" }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Title level={2}>Transaction Report</Title>
                    <Title level={4}>{new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</Title>
                    <Divider />
                    <Row gutter={16}>
                        <Col span={8}>
                            <Card>
                                <Title level={5}>User Details</Title>
                                <p>
                                    <strong>Name:</strong> {data.user.name}
                                </p>
                                <p>
                                    <strong>Email:</strong> {data.user.email}
                                </p>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Title level={5}>Account Details</Title>
                                <p>
                                    <strong>Name:</strong> {data.account.name}
                                </p>
                                <p>
                                    <strong>Balance:</strong> {data.account.balance < 0 ? "- " : ""}Rp {Math.abs(data.account.balance).toLocaleString()}
                                </p>

                                <p>
                                    <strong>Description:</strong> {data.account.description}
                                </p>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Title level={5}>Total Amount</Title>
                                <p>
                                    <strong>Income:</strong> Rp {data.total_amount.income.toLocaleString()}
                                </p>
                                <p>
                                    <strong>Expense:</strong> Rp {data.total_amount.expense.toLocaleString()}
                                </p>
                                <p>
                                    <strong>Total:</strong> {data.total_amount.total < 0 ? "- " : ""}Rp {Math.abs(data.total_amount.total).toLocaleString()}
                                </p>
                            </Card>
                        </Col>
                    </Row>
                    <Divider />
                    <Title level={5}>Transactions</Title>
                    <Table
                        columns={columns}
                        dataSource={data.transactions.map((transaction) => ({
                            ...transaction,
                            key: transaction.id,
                        }))}
                        loading={loading}
                        // pagination={{ pageSize: 25 }}
                    />
                </Space>
            </Card>
        </div>
    );
};

export default StreamReport;
