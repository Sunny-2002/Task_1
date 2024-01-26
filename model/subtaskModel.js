const mongoose = require("mongoose");

const SubTaskSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskSchema' },
   status: { type: String, enum: ['TODO', 'DONE'], default: 'TODO' },
  is_deleted: { type: Boolean, default: false },
},
   {
		timestamps: true
	}
);

module.exports = mongoose.model("SubTask", SubTaskSchema);