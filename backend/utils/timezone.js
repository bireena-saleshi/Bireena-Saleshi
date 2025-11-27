/**
 * Timezone Utility for consistent date/time handling
 * Stores in UTC, displays in Asia/Kolkata (IST)
 */

const { DateTime } = require('luxon');

const TIMEZONE = 'Asia/Kolkata'; // IST (UTC+5:30)

/**
 * Convert UTC Date to IST formatted string
 * @param {Date} date - JavaScript Date object (stored in UTC)
 * @param {string} format - Output format (default: 'dd/MM/yyyy, hh:mm:ss a')
 * @returns {string} - Formatted date string in IST
 */
function formatToIST(date, format = 'dd/MM/yyyy, hh:mm:ss a') {
    if (!date) return 'N/A';
    
    try {
        // Convert to IST timezone
        const dt = DateTime.fromJSDate(date, { zone: 'UTC' })
            .setZone(TIMEZONE);
        
        // Return formatted string
        return dt.toFormat(format);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
}

/**
 * Get current time in IST
 * @returns {Date} - Current date/time as JS Date (UTC stored)
 */
function getCurrentTime() {
    return new Date(); // Always stores in UTC
}

/**
 * Format date for display (fallback without luxon)
 * @param {Date} date 
 * @returns {string}
 */
function formatToISTFallback(date) {
    if (!date) return 'N/A';
    
    try {
        // Using Intl.DateTimeFormat for IST
        const options = {
            timeZone: TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        
        return new Intl.DateTimeFormat('en-IN', options).format(date);
    } catch (error) {
        console.error('Date formatting error:', error);
        return date.toString();
    }
}

/**
 * Get date and time separately
 * @param {Date} date 
 * @returns {Object} - { date: string, time: string }
 */
function getDateTimeSeparate(date) {
    if (!date) return { date: 'N/A', time: 'N/A' };
    
    try {
        const dt = DateTime.fromJSDate(date, { zone: 'UTC' })
            .setZone(TIMEZONE);
        
        return {
            date: dt.toFormat('dd/MM/yyyy'),
            time: dt.toFormat('hh:mm:ss a')
        };
    } catch (error) {
        console.error('Date formatting error:', error);
        return { date: 'Invalid', time: 'Invalid' };
    }
}

/**
 * Format for bill printing (more readable)
 * @param {Date} date 
 * @returns {string}
 */
function formatForBill(date) {
    if (!date) return 'N/A';
    
    try {
        const dt = DateTime.fromJSDate(date, { zone: 'UTC' })
            .setZone(TIMEZONE);
        
        // Format: "27/11/2025, 11:19:10 PM"
        return dt.toFormat('dd/MM/yyyy, hh:mm:ss a');
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
}

/**
 * Add timezone helper to locals for all EJS templates
 * Use as Express middleware: app.use(addTimezoneToLocals);
 */
function addTimezoneToLocals(req, res, next) {
    res.locals.formatToIST = formatToIST;
    res.locals.getDateTimeSeparate = getDateTimeSeparate;
    res.locals.formatForBill = formatForBill;
    next();
}

module.exports = {
    formatToIST,
    getCurrentTime,
    formatToISTFallback,
    getDateTimeSeparate,
    formatForBill,
    addTimezoneToLocals,
    TIMEZONE
};
