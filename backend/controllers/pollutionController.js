import Pollution from "../models/Pollution.js";

const predictNextValue = (values) => {
  if (values.length < 2) return null;

  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const slope = last - prev;

  return last + slope; 
};

export const addPollution = async (req, res) => {
  const { location, metal, concentration, permissibleLimit } = req.body;

  try {
    if (!location || !metal || !concentration || !permissibleLimit) {
      return res.status(400).json({ message: "All fields required" });
    }

    
    const cf = concentration / permissibleLimit;
    const iGeo = Math.log2(concentration / (1.5 * permissibleLimit));
    const pli = cf;

    
    const pollution = await Pollution.create({
      location,
      metal: metal.toLowerCase(),
      concentration,
      permissibleLimit,
      cf,
      iGeo,
      pli,
      user: req.user.id,
    });

    res.status(201).json(pollution);

  } catch (error) {
    res.status(500).json({
      message: "Pollution save failed",
      error: error.message,
    });
  }
};

export const getMyPollution = async (req, res) => {
  try {
    const records = await Pollution.find({ user: req.user.id }).sort({
      createdAt: 1,
    });

  
    const metalGroups = {};
    records.forEach((item) => {
      if (!metalGroups[item.metal]) metalGroups[item.metal] = [];
      metalGroups[item.metal].push(item.concentration);
    });

    
    const predictions = {};
    for (let metal in metalGroups) {
      predictions[metal] = predictNextValue(metalGroups[metal]);
    }

    res.json({ records, predictions });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pollution data",
      error: error.message,
    });
  }
};

export const getLocationPLI = async (req, res) => {
  try {
    const groupedData = await Pollution.aggregate([
      {
        $group: {
          _id: "$location",
          metals: { $push: "$metal" },
          cfs: { $push: "$cf" },
        },
      },
    ]);

    const result = groupedData.map((item) => {
      const cfList = item.cfs;
      const n = cfList.length;

      
      const product = cfList.reduce((acc, v) => acc * v, 1);
      const multiMetalPLI = Math.pow(product, 1 / n);

      
      const hazardIndex = cfList.reduce((acc, v) => acc + v, 0);

      return {
        location: item._id,
        metals: item.metals,
        cfValues: item.cfs,
        multiMetalPLI,
        hazardIndex,
      };
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: "Multi-metal PLI calculation failed",
      error: error.message,
    });
  }
};
