/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Col, DatePicker, message, Modal, Row, Select, Skeleton, Switch } from "antd";
import TableTransaction from "../Component/TableTransaction";
import FormTransaction from "../Component/FormTransaction";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PieChart from "../Component/PieChart";
import FormCreateAccount from "../Component/FormCreateAccount";
import dayjs from "dayjs";
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
    const [executed, setExecuted] = useState(null);
    const [chartMode, setChartMode] = useState(false);

    const [currentDate, setCurrentDate] = useState(dayjs());
    const [modalCreateAccount, setModalCreateAccount] = useState(false);
    const [expenseTotal, setExpenseTotal] = useState(0);

    const handleTransaction = (data) => {
        setExecuted(data);
    };

    const handleChangeAccount = (value) => {
        setSelectedAccount(value);
        setSearchParams({ accountId: value });
    };

    const getAccount = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/accounts`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
                },
            });
            const data = await response.json();
            if (data.data?.length >= 0) {
                return data;
            }
            message.error("No account found. Please create an account first.");
            setSearchParams({ createAccount: true });
            setLoadingAccount(false);
            return;
        } catch (error) {
            console.error(error);
            message.error("Failed fetching data. Please try again later.");
            setLoadingAccount(false);
        }
    };

    const getCategories = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/transactions_category`, {
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
            getAccount()
                .then((res) => {
                    const accounts = res.data;
                    const selected = accounts?.find((acc) => acc.id === accountId);
                    if (!selected) {
                        message.error("Account not found. Please try again or create an account first.");
                        return;
                    }
                    setAccounts(accounts);
                    setSelectedAccount(selected?.id);
                    setLoadingAccount(false);
                })
                .catch((error) => {
                    console.error(error);
                    message.error("Failed fetching data. Please try again later.");
                })
                .finally(() => {
                    setLoadingAccount(false);
                });
        } else {
            getAccount()
                .then((res) => {
                    setAccounts(res.data);
                    setSelectedAccount(res.data[0].id);
                    setSearchParams({ accountId: res.data[0].id });
                })
                .catch((error) => {
                    console.error(error);
                    setModalCreateAccount(true);
                    setSearchParams({ createAccount: true });
                })
                .finally(() => {
                    setLoadingAccount(false);
                });
        }

        const createAccount = searchParams.get("createAccount");
        if (createAccount) {
            setModalCreateAccount(true);
        }

        const dateParams = searchParams.get("date");
        if (dateParams) {
            setCurrentDate(dayjs(dateParams));
        }

        setExecuted(null);
    }, [searchParams, executed]);

    useEffect(() => {
        getCategories();
    }, [accounts]);

    useEffect(() => {
        setLoadingAccount(true);
        const accountId = searchParams.get("accountId");
        const dateParams = searchParams.get("date") ?? currentDate.format("YYYY-MM");
        if (accountId) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/transactions?account_id=${accountId}&date=${dateParams ?? ""}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setTransactionData(data.data);
                    setExpenseTotal(data.total_amount.expense);
                    setLoadingAccount(false);
                })
                .catch((error) => {
                    console.error(error);
                    message.error("Failed fetching data. Please try again later.");
                });
        }
    }, [selectedAccount, currentDate, executed]);

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

            <div className="min-h-screen px-4 bg-slate-100">
                <Row>
                    <Col span={24} className="p-2 gutter-row">
                        <div className="py-4 text-2xl font-bold text-center">
                            <h2>Pockets</h2>
                        </div>
                        <div className="mx-auto mb-3 md:w-96">
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
                                            <div className="flex items-center justify-between">
                                                <div className="p-0 m-0">
                                                    <p className="p-0 m-0 -mb-1">{item.name}</p>
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
                    <Col span={24} md={12} className="p-2 gutter-row">
                        <Card bordered={true}>
                            <div className="flex flex-col lg:flex-row items-start justify-between gap-3">
                                <div className="space-x-1 space-y-2">
                                    <DatePicker
                                        onChange={(date, dateString) => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.set("date", dateString);
                                            setSearchParams(newParams);
                                            setCurrentDate(dateString);
                                        }}
                                        picker="month"
                                        allowClear={false}
                                        format="YYYY-MM"
                                        value={dayjs(currentDate)}
                                    />
                                    <span>{dayjs(currentDate).format("MMMM YYYY") ?? dayjs(searchParams.get("date")).format("MMMM YYYY")}</span>

                                    <div className="block items-center space-x-1">
                                        <span>Details</span>
                                        <Switch
                                            checked={chartMode}
                                            onChange={(value) => {
                                                setChartMode(value);
                                            }}
                                        />
                                        <span>Summary</span>
                                    </div>
                                </div>

                                <div className="space-x-2 mx-auto lg:mx-0 w-full lg:w-auto">
                                    <div className="border-2 px-2 rounded-md h-14 pr-5 border-slate-300">
                                        <p className="text-sm font-semibold">Total Expense</p>
                                        <p>{new Intl.NumberFormat("en-ID", { style: "currency", currency: "IDR" }).format(expenseTotal)}</p>
                                    </div>
                                </div>
                            </div>
                            {loadingAccount && <Skeleton.Input className="py-10 mb-2" active={true} size="large" block={true} />}

                            {!loadingAccount && <PieChart data={transactionData} chartMode={chartMode} />}
                        </Card>
                    </Col>
                    <Col span={24} md={12} className="p-2 mx-auto gutter-row">
                        <Card bordered={true}>
                            {loading && (
                                <>
                                    <Skeleton.Input className="mb-2" active={true} size="large" block={true} />
                                    <Skeleton.Input className="mb-2" active={true} size="large" block={true} />
                                    <Skeleton.Input className="mb-2" active={true} size="large" block={true} />
                                </>
                            )}

                            {!loading && <FormTransaction transactionCategory={transactionCategory} executed={(data) => handleTransaction(data)} />}
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col className="p-2 gutter-row" span={24}>
                        <div className="mx-auto">
                            <Card bordered={true}>
                                {loadingAccount && <Skeleton.Input className="py-10 mb-2" active={true} size="large" block={true} />}

                                {!loadingAccount && <TableTransaction transactionData={transactionData} executed={(id) => handleTransaction(id)} />}
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default Home;
