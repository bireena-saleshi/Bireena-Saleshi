const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Raw Materials', 'Utilities', 'Salary', 'Rent', 'Maintenance', 'Transportation', 'Marketing', 'Other']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'online', 'cheque'],
        default: 'cash'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', expenseSchema);
