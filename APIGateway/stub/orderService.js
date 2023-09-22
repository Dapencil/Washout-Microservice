const PROTO_PATH = "../proto/order.proto";

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
  "localhost:30046",
  grpc.credentials.createInsecure()
);

module.exports = orderService;
