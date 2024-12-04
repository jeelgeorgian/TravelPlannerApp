const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TripSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripName: {
    type: String,
    required: true,
    trim: true,
  },
  tripDate: {
    type: Date,
    required: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  }
}, { timestamps: true });

TripSchema.methods.getUser = async function () {
  return await User.findById(this.user);
};

module.exports = mongoose.model('Trip', TripSchema);
