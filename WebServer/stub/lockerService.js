const PROTO_PATH = "./proto/locker.proto";
const LOCKER_IP = process.env.BRANCH_IP || "localhost";
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
  `${LOCKER_IP}:30043`,
  grpc.credentials.createInsecure()
);

module.exports = lockerService;
