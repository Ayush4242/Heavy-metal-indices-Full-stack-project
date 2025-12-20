import mongoose from "mongoose";

const pollutionSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
    },

    metal: {
      type: String,
      required: true, 
    },

    concentration: {
      type: Number,
      required: true, 
    },

    permissibleLimit: {
      type: Number,
      required: true, 
    },

    
    cf: {
      type: Number,
    },

    
    iGeo: {
      type: Number,
    },

    
    pli: {
      type: Number,
    },

    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Pollution = mongoose.model("Pollution", pollutionSchema);

export default Pollution;
