import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    composition: [
      {
        _id: false,
        material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
        quantity: { type: Number, required: true, min: 0 }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Product', schema);
