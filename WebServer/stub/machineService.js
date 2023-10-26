const PROTO_PATH = "./proto/machine.proto";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor =
  grpc.loadPackageDefinition(packageDefinition).MachineService;

const machineService = new protoDescriptor(
  "localhost:30044",
  grpc.credentials.createInsecure()
);

module.exports = machineService;
