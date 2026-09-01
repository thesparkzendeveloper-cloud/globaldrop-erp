import React, { useState } from "react";
import {
  DollarSign,
  Plus,
  Wallet,
  CheckCircle,
  XCircle,
  ChevronDown,
  Package,
  Clock,
  ArrowUpRight,
  TrendingUp,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DbContext";
import type { Task } from "@/types";

export default function WalletPage() {
  const { user, refreshUserSession } = useAuth();
  const {
    transactions,
    employees,
    products,
    fundRequests,
    inventoryRequests,
    addFundRequest,
    addInventoryRequest,
    updateFundRequest,
    updateInventoryRequest,
    refreshData,
  } = useDb();

  const today = new Date().toISOString().split("T")[0];

  // UI States
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [refillAmount, setRefillAmount] = useState("");

  // Form States
  const [fundAmount, setFundAmount] = useState("");
  const [fundReason, setFundReason] = useState("");
  const [invProduct, setInvProduct] = useState("");
  const [invQty, setInvQty] = useState("");
  const [invReason, setInvReason] = useState("");

  const handleUpdate = async () => {
    await refreshData();
    await refreshUserSession();
  };

  // Refill action (Admin only)
  const handleRefillWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillAmount || parseFloat(refillAmount) <= 0) return;
    const token = localStorage.getItem("globaldrop_erp_token");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/wallet/refill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: parseFloat(refillAmount) }),
        },
      );
      if (response.ok) {
        await handleUpdate();
        setRefillAmount("");
        alert("Wallet refilled successfully!");
      } else {
        const err = await response.json();
        alert(`Failed to refill: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit requests (Supervisor/Employee)
  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fundAmount || !fundReason) return;
    try {
      await addFundRequest({
        amount: parseFloat(fundAmount),
        reason: fundReason,
        requestedBy: user.name,
        requestDate: today,
        status: "pending",
      });
      setFundAmount("");
      setFundReason("");
      await handleUpdate();
      alert("Fund request submitted successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !invProduct || !invQty || !invReason) return;
    try {
      await addInventoryRequest({
        product: invProduct,
        quantity: parseInt(invQty),
        reason: invReason,
        requestedBy: user.name,
        requestDate: today,
        status: "pending",
        fromBranch: user.branch || "Branch A",
        toBranch: "Main Warehouse",
      });
      setInvProduct("");
      setInvQty("");
      setInvReason("");
      await handleUpdate();
      alert("Inventory request submitted successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // Approval actions (Admin/Supervisor)
  const handleFundApproval = async (
    req: any,
    status: "approved" | "rejected",
  ) => {
    if (status === "approved" && (user?.walletBalance || 0) < req.amount) {
      alert(
        `Insufficient funds. Your wallet balance is $${user?.walletBalance?.toLocaleString()}, but this request is for $${req.amount.toLocaleString()}.`,
      );
      return;
    }
    try {
      await updateFundRequest(req.id, { status, remarks: approvalRemarks });
      setApprovalRemarks("");
      await handleUpdate();
      alert(`Fund request ${status} successfully!`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Approval failed");
    }
  };

  const handleInventoryApproval = async (
    req: any,
    status: "approved" | "rejected",
  ) => {
    try {
      await updateInventoryRequest(req.id, {
        status,
        remarks: approvalRemarks,
      });
      setApprovalRemarks("");
      await handleUpdate();
      alert(`Inventory request ${status} successfully!`);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter lists based on role
  const branchEmployees = employees.filter((e) => e.branch === user?.branch);
  const branchEmployeeNames = branchEmployees.map((e) => e.name);

  // Requesters that are supervisors
  const supervisors = employees.filter((e) => e.role === "supervisor");
  const supervisorNames = supervisors.map((e) => e.name);

  // Requests that this user needs to approve
  const pendingApprovalsFunds =
    user?.role === "admin"
      ? fundRequests.filter(
          (r) =>
            r.status === "pending" && supervisorNames.includes(r.requestedBy),
        )
      : user?.role === "supervisor"
        ? fundRequests.filter((r) => {
            if (r.status !== "pending") return false;
            const requester = employees.find((e) => e.name === r.requestedBy);
            return (
              requester &&
              requester.role === "employee" &&
              requester.country === user?.country
            );
          })
        : [];

  const pendingApprovalsInventory =
    user?.role === "admin"
      ? inventoryRequests.filter((r) => r.status === "pending")
      : user?.role === "supervisor"
        ? inventoryRequests.filter((r) => {
            if (r.status !== "pending") return false;
            const requester = employees.find((e) => e.name === r.requestedBy);
            return (
              requester &&
              requester.role === "employee" &&
              requester.country === user?.country
            );
          })
        : [];

  // Requests submitted by this user
  const myFundRequests = fundRequests.filter(
    (r) => r.requestedBy === user?.name,
  );
  const myInventoryRequests = inventoryRequests.filter(
    (r) => r.requestedBy === user?.name,
  );

  const allMyRequests = [
    ...myFundRequests.map((r) => ({ ...r, type: "fund" as const })),
    ...myInventoryRequests.map((r) => ({ ...r, type: "inventory" as const })),
  ].sort(
    (a, b) =>
      new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime(),
  );

  const walletTransactions = transactions.filter((t) => {
    if (t.category !== "Wallet" && t.category !== "Wallet Transfer") return false;
    if (user?.role === "admin") {
      return t.createdBy === user.name || t.description.includes("Admin Direct");
    }
    if (user?.role === "supervisor") {
      return t.createdBy === user.name || t.description.includes(`To Supervisor ${user.name}`);
    }
    if (user?.role === "employee") {
      return t.description.includes(`To Employee ${user.name}`);
    }
    return false;
  });

  const renderRequestItem = (req: any) => {
    const isFund = req.type === "fund";
    const uniqueId = `${req.type}-${req.id}`;
    const isExpanded = expandedReq === uniqueId;

    return (
      <div
        key={uniqueId}
        className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200"
      >
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50"
          onClick={() => setExpandedReq(isExpanded ? null : uniqueId)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2.5 rounded-lg ${isFund ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}
            >
              {isFund ? <DollarSign size={18} /> : <Package size={18} />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-700 text-sm truncate">
                {isFund
                  ? `Fund Request: $${req.amount.toLocaleString()}`
                  : `Inventory Request: ${req.quantity}x ${req.product}`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {req.reason}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`badge text-xs px-2.5 py-1 ${
                req.status === "pending"
                  ? "badge-yellow"
                  : req.status === "approved"
                    ? "badge-green"
                    : "badge-red"
              }`}
            >
              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 pt-3 bg-slate-50/50 border-t border-slate-200 text-xs sm:text-sm text-slate-600 space-y-2 animate-enter">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs font-medium">
                  Request Date
                </p>
                <p className="font-medium text-slate-700 mt-0.5">
                  {req.requestDate}
                </p>
              </div>
              {!isFund && (
                <>
                  <div>
                    <p className="text-slate-400 text-xs font-medium">
                      From Branch
                    </p>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {req.fromBranch}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-medium">
                      To Branch
                    </p>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {req.toBranch}
                    </p>
                  </div>
                </>
              )}
              {req.approvedBy && (
                <div>
                  <p className="text-slate-400 text-xs font-medium">
                    Handled By
                  </p>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {req.approvedBy}
                  </p>
                </div>
              )}
            </div>
            {req.remarks && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-slate-400 text-xs font-medium">
                  Approver Remarks
                </p>
                <p className="font-medium text-slate-700 mt-0.5 italic">
                  "{req.remarks}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getGradientColor = () => {
    if (user?.role === "admin") return "from-amber-500 to-amber-700";
    if (user?.role === "supervisor") return "from-emerald-500 to-teal-700";
    return "from-blue-600 to-indigo-700";
  };

  const getCardTitle = () => {
    if (user?.role === "admin") return "Admin Core Wallet";
    if (user?.role === "supervisor") return "Branch Supervisor Wallet";
    return "Employee Cash Wallet";
  };

  return (
    <div className="page-enter">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Wallet & Requests Control
        </h1>
        <p className="text-slate-500 mt-0.5 text-sm">
          Manage your balances, submit fund requests, and handle multi-tier
          approvals.
        </p>
      </div>

      <div className="space-y-6">
        {/* Wallet Balance Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`card p-5 bg-gradient-to-br ${getGradientColor()} text-white flex items-center justify-between shadow-lg md:col-span-1`}
          >
            <div>
              <p className="text-xs text-white/80 font-semibold uppercase tracking-wider">
                {getCardTitle()}
              </p>
              <p className="text-3xl font-extrabold mt-1">
                ${user?.walletBalance?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <DollarSign size={28} />
            </div>
          </div>

          <div className="card p-4 bg-slate-50 border border-slate-100 flex flex-col justify-center md:col-span-2 text-xs sm:text-sm text-slate-600">
            <h4 className="font-semibold text-slate-700 uppercase tracking-wider mb-1 text-xs">
              Money Vending Machine System
            </h4>
            {user?.role === "admin" ? (
              <p className="leading-relaxed">
                As the Administrator, you can manually refill your core wallet.
                Supervisors submit fund requests to you. If approved, funds are
                deducted from your balance and instantly credited to their
                supervisor wallet.
              </p>
            ) : user?.role === "supervisor" ? (
              <p className="leading-relaxed">
                As a Supervisor, you have a distinct wallet. You submit requests
                to the Admin to load money into your wallet. You are responsible
                for reviewing and approving your branch employees' fund requests
                using your balance.
              </p>
            ) : (
              <p className="leading-relaxed">
                As an Employee, you can submit cash fund requests to your
                Supervisor. Once approved by the Supervisor, the requested
                amount is deducted from the supervisor's wallet and immediately
                added to your wallet.
              </p>
            )}
          </div>
        </div>

        {/* Admin manual refill panel */}
        {user?.role === "admin" && (
          <form
            onSubmit={handleRefillWallet}
            className="card p-4 space-y-4 max-w-md"
          >
            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">
              Refill Wallet (Admin Direct)
            </h3>
            <div className="flex gap-2.5 items-end">
              <div className="flex-1">
                <label className="form-label text-xs">
                  Enter Refill Amount ($)
                </label>
                <input
                  type="number"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 5000)"
                  className="form-input text-xs"
                  min="1"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
              >
                <Plus size={14} /> Refill Balance
              </button>
            </div>
          </form>
        )}

        {/* Requests Pending Approvals list (Admin and Supervisor only) */}
        {(user?.role === "admin" || user?.role === "supervisor") && (
          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">
              Pending Approvals Center
            </h3>

            <div className="space-y-4">
              {/* Fund requests pending */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fund Requests Awaiting Your Approval
                </h4>
                {pendingApprovalsFunds.map((req) => (
                  <div
                    key={req.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3 animate-enter"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          ${req.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Requested by:{" "}
                          <span className="font-semibold text-slate-700">
                            {req.requestedBy}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Reason: {req.reason}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Requested on: {req.requestDate}
                        </p>
                      </div>
                      <span className="badge badge-yellow">Fund Request</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={approvalRemarks}
                        onChange={(e) => setApprovalRemarks(e.target.value)}
                        className="form-input text-xs flex-1"
                      />
                      <button
                        onClick={() => handleFundApproval(req, "approved")}
                        className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleFundApproval(req, "rejected")}
                        className="btn-danger text-xs py-1.5 px-3 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingApprovalsFunds.length === 0 && (
                  <p className="text-slate-400 text-xs">
                    No pending fund requests awaiting your approval.
                  </p>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Inventory requests pending */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Inventory Requests Awaiting Your Approval
                </h4>
                {pendingApprovalsInventory.map((req) => (
                  <div
                    key={req.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3 animate-enter"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {req.quantity}x {req.product}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Requested by:{" "}
                          <span className="font-semibold text-slate-700">
                            {req.requestedBy}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Reason: {req.reason}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Requested on: {req.requestDate}
                        </p>
                      </div>
                      <span className="badge badge-green">
                        Inventory Request
                      </span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={approvalRemarks}
                        onChange={(e) => setApprovalRemarks(e.target.value)}
                        className="form-input text-xs flex-1"
                      />
                      <button
                        onClick={() => handleInventoryApproval(req, "approved")}
                        className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleInventoryApproval(req, "rejected")}
                        className="btn-danger text-xs py-1.5 px-3 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingApprovalsInventory.length === 0 && (
                  <p className="text-slate-400 text-xs">
                    No pending inventory requests.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Request Submission Forms (Supervisor and Employee only) */}
        {user?.role !== "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form onSubmit={handleFundSubmit} className="card p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">
                {user?.role === "supervisor"
                  ? "Request Funds from Admin"
                  : "Request Funds from Supervisor"}
              </h3>
              <div className="space-y-3.5">
                <div>
                  <label className="form-label text-xs">Amount</label>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="Enter amount ($)"
                    className="form-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Reason</label>
                  <textarea
                    value={fundReason}
                    onChange={(e) => setFundReason(e.target.value)}
                    placeholder="Provide detailed reason..."
                    className="form-input text-xs"
                    rows={2}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center text-xs py-2"
                >
                  Submit Request
                </button>
              </div>
            </form>

            <form onSubmit={handleInvSubmit} className="card p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">
                Request Inventory from Warehouse
              </h3>
              <div className="space-y-3.5">
                <div>
                  <label className="form-label text-xs">Product</label>
                  <select
                    value={invProduct}
                    onChange={(e) => setInvProduct(e.target.value)}
                    className="form-input text-xs"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Quantity</label>
                  <input
                    type="number"
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value)}
                    placeholder="Enter quantity"
                    className="form-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Reason</label>
                  <textarea
                    value={invReason}
                    onChange={(e) => setInvReason(e.target.value)}
                    placeholder="Provide detailed reason..."
                    className="form-input text-xs"
                    rows={2}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center text-xs py-2"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests History timeline (Supervisor and Employee only) */}
        {user?.role !== "admin" && (
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3.5">
              My Request History
            </h3>
            {allMyRequests.length === 0 ? (
              <p className="text-slate-500 text-xs">
                No past requests submitted.
              </p>
            ) : (
              <div className="space-y-3">
                {allMyRequests.map(renderRequestItem)}
              </div>
            )}
          </div>
        )}

        {/* Wallet Transaction History */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b pb-2 mb-3">
            Wallet Transaction Ledger
          </h3>
          {walletTransactions.length === 0 ? (
            <p className="text-slate-500 text-xs">No wallet transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-2">ID</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {walletTransactions.map((t) => {
                    const isAdminRefill = t.description.includes("Refill");
                    const isOutgoing = t.createdBy === user?.name && !isAdminRefill;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-medium">{t.id}</td>
                        <td className="py-2.5 text-slate-400">{t.date}</td>
                        <td className="py-2.5">{t.description}</td>
                        <td className={`py-2.5 text-right font-semibold ${isOutgoing ? "text-red-600" : "text-emerald-600"}`}>
                          {isOutgoing ? "-" : "+"}${t.amount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
