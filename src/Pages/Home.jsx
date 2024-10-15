/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Col, message, Modal, Row, Select, Skeleton } from "antd";
import TableTransaction from "../Component/TableTransaction";
import FormTransaction from "../Component/FormTransaction";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PieChart from "../Component/PieChart";
import FormCreateAccount from "../Component/FormCreateAccount";
message.config({
    maxCount: 2,
});

const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [transactionCategory, setTransactionCategory] = useState([]);
    const { Option } = Select;
    const [selectedAccount, setSelectedAccount] = useState("");
    const [transactionData, setTransactionData] = useState([]);
    const [stored, setStored] = useState(null);

    const [modalCreateAccount, setModalCreateAccount] = useState(false);

    const handleTransaction = (data) => {
        setStored(data);
    };

    const handleChangeAccount = (value) => {
        setSelectedAccount(value);
        setSearchParams({ accountId: value });
    };

    const getAccount = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/v1/accounts", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
                },
            });
            const data = await response.json();
            if (data.data.length === 0) {
                message.error("No account found. Please create an account first.");
                setSearchParams({ createAccount: true });
                setLoadingAccount(false);
                return;
            }
            return data;
        } catch (error) {
            console.error(error);
            message.error("Failed fetching data. Please try again later.");
            setLoadingAccount(false);
        }
    };

    const getCategories = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/v1/transactions_category", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
                },
            });
            const data = await response.json();
            setTransactionCategory(data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            message.error("Failed fetching data. Please try again later.");
            setLoading(false);
        }
    };

    useEffect(() => {
        const accountId = searchParams.get("accountId");

        if (accountId) {
            getAccount().then((res) => {
                const accounts = res.data;
                const selected = accounts?.find((acc) => acc.id === accountId);
                setAccounts(accounts);
                setSelectedAccount(selected?.id);
                setLoadingAccount(false);
            });
        } else {
            getAccount().then((res) => {
                setAccounts(res.data);
                setSelectedAccount(res.data[0].id);
                setSearchParams({ accountId: res.data[0].id });
                setLoadingAccount(false);
            });
        }

        const createAccount = searchParams.get("createAccount");
        if (createAccount) {
            setModalCreateAccount(true);
        }
    }, [searchParams, stored]);

    useEffect(() => {
        getCategories();
    }, [accounts]);

    useEffect(() => {
        setLoading(true);
        const accountId = searchParams.get("accountId");
        if (accountId) {
            fetch(`http://localhost:8000/api/v1/transactions?account_id=${accountId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setTransactionData(data.data);

                    setLoading(false);
                })
                .catch((error) => {
                    console.error(error);
                    message.error("Failed fetching data. Please try again later.");
                });
        }
    }, [selectedAccount, stored]);

    return (
        <>
            <Modal
                title="Create New Account"
                open={modalCreateAccount}
                okButtonProps={{ style: { display: "none" } }}
                cancelButtonProps={{ style: { display: "none" } }}
                onCancel={() => {
                    setModalCreateAccount(false);
                    setSearchParams({});
                }}
            >
                <FormCreateAccount closeModal={() => setModalCreateAccount(false)} />
            </Modal>

            <div className="bg-slate-100 min-h-screen px-4">
                <Row>
                    <Col span={24} className="gutter-row p-2">
                        <div className="text-center text-2xl font-bold py-4">
                            <h2>Pockets</h2>
                        </div>
                        <div className="mb-3 md:w-96 mx-auto">
                            {loadingAccount && <Skeleton.Input className="mb-2" active={true} size="large" block={true} />}

                            {!loadingAccount && (
                                <Select
                                    id="account"
                                    value={selectedAccount}
                                    onChange={handleChangeAccount}
                                    style={{
                                        width: "100%",
                                        height: "80px",
                                    }}
                                    placeholder="Select Account"
                                >
                                    {accounts.map((item, index) => (
                                        <Option value={item.id} key={index}>
                                            <div className="flex justify-between items-center">
                                                <div className="p-0 m-0">
                                                    <p className="p-0 m-0 -mb-3">{item.name}</p>
                                                    <span className="text-sm text-gray-400">{item.description}</span>
                                                </div>
                                                <span>Rp. {item.balance}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} md={12} className="gutter-row p-2">
                        <Card bordered={true}>
                            {loading && <Skeleton.Input className="mb-2 py-10" active={true} size="large" block={true} />}

                            {!loading && <PieChart data={transactionData} />}
                        </Card>
                    </Col>
                    <Col span={24} md={12} className="gutter-row p-2 mx-auto">
                        <Card bordered={true}>
                            {loading && (
                                <>
                                    <Skeleton.Input className="mb-2" active={true} size="large" block={true} />
                                    <Skeleton.Input className="mb-2" active={true} size="large" block={true} />
                                    <Skeleton.Input className="mb-2" active={true} size="large" block={true} />
                                </>
                            )}

                            {!loading && <FormTransaction transactionCategory={transactionCategory} stored={(data) => handleTransaction(data)} />}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col className="gutter-row p-2" span={24}>
                        <div className="mx-auto">
                            <Card bordered={true}>
                                {loading && <Skeleton.Input className="mb-2 py-10" active={true} size="large" block={true} />}

                                {!loading && <TableTransaction transactionData={transactionData} stored={(id) => handleTransaction(id)} />}
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Home;
