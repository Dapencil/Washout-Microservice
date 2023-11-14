require("dotenv").config({ path: "./config.env" });

const BROKER_URL = process.env.BROKER_URL || "amqp://localhost";
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3003/deviceToken";
const QUEUE_NAME = process.env.QUEUE_NAME || "noti_queue";

const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");
const amqp = require("amqplib/callback_api");
const axios = require("axios");

const notiApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

console.log(BROKER_URL);
amqp.connect(BROKER_URL, function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    channel.assertQueue(QUEUE_NAME, { exclusive: false }, function (error2, q) {
      if (error2) {
        throw error2;
      }
      console.log("Connected to Rabbit MQ");
      channel.consume(
        q.queue,
        async function (msg) {
          let uid, remainingTime;
          [uid, remainingTime] = msg.content.toString().split(" ");
          remainingTime = parseInt(remainingTime);
          try {
            let notification = await generateNoti(uid, remainingTime);
            console.log(`UID : ${uid}, Remaining Time: ${remainingTime}`);
            console.log(notification);
            // Send notification to Firebase
            await getMessaging().send(notification);
            channel.ack(msg);
          } catch (err) {
            console.error(err);
          }
        },
        {
          noAck: false,
        }
      );
    });
  });
});

// Util Function
// const getDeviceToken = (uid) => {};

const generateNoti = async (uid, remainingTime) => {
  let noti = {
    token: "",
    notification: {
      title: "",
      body: "",
    },
  };

  try {
    const response = await axios.get(AUTH_URL + `/${uid}`);
    noti.token = response.data.deviceToken;

    if (remainingTime == 5) {
      noti.notification.title = "ซักผ้าใกล้เสร็จแล้ว";
      noti.notification.body =
        "เหลือเวลาอีกประมาณ 5 นาที เตรียมตัวไปเอาผ้ากันเถอะ~";
    } else if (remainingTime == 0) {
      noti.notification.title = "ซักเสร็จแล้ว";
      noti.notification.body =
        "ตอนนี้ผ้าของคุณซักเสร็จแล้ว รีบไปเอาผ้าเร็วเข้า!";
    }
    return noti;
  } catch (err) {
    console.error(err.message);
    throw err; // Rethrow the error to be caught in the calling function
  }
};

// const generateNoti = async (uid, remainingTime) => {
//   let noti = {
//     token: "",
//     notification: {
//       title: "",
//       body: "",
//     },
//   };

//   axios
//     .get(AUTH_URL + `/${uid}`)
//     .then((res) => {
//       if (remainingTime == 5) {
//         noti.notification.title = "ซักผ้าใกล้เสร็จแล้ว";
//         noti.notification.body =
//           "เหลือเวลาอีกประมาณ 5 นาที เตรียมตัวไปเอาผ้ากันเถอะ~";
//       } else if (remainingTime == 0) {
//         noti.notification.title = "ซักเสร็จแล้ว";
//         noti.notification.body =
//           "ตอนนี้ผ้าของคุณซักเสร็จแล้ว รีบไปเอาผ้าเร็วเข้า!";
//       }
//       noti.token = res.data.deviceToken;
//       console.log("From inner", noti);
//       return noti;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };
