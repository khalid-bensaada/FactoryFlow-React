import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    items: [
      {
        _id: false,
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        reference: String,
        name: String,
        quantity: { type: Number, required: true, min: 0 },
        composition: [
          {
            _id: false,
            material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
            quantity: { type: Number, required: true }
          }
        ]
      }
    ],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned', index: true },
    startedAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('Order', schema);
