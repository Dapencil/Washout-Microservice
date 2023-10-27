require("dotenv").config({ path: "./config.env" });

const PROTO_PATH_Branch = "./proto/branch.proto";
const PROTO_PATH_Locker = "./proto/locker.proto";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

const Branch = require("./model/branch");
const Locker = require("./model/locker");

const machineService = require("./stub/machineService");

var packageDefinition_Branch = protoLoader.loadSync(PROTO_PATH_Branch, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

var packageDefinition_Locker = protoLoader.loadSync(PROTO_PATH_Locker, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor_Branch = grpc.loadPackageDefinition(
  packageDefinition_Branch
);
let protoDescriptor_Locker = grpc.loadPackageDefinition(
  packageDefinition_Locker
);

const server = new grpc.Server();

server.addService(protoDescriptor_Branch.BranchService.service, {
  getAll: async (_, callback) => {
    let branches = await Branch.find();
    callback(null, { branches });
  },
  get: async (call, callback) => {
    let branchItem = await Branch.findOne({ id: call.request.id }).exec();
    if (branchItem) {
      callback(null, branchItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: async (call, callback) => {
    let branchItem = new Branch({ ...call.request, id: uuidv4() });
    await branchItem.save();
    callback(null, branchItem);
  },
  update: async (call, callback) => {
    let existingBranchItem = await Branch.findOne({
      id: call.request.id,
    }).exec();

    if (existingBranchItem) {
      Object.assign(existingBranchItem, call.request);
      await existingBranchItem.save();
      callback(null, existingBranchItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  remove: async (call, callback) => {
    let existingBranchItem = await Branch.findOne({
      id: call.request.id,
    }).exec();

    if (existingBranchItem) {
      await existingBranchItem.deleteOne();
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

server.addService(protoDescriptor_Locker.LockerService.service, {
  getAll: async (_, callback) => {
    let lockers = await Locker.find();
    callback(null, { lockers });
  },
  getFromBranch: async (call, callback) => {
    let lockers = await Locker.find({ branchId: call.request.id });
    callback(null, { lockers });
  },
  get: async (call, callback) => {
    let lockerItem = await Locker.findOne({ id: call.request.id }).exec();
    if (lockerItem) {
      callback(null, lockerItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: async (call, callback) => {
    let lockerItem = new Locker({ ...call.request, id: uuidv4() });
    await lockerItem.save();
    callback(null, lockerItem);
  },
  update: async (call, callback) => {
    let existingLockerItem = await Locker.findOne({
      id: call.request.id,
    }).exec();
    if (existingLockerItem) {
      Object.assign(existingLockerItem, call.request);
      await existingLockerItem.save();
      callback(null, existingLockerItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  remove: async (call, callback) => {
    let existingLockerItem = await Locker.findOne({
      id: call.request.id,
    }).exec();

    if (existingLockerItem) {
      await existingLockerItem.deleteOne();
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
  moveClothes: async (call, callback) => {
    let lockerItem = await Locker.findOne({ id: call.request.lockerId }).exec();
    if (lockerItem) {
      await machineService.get(
        { id: call.request.machineId },
        async (err, machineItem) => {
          lockerItem.orderId = machineItem.currentOrder;
          await lockerItem.save();
          await machineService.update(
            { ...machineItem, currentOrder: "null" },
            (err, data) => {
              callback(null, lockerItem);
            }
          );
        }
      );
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

const PORT = process.env.PORT || 30043;

server.bindAsync(
  `127.0.0.1:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(`Branch Service Started at PORT ${PORT}`);
  }
);
