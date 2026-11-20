import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    threshold: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('RawMaterial', schema);
