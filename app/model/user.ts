import { Application } from 'egg';
import { Schema } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

export interface UserProps {
  username: string;
  password?: string;
  email?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;
  // createdAt: Date;
  // updatedAt: Date;
  type?: 'email' | 'cellphone' | 'oauth';
  provider?: 'gitee';
  oauthID?: string;
  role?: 'admin' | 'normal';
}

export default function (app: Application) {
  const AutoIncrement = AutoIncrementFactory(app.mongoose);

  const UserSchema = new Schema<UserProps>(
    {
      username: { type: String, unique: true, required: true },
      password: { type: String },
      email: { type: String },
      nickName: { type: String },
      picture: { type: String },
      phoneNumber: { type: String },
      type: { type: String, default: 'email' },
      provider: { type: String },
      oauthID: { type: String },
      role: { type: String, default: 'normal' },
    },
    {
      // 连接已经存在的 collection，需要指定名称
      collection: 'users',
      // 自动创建 createdAt 和 updatedAt
      timestamps: true,
      // 过滤掉敏感信息
      toJSON: {
        transform(_doc, ret) {
          delete ret.password;
          delete ret.__v;
        },
      },
    }
  );

  UserSchema.plugin(AutoIncrement, {
    inc_field: 'id',
    id: 'users_id_counter',
  });

  return app.mongoose.model<UserProps>('User', UserSchema);
}
