import { Document, Schema, model, models } from "mongoose";

export interface IImage extends Document {
  title: string;
  transformationType: string;
  public_id: string;
  transparentPublicId?: string;
  bgPublicId?: string;
  secure_url: string;
  width?: number;
  height?: number;
  config?: object;
  transformationUrl?: string;
  aspectRatio?: string;
  color?: string;
  prompt?: string;
  to?: string;
  from?: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema({
  title: { type: String, required: true },
  transformationType: { type: String, required: true },
  public_id: { type: String, required: true },
  transparentPublicId: { type: String },
  bgPublicId: { type: String },
  secure_url: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  config: { type: Object },
  transformationUrl: { type: String },
  aspectRatio: { type: String },
  color: { type: String },
  prompt: { type: String },
  to: { type: String },
  from: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Image = models?.Image || model("Image", ImageSchema);

export default Image;
