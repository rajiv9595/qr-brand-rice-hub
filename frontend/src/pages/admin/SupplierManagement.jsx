import React, { useState, useEffect } from 'react';
import { Search, Eye, EyeOff, Package, CheckCircle, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import { adminService } from '../../services/adminService';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailModal, setDetailModal] = useState({ open: false, supplier: null });
    const [gstData, setGstData] = useState(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, [searchTerm]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await adminService.getAllSuppliers({ search: searchTerm });
            setSuppliers(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'Deactivate' : 'Approve';
        if (!confirm(`${action} this supplier account?`)) return;
        try {
            await adminService.deactivateSupplier(id);
            fetchSuppliers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.message || 'Failed to update supplier status');
        }
    };

    const handleVerifyGST = async (id) => {
        setVerifying(true);
        try {
            const res = await adminService.verifySupplierGST(id);
            setGstData(res.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* ... header ... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Supplier Management</h2>
                    <p className="text-gray-600 mt-2">Manage supplier accounts and listings</p>
                </div>
                {/* ... search ... */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Supplier</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Listings</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {suppliers.map((supplier) => (
                                    <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900">{supplier.millName}</p>
                                                <p className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                    {supplier.userId?.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{supplier.district}, {supplier.state}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-600">{supplier.userId?.phone || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-primary-600" />
                                                <span className="font-bold text-gray-900">{supplier.listingCount || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${supplier.userId?.isVerified
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {supplier.userId?.isVerified ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setDetailModal({ open: true, supplier })}
                                                    className="btn-secondary text-sm py-2 px-3"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(supplier._id, supplier.userId?.isVerified)}
                                                    className={`btn text-sm py-2 px-3 border ${supplier.userId?.isVerified
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'}`}
                                                    title={supplier.userId?.isVerified ? "Deactivate" : "Approve"}
                                                >
                                                    {supplier.userId?.isVerified ? <EyeOff className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal.open && detailModal.supplier && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
                        <h3 className="text-2xl font-black text-gray-900 mb-6">Supplier Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase">Mill Name</p>
                                <p className="text-lg font-bold text-gray-900">{detailModal.supplier.millName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                    GST Number
                                    <button
                                        onClick={() => handleVerifyGST(detailModal.supplier._id)}
                                        disabled={verifying}
                                        className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full hover:bg-primary-200 transition-colors disabled:opacity-50"
                                    >
                                        {verifying ? 'Verifying...' : 'Check Status'}
                                    </button>
                                </p>
                                <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {detailModal.supplier.gstNumber || 'N/A'}
                                    {gstData?.isValid && <ShieldCheck className="w-5 h-5 text-green-500" />}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase">Contact Phone</p>
                                <p className="text-lg font-bold text-gray-900">{detailModal.supplier.userId?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase">Location</p>
                                <p className="text-lg font-bold text-gray-900">{detailModal.supplier.district}, {detailModal.supplier.state}</p>
                            </div>
                        </div>

                        {gstData && (
                            <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-100 animate-in fade-in slide-in-from-top-2 duration-500">
                                <h4 className="text-xs font-black text-green-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" /> Official GST Health Data
                                </h4>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500 font-bold text-[10px] uppercase">Legal Name</p>
                                        <p className="font-bold text-gray-900">{gstData.legalName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-[10px] uppercase">GST Status</p>
                                        <p className="font-extrabold text-green-600">{gstData.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-[10px] uppercase">Constitution</p>
                                        <p className="font-bold text-gray-900">{gstData.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-[10px] uppercase">Last Checked</p>
                                        <p className="font-bold text-gray-900">{new Date(gstData.lastCheck).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setDetailModal({ open: false, supplier: null });
                                setGstData(null);
                            }}
                            className="btn-primary w-full mt-6 shadow-xl shadow-primary-500/20"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
