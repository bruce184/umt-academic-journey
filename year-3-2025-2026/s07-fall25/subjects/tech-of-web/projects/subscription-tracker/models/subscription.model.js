import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Subscription name is required' ],
        trim: true,
        minLength: 2,
        maxLength: 100,
    }, 
    price: {
        type: Number,
        required: [ true, 'Price is required' ],
        min: [  0, 'Price must be a positive number' ],   
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY'],
        default: 'USD',
    },
    frequency: {
        type: String,
        enum: ['monthly', 'yearly', 'weekly', 'daily'],
    },
    category: {
        type: String,
        enum: ['entertainment', 'productivity', 'education', 'health', 'other'],
    }, 
    paymentMethod: {
        type: String,
        required: [ true, 'Payment method is required' ],
        trim: true
    }, 
    status: {
        type: String,
        enum: ['active', 'inactive', 'canceled'],
        default: 'active',
    }, 
    startDate: {
        type: Date,
        required: [ true, 'Start date is required' ],
        validate: {
            validator: (value) => value <= new Date(),
            message: 'Start date cannot be in the future'
        }
    }, 
    renewalDate: {
        type: Date,
        required: [ true, 'Renewal date is required' ],
        validate: {
            validator: (value) => value > this.startDate(),
            message: 'Renewal date must be in the future'
        }, 
        message: 'Renewal date must be after start date'
    }, 
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        indexed: true
    }
}, { timestamps: true });

// Auto calculate renewalDate before saving
subscriptionSchema.pre('save', function(next) {
    if (this.renewalDate) {
        const renewalDate = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365
        };
    
        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalDate[this.frequency]);
    }

    // Auto set status if renewalDate is past
    if (this.renewalDate < new Date()) {
        this.status = 'expired';
    }

    next();
});



const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;