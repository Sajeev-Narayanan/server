const mongoose = require("mongoose");


const schema = mongoose.Schema;

const estimateSchema = new schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            required: true,
            trim: true,
        },
        managerId: {
            type: schema.Types.ObjectId,
            required: true,
            trim: true,
        },
        estimate: {
            type: Array,
            default: [],
            required: true,
            trim: true
        },
        paid: { type: Boolean, default: false },
        description: {
            type: String, default: "No description"
        },
    },
    { timestamps: true }
);

const Estimate = mongoose.model("Estimate", estimateSchema);
exports.Estimate = Estimate;