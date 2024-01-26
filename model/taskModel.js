const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSchema' },
  description: String,
  due_date:{ type: Date, default : Date.now },
  status: { type: String, enum: ['TODO', 'DONE'], default: 'TODO' },
  is_deleted: { type: Boolean, default: false },
},
   {
		timestamps: true
	}
);

module.exports = mongoose.model("Task", TaskSchema);