import { Application } from "egg";
import { Schema, Types } from "mongoose";
import SequenceFactory from "mongoose-sequence";
export interface ChannelProps {
  name: string;
  id: string;
}
export interface WorkProps {
  id: number | string;
  uuid: string;
  title: string;
  author: string;
  user: Types.ObjectId;
  desc?: string;
  coverImg?: string;
  content?: { [key: string]: any };
  isTemplate?: boolean;
  isPublic?: boolean;
  isHot?: boolean;
  copiedCount?: number;
  status?: 0 | 1 | 2;
  latestPublishAt?: Date;
  channels?: ChannelProps[];
}

function initWorkModel(app: Application) {
  const AutoIncrement = SequenceFactory(app.mongoose);
  const WorkSchema = new Schema<WorkProps>(
    {
      uuid: { type: String, unique: true, required: true },
      title: { type: String, required: true },
      author: { type: String, required: true },
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      desc: { type: String },
      coverImg: { type: String },
      content: { type: Object },
      isTemplate: { type: Boolean },
      isPublic: { type: Boolean },
      isHot: { type: Boolean },
      copiedCount: { type: Number, default: 0 },
      status: { type: Number, default: 1 },
      latestPublishAt: { type: Date },
      channels: { type: Array },
    },
    {
      timestamps: true,
      toJSON: {
        // document 转换普通对象，过滤掉敏感信息或者冗余字段
        transform: (_doc, ret) => {
          delete ret.password;
          delete ret.__v;
        },
      },
    }
  );

  WorkSchema.plugin(AutoIncrement, { inc_field: "id", id: "works_id_counter" });

  return app.mongoose.model<WorkProps>("Work", WorkSchema);
}

export default initWorkModel;
