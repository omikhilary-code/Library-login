import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeeLedgerEntry, ExpenseItem } from '../../types';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  CreditCard,
  Building,
  Zap,
  Wifi,
  Brush,
  Users,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const FinancialsView: React.FC = () => {
  const { feeLedgers, recordPayment, expenses, addExpense, deleteExpense, activeTenant, fireConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<'LEDGERS' | 'EXPENSES'>('LEDGERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Record Payment Modal State
  const [selectedLedger, setSelectedLedger] = useState<FeeLedgerEntry | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<FeeLedgerEntry['paymentMethod']>('UPI');

  // Add Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState<Omit<ExpenseItem, 'id' | 'tenantId'>>({
    title: '',
    category: 'ELECTRICITY',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    paymentStatus: 'PAID',
    vendorName: '',
    receiptNumber: '',
  });

  // Calculate Aggregates
  const totalBilled = feeLedgers.reduce((sum, l) => sum + l.totalBilled, 0);
  const totalCollected = feeLedgers.reduce((sum, l) => sum + l.totalPaid, 0);
  const totalPending = feeLedgers.reduce((sum, l) => sum + l.pendingBalance, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = totalCollected - totalExpenses;

  const filteredLedgers = feeLedgers.filter((l) => {
    const matchesSearch =
      l.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.seatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenPayment = (ledger: FeeLedgerEntry) => {
    setSelectedLedger(ledger);
    setPayAmount(ledger.pendingBalance);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLedger || payAmount <= 0) return;

    recordPayment(selectedLedger.id, payAmount, payMethod);
    setSelectedLedger(null);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title || expenseForm.amount <= 0) return;

    addExpense({
      ...expenseForm,
      tenantId: activeTenant?.id || 'tenant-1',
    });
    setIsAddExpenseOpen(false);
    setExpenseForm({
      title: '',
      category: 'ELECTRICITY',
      amount: 5000,
      date: new Date().toISOString().split('T')[0],
      paymentStatus: 'PAID',
      vendorName: '',
      receiptNumber: '',
    });
    fireConfetti();
  };

  const getCategoryIcon = (category: ExpenseItem['category']) => {
    switch (category) {
      case 'RENT':
        return <Building className="w-4 h-4 text-indigo-500" />;
      case 'ELECTRICITY':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'WIFI_INTERNET':
        return <Wifi className="w-4 h-4 text-teal-500" />;
      case 'CLEANING_HYGIENE':
        return <Brush className="w-4 h-4 text-emerald-500" />;
      case 'STAFF_SALARY':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Billed Fees</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalBilled)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Issued Member Invoices</span>
          </div>
        </div>

        {/* Total Paid / Collected */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Collected</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCollected)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Received via UPI & Cash</span>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Balances</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPending)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Unpaid / Partial Dues</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Branch Expenses</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalExpenses)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Net Profit: <strong className="text-emerald-600">{formatCurrency(netOperatingProfit)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('LEDGERS')}
            className={`px-5 py-2 min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'LEDGERS'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" /> Member Fee Ledgers
          </button>
          <button
            onClick={() => setActiveTab('EXPENSES')}
            className={`px-5 py-2 min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'EXPENSES'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-4 h-4" /> Operational Expense Tracker
          </button>
        </div>

        {activeTab === 'EXPENSES' && (
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Log New Expense
          </button>
        )}
      </div>

      {/* Tab 1: Member Fee Ledgers */}
      {activeTab === 'LEDGERS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Double-Entry Fee Ledger</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track billed, paid, partial payments, and overdue student subscription fees.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-4">Student & Seat</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Total Billed</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Pending Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No fee ledger entries match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredLedgers.map((ledger) => (
                    <tr key={ledger.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                        {ledger.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{ledger.studentName}</div>
                        <div className="text-[11px] text-slate-400">Desk: {ledger.seatNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {ledger.shift}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(ledger.totalBilled)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {formatCurrency(ledger.totalPaid)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">
                        {formatCurrency(ledger.pendingBalance)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ledger.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : ledger.status === 'PARTIALLY_PAID'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {ledger.status === 'PAID' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {ledger.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {ledger.pendingBalance > 0 ? (
                          <button
                            onClick={() => handleOpenPayment(ledger)}
                            className="px-3 py-1.5 min-h-[36px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            Collect Due
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">Settled ✓</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Operational Expense Tracker */}
      {activeTab === 'EXPENSES' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Operational Expenses (Rent, Electricity, WiFi)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log and monitor recurring utility bills and facility upkeep.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total Expenses: {formatCurrency(totalExpenses)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-6">Expense / Utility</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor / Provider</th>
                  <th className="py-3 px-4">Billing Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {getCategoryIcon(exp.category)}
                      <span>{exp.title}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                      {exp.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.vendorName || 'Direct Payment'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(exp.date)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete expense"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedLedger && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setSelectedLedger(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Record Fee Payment</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Invoice {selectedLedger.invoiceNumber} • {selectedLedger.studentName}
                </p>
              </div>
              <button
                onClick={() => setSelectedLedger(null)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs flex items-center justify-between">
                <span className="text-amber-800 dark:text-amber-300 font-medium">Pending Due Amount:</span>
                <span className="font-extrabold text-amber-700 dark:text-amber-400 text-sm">
                  {formatCurrency(selectedLedger.pendingBalance)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Collect (INR)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedLedger.pendingBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="CASH">Cash Desk Deposit</option>
                  <option value="CREDIT_CARD">Credit / Debit Card POS</option>
                  <option value="NET_BANKING">Net Banking / IMPS</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedLedger(null)}
                  className="px-4 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsAddExpenseOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Log Operating Cost / Bill</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Record branch utility or facility expenses.</p>
              </div>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="e.g. Commercial Floor AC Electricity"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="RENT">Rent</option>
                    <option value="ELECTRICITY">Electricity</option>
                    <option value="WIFI_INTERNET">WiFi Broadband</option>
                    <option value="CLEANING_HYGIENE">Cleaning & Housekeeping</option>
                    <option value="STAFF_SALARY">Staff Salary</option>
                    <option value="MAINTENANCE">Repairs & Maintenance</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Vendor / Entity Name
                </label>
                <input
                  type="text"
                  value={expenseForm.vendorName}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                  placeholder="e.g. BSES Power / CleanCare Inc"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
