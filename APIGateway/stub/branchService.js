const PROTO_PATH = "./proto/branch.proto";

const BRANCH_IP = process.env.BRANCH_IP || "localhost";
let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor =
  grpc.loadPackageDefinition(packageDefinition).BranchService;

const branchService = new protoDescriptor(
  `${BRANCH_IP}:30043`,
  grpc.credentials.createInsecure()
);

module.exports = branchService;
