import React, { useRef } from 'react';
import { X, Printer, Download, Building2, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { useDb } from '@/context/DbContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/currency';
import type { Order } from '@/types';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const { settings = {}, products = [] } = useDb();
  const { user } = useAuth();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const companyName = settings.companyName || 'GlobalDrop ERP';
  const companyEmail = settings.email || 'billing@globaldrop.com';
  const companyPhone = settings.phone || '+91 (044) 4500-1234';
  const companyAddress = settings.address || 'GlobalDrop Tower, Tech Park Road, India';
  const taxRate = settings.taxRate || 18;

  const invoiceNumber = `INV-${order.id.replace('#', '')}`;
  const invoiceDate = order.createdAt || new Date().toISOString().split('T')[0];
  const dueDate = order.deadline || invoiceDate;

  // Calculate items with unit prices (fallback to product selling price if price is 0)
  const itemsWithPrices = order.products.map(p => {
    let unitPrice = p.price || 0;
    if (unitPrice === 0) {
      const invProd = products.find(prod => prod.name.toLowerCase() === p.name.toLowerCase());
      if (invProd) {
        unitPrice = invProd.sellingPrice;
      }
    }
    const total = (p.quantity || 1) * unitPrice;
    return {
      ...p,
      price: unitPrice,
      total
    };
  });

  const subtotal = itemsWithPrices.reduce((acc, i) => acc + i.total, 0);
  const calculatedTotal = order.totalAmount > 0 ? order.totalAmount : subtotal;
  const taxAmount = (calculatedTotal * taxRate) / (100 + taxRate);
  const netBeforeTax = calculatedTotal - taxAmount;

  const handlePrint = () => {
    if (user?.role !== 'admin') return;
    window.print();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="modal-overlay z-50 p-4" onClick={onClose}>
        <div className="modal-content max-w-md w-full p-6 text-center bg-white rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <X size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Access Restricted</h3>
          <p className="text-sm text-slate-600 mb-4">Invoices can only be viewed and downloaded by Admin users.</p>
          <button onClick={onClose} className="btn-primary w-full justify-center">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay z-50 overflow-y-auto py-6" onClick={onClose}>
      <div
        className="modal-content max-w-3xl w-full mx-auto p-0 bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:m-0 print:w-full print:max-w-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-400" size={20} />
            <h2 className="text-base sm:text-lg font-bold">Tax Invoice — {invoiceNumber}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-2 transition-all shadow"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div ref={invoiceRef} className="p-6 sm:p-10 bg-white text-slate-800 print:p-0 print:text-black">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 text-white font-black text-xl rounded-xl flex items-center justify-center shadow-md print:border">
                  GD
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{companyName}</h1>
                  <p className="text-xs text-slate-500 font-medium">Enterprise Resource Planning & Distribution</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p className="flex items-center gap-1"><Building2 size={12} className="text-slate-400" /> {companyAddress}</p>
                <p className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {companyEmail}</p>
                <p className="flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {companyPhone}</p>
              </div>
            </div>

            <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-none">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-2 print:border">
                OFFICIAL INVOICE
              </span>
              <p className="text-sm font-bold text-slate-900">{invoiceNumber}</p>
              <p className="text-xs text-slate-500 mt-1">Invoice Date: <strong className="text-slate-700">{invoiceDate}</strong></p>
              <p className="text-xs text-slate-500">Due Date: <strong className="text-slate-700">{dueDate}</strong></p>
              <p className="text-xs text-slate-500">Order Reference: <strong className="text-blue-600">{order.id}</strong></p>
            </div>
          </div>

          {/* Billed To / Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 bg-slate-50 rounded-xl border border-slate-200 print:bg-white print:border print:p-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Billed To (Customer)</p>
              <p className="text-base font-bold text-slate-900">{order.customer}</p>
              {order.customerPhone && <p className="text-xs text-slate-600 mt-0.5">Phone: {order.customerPhone}</p>}
              {order.customerEmail && <p className="text-xs text-slate-600">Email: {order.customerEmail}</p>}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Fulfillment Details</p>
              <p className="text-xs text-slate-700">Branch Location: <strong className="font-semibold">{order.branch}</strong></p>
              <p className="text-xs text-slate-700 mt-0.5">Status: <strong className="capitalize font-semibold text-emerald-600">{order.status}</strong></p>
              <p className="text-xs text-slate-700 mt-0.5">Payment Terms: <strong className="font-semibold">Standard Commercial</strong></p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 print:bg-slate-200">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {itemsWithPrices.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(item.price, user?.role)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(item.total, user?.role)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Financial Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 gap-6">
            <div className="max-w-xs text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-500" /> Authorized Invoice
              </p>
              <p>Thank you for doing business with us. This is a computer-generated tax invoice and requires no physical signature.</p>
            </div>

            <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 print:bg-white print:border-none">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal (Net)</span>
                <span>{formatCurrency(netBeforeTax, user?.role)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>GST / Tax ({taxRate}%)</span>
                <span>{formatCurrency(taxAmount, user?.role)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Amount</span>
                <span>{formatCurrency(calculatedTotal, user?.role)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>{companyName} • Official Commercial Invoice • All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
