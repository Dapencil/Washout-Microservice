const PROTO_PATH = "../proto/locker.proto";

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

let lockers = [
  {
    id: "800274fb-42db-4520-9671-127457cfae15",
    branchId: "cdc58005-2046-4ad3-beae-cbbacfe82509",
    userId: "some_user",
  },
  {
    id: "b3f4925b-1d75-489b-9bce-a70442b470fa",
    branchId: "753c2c9e-f49a-4e90-8353-110bac646170",
    userId: "some_user",
  },
];

server.addService(protoDescriptor.LockerService.service, {
  getAll: (_, callback) => {
    callback(null, { lockers });
  },
  get: (call, callback) => {
    let LockerItem = lockers.find((n) => n.id == call.request.id);

    if (LockerItem) {
      callback(null, LockerItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: (call, callback) => {
    let lockerItem = call.request;
    lockerItem.id = "some-locker-id";
    lockers.push(lockerItem);
    callback(null, lockerItem);
  },
  update: (call, callback) => {
    let existingLockerItem = lockers.find((n) => n.Id == call.request.id);

    if (existingLockerItem) {
      existingLockerItem.branchId = call.request.branchId;
      existingLockerItem.userId = call.request.userId;
      callback(null, existingLockerItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  remove: (call, callback) => {
    let existingLockerItem = lockers.findIndex((n) => n.id == call.request.id);

    if (existingLockerItem != -1) {
      lockers.splice(existingLockerItem, 1);
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

const PORT = process.env.PORT || 30045;

server.bindAsync(
  `127.0.0.1:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(`Locker Service Started at PORT ${PORT}`);
  }
);
