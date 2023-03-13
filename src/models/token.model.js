// Importing the Mongoose package
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    value: {
        type: String,
        required: true
    },
    generatedOTP: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expires: { type: Date, default: Date.now, expires: 3600 }
});

export default mongoose.model('Token', TokenSchema);
