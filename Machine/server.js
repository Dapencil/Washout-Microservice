const PROTO_PATH = "../proto/machine.proto";

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

let machines = [
  {
    id: "3c292250-0630-4c38-a862-ee5b992489cf",
    branchId: "cdc58005-2046-4ad3-beae-cbbacfe82509",
    status: "Available",
    type: "7",
  },
  {
    id: "05d08d64-9b02-4b1e-8808-8dd41dad94eb",
    branchId: "753c2c9e-f49a-4e90-8353-110bac646170",
    status: "Available",
    type: "12",
  },
];

server.addService(protoDescriptor.MachineService.service, {
  getAll: (_, callback) => {
    callback(null, { machines });
  },
  get: (call, callback) => {
    let MachineItem = machines.find((n) => n.id == call.request.id);

    if (MachineItem) {
      callback(null, MachineItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: (call, callback) => {
    let machineItem = call.request;
    machineItem.id = "some-id";
    machines.push(machineItem);
    callback(null, machineItem);
  },
  update: (call, callback) => {
    let existingMachineItem = machines.find((n) => n.Id == call.request.id);

    if (existingMachineItem) {
      existingMachineItem.branchId = call.request.branchId;
      existingMachineItem.status = call.request.status;
      existingMachineItem.type = call.request.type;
      callback(null, existingMachineItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  remove: (call, callback) => {
    let existingMachineItem = machines.findIndex(
      (n) => n.id == call.request.id
    );

    if (existingMachineItem != -1) {
      machines.splice(existingMachineItem, 1);
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

const PORT = process.env.PORT || 30044;

server.bindAsync(
  `127.0.0.1:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(`Branch Service Started at PORT ${PORT}`);
  }
);
