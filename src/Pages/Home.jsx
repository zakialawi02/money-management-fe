/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, Col, DatePicker, message, Modal, Row, Select, Skeleton, Switch } from "antd";
import TableTransaction from "../Component/TableTransaction";
import FormTransaction from "../Component/FormTransaction";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PieChart from "../Component/PieChart";
import FormCreateAccount from "../Component/FormCreateAccount";
import ShareButton from "../Component/ShareButton";
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
    const [weeklyExpense, setWeeklyExpense] = useState(0);

    const navigate = useNavigate();

    const dateParams = searchParams.get("date") ?? currentDate.format("YYYY-MM");
    const accountId = searchParams.get("accountId");
    const [userId, setUserId] = useState(null);

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
                setUserId(data.data[0].pivot.user_id);
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

    const fetchAccountData = async (accountId) => {
        try {
            const { data: accounts } = await getAccount();
            if (accountId) {
                const selected = accounts?.find((acc) => acc.id === accountId);
                if (!selected) {
                    if (accountId == "create") {
                        setSearchParams({ createAccount: true });
                        return;
                    }

                    message.error("Account not found. Please try again or create an account first.");
                    return;
                }

                setAccounts(accounts);
                setSelectedAccount(selected.id);
            } else {
                // If no accountId provided, use the first account
                setAccounts(accounts);
                setSelectedAccount(accounts[0].id);
                setSearchParams({ accountId: accounts[0].id });
            }
        } catch (error) {
            console.error("Failed to fetch account data:", error);
            if (!accountId) {
                // Only show create account modal if no accountId was provided
                setModalCreateAccount(true);
                setSearchParams({ createAccount: true });
            } else {
                message.error("Failed fetching data. Please try again later.");
            }
        }
    };

    const handleExport = () => {
        message.info("Exporting data, please wait...");
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/account/${accountId}/report/download?date=${dateParams}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/pdf",
                Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
            },
        })
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `report_${accountId}_${dateParams}.pdf`);
                document.body.appendChild(link);
                link.click();
            })
            .catch((error) => {
                console.error("Failed to export data:", error);
                message.error("Failed to export data. Please try again later.");
            });
    };

    useEffect(() => {
        const accountId = searchParams.get("accountId");
        fetchAccountData(accountId);

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
                    setWeeklyExpense(data.total_amount.weekly_expense);
                })
                .catch((error) => {
                    console.error(error);
                    message.error("Failed fetching data. Please try again later.");
                })
                .finally(() => {
                    setLoadingAccount(false);
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
                        <div className="flex justify-end -mb-5">
                            <Button
                                type="primary"
                                danger
                                onClick={async () => {
                                    try {
                                        message.info("Logging out, please wait...");
                                        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                Authorization: `Bearer ${localStorage.getItem("authToken") ?? ""}`,
                                            },
                                        });
                                        localStorage.removeItem("authToken");
                                        message.success("Logout successful");
                                        navigate("/login");
                                    } catch (error) {
                                        console.error("Failed to logout:", error);
                                        message.error("Logout failed. Please try again.");
                                    }
                                }}
                            >
                                Logout
                            </Button>
                        </div>

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
                                    <option value="create" key="create">
                                        <div className="flex items-center justify-between">
                                            <div className="p-0 m-0">
                                                <p className="p-0 m-0 -mb-1">Create New Account</p>
                                                <span className="text-sm text-gray-400">Create a new account</span>
                                            </div>
                                        </div>
                                    </option>
                                </Select>
                            )}

                            {!loadingAccount && (
                                <div className="mt-5 flex justify-center">
                                    <ShareButton userId={userId} accountId={selectedAccount} date={dateParams}></ShareButton>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} md={12} className="p-2 gutter-row">
                        <Card bordered={true}>
                            <div className="flex flex-col items-start justify-between gap-3 lg:flex-row">
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

                                    <div className="items-center block space-x-1">
                                        <span>Details</span>
                                        <Switch
                                            checked={chartMode}
                                            onChange={(value) => {
                                                setChartMode(value);
                                            }}
                                        />
                                        <span>Summary</span>
                                    </div>

                                    <Button type="primary" onClick={handleExport}>
                                        Export
                                    </Button>
                                </div>

                                <div className="w-full mx-auto space-x-2 space-y-1 lg:mx-0 lg:w-auto">
                                    <div className="px-2 border-2 rounded-md h-14 border-slate-300">
                                        <p className="text-sm font-semibold">Weekly Expense</p>
                                        <p>{new Intl.NumberFormat("en-ID", { style: "currency", currency: "IDR" }).format(weeklyExpense)}</p>
                                    </div>

                                    <div className="px-2 border-2 rounded-md h-14 border-slate-300">
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
