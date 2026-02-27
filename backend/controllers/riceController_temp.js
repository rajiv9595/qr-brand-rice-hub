
// @desc    Deactivate listing (Supplier)
// @route   PATCH /api/rice/:id/deactivate
// @access  Private (Supplier)
exports.deactivateListing = async (req, res) => {
    try {
        const listing = await RiceListing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check ownership
        const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
        if (!supplierProfile || listing.supplierId.toString() !== supplierProfile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to deactivate this listing' });
        }

        listing.isActive = false;
        await listing.save();

        res.json({ success: true, data: listing, message: 'Listing deactivated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Activate listing (Supplier)
// @route   PATCH /api/rice/:id/activate
// @access  Private (Supplier)
exports.activateListing = async (req, res) => {
    try {
        const listing = await RiceListing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check ownership
        const supplierProfile = await SupplierProfile.findOne({ userId: req.user._id });
        if (!supplierProfile || listing.supplierId.toString() !== supplierProfile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to activate this listing' });
        }

        // Only allow activation if approved
        if (listing.approvalStatus !== 'approved') {
            return res.status(400).json({ success: false, message: 'Listing must be approved to activate' });
        }

        listing.isActive = true;
        await listing.save();

        res.json({ success: true, data: listing, message: 'Listing activated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
