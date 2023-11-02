require("dotenv").config({ path: "./config.env" });

const PROTO_PATH = process.env.PROTO_PATH || "./proto/order.proto";
const NODE_ENV = process.env.NODE_ENV || "DEV";
const PORT = process.env.PORT || 30046;
const DATABASE_URL = process.env[`${NODE_ENV}_DATABASE_URL`];
const IP = process.env[`${NODE_ENV}_IP`] || "127.0.0.1";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Order = require("./model/order");

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

let packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(protoDescriptor.OrderService.service, {
  getAll: async (_, callback) => {
    let orders = await Order.find();
    callback(null, { orders });
  },
  getRecentOrder: async (call, callback) => {
    let orders = await Order.find({ userId: call.request.userId })
      .sort({ timestamp: -1 })
      .limit(5);
    callback(null, { orders });
  },
  get: async (call, callback) => {
    let orderItem = await Order.findOne({ id: call.request.id }).exec();
    if (orderItem) {
      callback(null, orderItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: async (call, callback) => {
    let orderItem = new Order({ ...call.request, id: uuidv4() });
    await orderItem.save();
    callback(null, orderItem);
  },
  update: async (call, callback) => {
    let existingOrderItem = await Order.findOne({ id: call.request.id }).exec();

    if (existingOrderItem) {
      existingOrderItem.userId = call.request.userId;
      existingOrderItem.machineId = call.request.machineId;
      existingOrderItem.timestamp = call.request.timestamp;
      callback(null, existingOrderItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  remove: async (call, callback) => {
    let existingOrderItem = await Order.findOne({ id: call.request.id }).exec();

    if (existingOrderItem) {
      await existingOrderItem.deleteOne();
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

server.bindAsync(
  `${IP}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log("Starting on", NODE_ENV);
    console.log(`Order Service Started at PORT ${PORT}`);
  }
);
