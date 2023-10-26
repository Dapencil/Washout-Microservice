require("dotenv").config({ path: "./config.env" });

const PROTO_PATH = process.env.PROTO_PATH || "./proto/order.proto";
let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));
const Order = require("./model/order");

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

const PORT = process.env.PORT || 30046;

server.bindAsync(
  `127.0.0.1:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(`Order Service Started at PORT ${PORT}`);
  }
);
