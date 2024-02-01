import { Application } from "egg";
import { Schema } from "mongoose";
import SequenceFactory from "mongoose-sequence";

export interface TemplateProps {
  name: string;
  pkgName: string;
  version: string;
  tag?: "project" | "component";
  type?: "normal" | "custom";
  installCmd?: string;
  startCmd?: string;
  ignore?: string[];
  targetPath?: string;
}

function initTemplateModel(app: Application) {
  const AutoIncrement = SequenceFactory(app.mongoose);
  const TemplateSchema = new Schema<TemplateProps>(
    {
      name: { type: String, unique: true, required: true },
      pkgName: { type: String, unique: true, required: true },
      version: { type: String, required: true },
      tag: { type: String, default: "project" },
      type: { type: String, default: "normal" },
      installCmd: { type: String, default: "npm install" },
      startCmd: { type: String, default: "npm run start" },
      ignore: { type: Array },
      targetPath: { type: String },
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

  TemplateSchema.plugin(AutoIncrement, {
    inc_field: "id",
    id: "templates_id_counter",
  });

  return app.mongoose.model<TemplateProps>("Template", TemplateSchema);
}

export default initTemplateModel;
