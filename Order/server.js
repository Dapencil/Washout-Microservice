const PROTO_PATH = "../proto/order.proto";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

let orders = [
  {
    id: "054dd859-1ee2-44c6-9d47-748e341ad6ca",
    userId: "some_user_id",
    machineId: "some_machine_id",
    timestamp: "12:00:00",
  },
  {
    id: "e20515b6-7d8d-435e-9372-eddca6a8bb59",
    userId: "some_user_id",
    machineId: "some_machine_id",
    timestamp: "18:00:00",
  },
];

server.addService(protoDescriptor.OrderService.service, {
  getAll: (_, callback) => {
    callback(null, { orders });
  },
  get: (call, callback) => {
    let OrderItem = orders.find((n) => n.id == call.request.id);

    if (OrderItem) {
      callback(null, OrderItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: (call, callback) => {
    let orderItem = call.request;
    orderItem.id = "some_order_id";
    orders.push(orderItem);
    callback(null, orderItem);
  },
  update: (call, callback) => {
    let existingOrderItem = orders.find((n) => n.Id == call.request.id);

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
  remove: (call, callback) => {
    let existingOrderItem = orders.findIndex((n) => n.id == call.request.id);

    if (existingOrderItem != -1) {
      orders.splice(existingOrderItem, 1);
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
