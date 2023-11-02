require("dotenv").config({ path: "./config.env" });

const NODE_ENV = process.env.NODE_ENV || "DEV";
const PROTO_PATH = process.env.PROTO_PATH || "./proto/machine.proto";
const BROKER_URL = process.env.BROKER_URL || "amqp://localhost";
const DATABASE_URL = process.env[`${NODE_ENV}_DATABASE_URL`];
const PORT = process.env.PORT || 30044;
const IP = process.env[`${NODE_ENV}_IP`] || "0.0.0.0";

let grpc = require("@grpc/grpc-js");
let protoLoader = require("@grpc/proto-loader");
const amqp = require("amqplib/callback_api");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const orderService = require("./stub/orderService");

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));
const Machine = require("./model/machine");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

let protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

function sentMessage(message, queueName) {
  amqp.connect(BROKER_URL, function (error0, connection) {
    if (error0) {
      throw error0;
    }
    console.log("Connected to Rabbit MQ");
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(queueName, { durable: true });
      channel.sendToQueue(queueName, Buffer.from(message), {
        persistent: true,
      });
    });
  });
}

server.addService(protoDescriptor.MachineService.service, {
  getAll: async (_, callback) => {
    let machines = await Machine.find();
    callback(null, { machines });
  },
  get: async (call, callback) => {
    let machineItem = await Machine.findOne({ id: call.request.id }).exec();
    if (machineItem) {
      callback(null, machineItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  insert: async (call, callback) => {
    let machineItem = new Machine({ ...call.request, id: uuidv4() });
    await machineItem.save();
    callback(null, machineItem);
  },
  update: async (call, callback) => {
    let existingMachineItem = await Machine.findOne({
      id: call.request.id,
    }).exec();
    if (existingMachineItem) {
      if (call.request.currentOrder === "null") {
        call.request.currentOrder = null;
      }
      console.log(call.request);
      Object.assign(existingMachineItem, call.request);
      await existingMachineItem.save();
      callback(null, existingMachineItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not found",
      });
    }
  },
  remove: async (call, callback) => {
    let existingMachineItem = await Machine.findOne({
      id: call.request.id,
    }).exec();
    if (existingMachineItem) {
      await existingMachineItem.deleteOne();
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
  getFromBranch: async (call, callback) => {
    let machines = await Machine.find({
      branchId: call.request.branchId,
    }).exec();

    if (machines) {
      callback(null, { machines });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
  getFinishedInBranch: async (call, callback) => {
    let machines = await Machine.find({
      branchId: call.request.branchId,
      status: "finished",
    }).exec();
    if (machines) {
      callback(null, { machines });
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
  start: async (call, callback) => {
    let machineItem = await Machine.findOne({
      id: call.request.machineId,
    }).exec();

    if (machineItem) {
      if (machineItem.status === "available" && !machineItem.isOpen) {
        await orderService.insert(
          {
            userId: call.request.userId,
            machineId: call.request.machineId,
          },
          async (err, data) => {
            if (err) throw err;
            console.log("New Order created successfully", data);
            machineItem.currentOrder = data.id;
            machineItem.status = "working";
            machineItem.remainingTime = 55;
            await machineItem.save();
            setMachineTimer(machineItem);
            callback(null, machineItem);
          }
        );
      } else {
        callback({
          code: grpc.status.FAILED_PRECONDITION,
          details:
            "The Door must be closed and the machine should be available",
        });
      }
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
  forceStop: async (call, callback) => {
    let machineItem = await Machine.findOne({
      id: call.request.id,
    }).exec();

    if (machineItem) {
      machineItem.status = "available";
      machineItem.isOpen = "false";
      machineItem.remainingTime = 0;
      machineItem.currentOrder = null;
      await machineItem.save();
      callback(null, machineItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
  close: async (call, callback) => {
    let machineItem = await Machine.findOne({
      id: call.request.id,
    }).exec();

    if (machineItem) {
      if (machineItem.isOpen) {
        machineItem.isOpen = false;
        await machineItem.save();
        callback(null, machineItem);
      } else {
        callback({
          code: grpc.status.FAILED_PRECONDITION,
          details: "Door must be opened",
        });
      }
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
  open: async (call, callback) => {
    let machineItem = await Machine.findOne({
      id: call.request.id,
    }).exec();

    if (machineItem) {
      if (!machineItem.isOpen) {
        if (machineItem.status === "working")
          callback({
            code: grpc.status.FAILED_PRECONDITION,
            details: "The machine is working",
          });
        else {
          if (machineItem.status === "finished") {
            machineItem.status = "available";
            machineItem.currentOrder = null;
          }
          machineItem.isOpen = true;
          await machineItem.save();
          callback(null, machineItem);
        }
      } else {
        callback({
          code: grpc.status.FAILED_PRECONDITION,
          details: "Door must be closed",
        });
      }
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "NOT Found",
      });
    }
  },
});

const updateTime = async (machineItem) => {
  machineItem.remainingTime--;
  if (machineItem.remainingTime == 5) {
    await orderService.get(
      {
        id: machineItem.currentOrder,
      },
      async (err, data) => {
        if (err) throw err;
        sentMessage(`${data.userId} 5`, "noti_queue");
      }
    );
  } else if (machineItem.remainingTime == 0) {
    machineItem.status = "finished";
    await orderService.get(
      {
        id: machineItem.currentOrder,
      },
      async (err, data) => {
        if (err) throw err;
        sentMessage(`${data.userId} 0`, "noti_queue");
      }
    );
  }
  await machineItem.save();
};

function setMachineTimer(machineItem) {
  const interval = setInterval(() => {
    if (machineItem.remainingTime == 0) clearInterval(interval);
    else updateTime(machineItem);
  }, 1000);
}

server.bindAsync(
  `${IP}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(`Machine Service Started at PORT ${PORT}`);
  }
);
