const PROTO_PATH = "./proto/order.proto";
const ORDER_IP = process.env.ORDER_IP || "localhost";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor =
  grpc.loadPackageDefinition(packageDefinition).OrderService;

const orderService = new protoDescriptor(
  `${ORDER_IP}:30046`,
  grpc.credentials.createInsecure()
);

module.exports = orderService;
