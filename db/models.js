// Importing mongoose for interfacing with MongoDB Shell
import mongoose from 'mongoose'

/*** Create Schemas ***/

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String
    },
    note: {
        type: String
    },
    adminEmail: {
        type: String,
        required: true
    }
})
CustomerSchema.index({'$**': 'text'}); 

const AppointmentSchema = new mongoose.Schema({
    adminEmail: {
        type: String,
        required: true
    },
    calendarID: {
        type: String,
        required: true
    },
    customerID: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    bookedOnline: {
        type: Boolean,
        required: true,
    },
    bookedAt: {
        type: Date,
        required: true
    },
    comment: {
        type: String
    },
})

// Service Category Schema
const ServiceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    }
})

// Service Schema
const ServiceSchema = new mongoose.Schema({
    adminEmail: {
        type: String,
        required: true
    },
    categoryName: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    minutesTaken: {
        type: Number,
        required: true
    },
    breakAfter: {
        type: Number,
        required: true
    },
    elgibleCalendars: [{
        id: {
            type: String
        },
        name: {
            type: String
        }
    }],
    allCalendars: {
        type: Boolean,
        required: true
    },
    cost: {
        type: Number,
        default: 0
    },
    onlineBooking: {
        type: Boolean,
        required: true
    }
})

// Configuring schemas to models and exporting them
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema)
const ServiceCategory = mongoose.models.ServiceCategory || mongoose.model('ServiceCategory', ServiceCategorySchema)
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema)

export {
    Customer,
    Appointment,
    Service,
    ServiceCategory,
}