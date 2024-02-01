import { Application } from "egg";
import { Schema } from "mongoose";
import SequenceFactory from "mongoose-sequence";

export interface UserProps {
  username: string;
  password?: string;
  email?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  type: "email" | "cellphone" | "oauth";
  provider?: "gitee";
  oauthID?: number;
  role?: "admin" | "normal";
}

function initUserModel(app: Application) {
  const AutoIncrement = SequenceFactory(app.mongoose);
  const UserSchema = new Schema<UserProps>(
    {
      username: { type: String, unique: true, required: true },
      password: { type: String },
      email: { type: String },
      nickName: { type: String },
      picture: { type: String },
      phoneNumber: { type: String },
      type: { type: String, default: "email" },
      provider: { type: String },
      oauthID: { type: Number },
      role: { type: String, default: "normal" },
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

  UserSchema.plugin(AutoIncrement, { inc_field: "id", id: "users_id_counter" });
  return app.mongoose.model<UserProps>("User", UserSchema);
}

export default initUserModel;
