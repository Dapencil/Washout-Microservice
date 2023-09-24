const PROTO_PATH_Branch = "../proto/branch.proto";
const PROTO_PATH_Locker = "../proto/locker.proto";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");

var packageDefinition_Branch = protoLoader.loadSync(PROTO_PATH_Branch, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

var packageDefinition_Locker = protoLoader.loadSync(PROTO_PATH_Locker, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor_Branch = grpc.loadPackageDefinition(
  packageDefinition_Branch
);
let protoDescriptor_Locker = grpc.loadPackageDefinition(
  packageDefinition_Locker
);

const server = new grpc.Server();

let branches = [
  {
    id: "cdc58005-2046-4ad3-beae-cbbacfe82509",
    name: "สี่พระยา",
    address: "ไม่ทราบ",
    telNum: "0987911234",
  },
  {
    id: "753c2c9e-f49a-4e90-8353-110bac646170",
    name: "ตึกอักษร",
    address: "ไม่ทราบ",
    telNum: "0987911234",
  },
];

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

server.addService(protoDescriptor_Branch.BranchService.service, {
  getAll: (_, callback) => {
    callback(null, { branches });
  },
  get: (call, callback) => {
    let branchItem = branches.find((n) => n.id == call.request.id);

    if (branchItem) {
      callback(null, branchItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: (call, callback) => {
    let branchItem = call.request;
    branchItem.id = "3de86728-700f-4456-a025-2973a79e61ff";
    branches.push(branchItem);
    callback(null, branchItem);
  },
  update: (call, callback) => {
    let existingBranchItem = branches.find((n) => n.Id == call.request.id);

    if (existingBranchItem) {
      existingBranchItem.name = call.request.name;
      existingBranchItem.address = call.request.address;
      existingBranchItem.telNum = call.request.telNum;
      callback(null, existingBranchItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  remove: (call, callback) => {
    let existingBranchItem = branches.findIndex((n) => n.id == call.request.id);

    if (existingBranchItem != -1) {
      branches.splice(existingBranchItem, 1);
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

server.addService(protoDescriptor_Locker.LockerService.service, {
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

const PORT = process.env.PORT || 30043;

server.bindAsync(
  `127.0.0.1:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(`Branch Service Started at PORT ${PORT}`);
  }
);
