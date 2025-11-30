const GSTSettings = require('../models/GSTSettings');

/**
 * Calculate GST for a sale item
 * @param {Number} taxableAmount - Amount before GST
 * @param {Boolean} isInterState - Is transaction inter-state
 * @param {Number} cgstRate - CGST rate (for intra-state)
 * @param {Number} sgstRate - SGST rate (for intra-state)
 * @param {Number} igstRate - IGST rate (for inter-state)
 * @returns {Object} GST breakdown
 */
function calculateItemGST(taxableAmount, isInterState, cgstRate = 2.5, sgstRate = 2.5, igstRate = 5) {
    const gst = {
        taxableAmount: parseFloat(taxableAmount.toFixed(2)),
        cgstRate: 0,
        cgstAmount: 0,
        sgstRate: 0,
        sgstAmount: 0,
        igstRate: 0,
        igstAmount: 0,
        totalGST: 0
    };

    if (isInterState) {
        // Inter-state: IGST only
        gst.igstRate = igstRate;
        gst.igstAmount = parseFloat(((taxableAmount * igstRate) / 100).toFixed(2));
        gst.totalGST = gst.igstAmount;
    } else {
        // Intra-state: CGST + SGST
        gst.cgstRate = cgstRate;
        gst.sgstRate = sgstRate;
        gst.cgstAmount = parseFloat(((taxableAmount * cgstRate) / 100).toFixed(2));
        gst.sgstAmount = parseFloat(((taxableAmount * sgstRate) / 100).toFixed(2));
        gst.totalGST = gst.cgstAmount + gst.sgstAmount;
    }

    return gst;
}

/**
 * Calculate total GST for entire sale
 * @param {Array} items - Array of sale items with GST calculated
 * @returns {Object} Total GST breakdown
 */
function calculateTotalGST(items) {
    const totals = {
        totalTaxableAmount: 0,
        totalCGST: 0,
        totalSGST: 0,
        totalIGST: 0,
        totalGST: 0
    };

    items.forEach(item => {
        totals.totalTaxableAmount += item.taxableAmount || 0;
        totals.totalCGST += item.cgstAmount || 0;
        totals.totalSGST += item.sgstAmount || 0;
        totals.totalIGST += item.igstAmount || 0;
    });

    totals.totalGST = totals.totalCGST + totals.totalSGST + totals.totalIGST;

    // Round all values
    totals.totalTaxableAmount = parseFloat(totals.totalTaxableAmount.toFixed(2));
    totals.totalCGST = parseFloat(totals.totalCGST.toFixed(2));
    totals.totalSGST = parseFloat(totals.totalSGST.toFixed(2));
    totals.totalIGST = parseFloat(totals.totalIGST.toFixed(2));
    totals.totalGST = parseFloat(totals.totalGST.toFixed(2));

    return totals;
}

/**
 * Get default GST settings from database
 * @returns {Object} GST settings
 */
async function getGSTSettings() {
    try {
        let settings = await GSTSettings.findOne();
        
        // If no settings exist, return defaults
        if (!settings) {
            return {
                enableGST: true,
                gstIncludedInPrice: true,
                defaultCGSTRate: 2.5,
                defaultSGSTRate: 2.5,
                defaultIGSTRate: 5,
                defaultHSNCode: '19059020',
                stateCode: '',
                gstin: ''
            };
        }
        
        return settings;
    } catch (error) {
        console.error('Error fetching GST settings:', error);
        return {
            enableGST: false,
            gstIncludedInPrice: true,
            defaultCGSTRate: 2.5,
            defaultSGSTRate: 2.5,
            defaultIGSTRate: 5,
            defaultHSNCode: '19059020',
            stateCode: '',
            gstin: ''
        };
    }
}

/**
 * Check if transaction is inter-state based on state codes
 * @param {String} sellerStateCode - Seller's state code (from GSTIN)
 * @param {String} buyerStateCode - Buyer's state code (from GSTIN or place of supply)
 * @returns {Boolean}
 */
function isInterStateTransaction(sellerStateCode, buyerStateCode) {
    if (!sellerStateCode || !buyerStateCode) {
        return false; // Default to intra-state if state codes missing
    }
    return sellerStateCode !== buyerStateCode;
}

/**
 * Extract state code from GSTIN
 * @param {String} gstin - GST Identification Number
 * @returns {String} State code (first 2 digits)
 */
function extractStateCodeFromGSTIN(gstin) {
    if (!gstin || gstin.length < 2) {
        return '';
    }
    return gstin.substring(0, 2);
}

/**
 * Validate GSTIN format
 * @param {String} gstin - GST Identification Number
 * @returns {Boolean}
 */
function validateGSTIN(gstin) {
    if (!gstin) return false;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
}

module.exports = {
    calculateItemGST,
    calculateTotalGST,
    getGSTSettings,
    isInterStateTransaction,
    extractStateCodeFromGSTIN,
    validateGSTIN
};
