const PROTO_PATH = "../proto/locker.proto";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor =
  grpc.loadPackageDefinition(packageDefinition).LockerService;

const lockerService = new protoDescriptor(
  "localhost:30045",
  grpc.credentials.createInsecure()
);

module.exports = lockerService;
