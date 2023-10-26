require("dotenv").config({ path: "./config.env" });

const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const amqp = require("amqplib/callback_api");

const regisToken =
  "fEtsLnzgRyipo3tmpWRxEQ:APA91bEOI4y4yTRaNmnMOhVP9Y-344trrAJi5uo6pJEFM61RuJwxy82lL2joBwc2Nc2g6VNcaBHs9RDJ232rY_f3ZLFA2gkkmtsXjAJtj1zvVdlU3ablPp3LAZYsRxH3KUkXQ47sxEik";

const generateMSG = (msg) => ({
  token: regisToken,
  notification: {
    title: "From Node",
    body: msg.content.toString(),
  },
});

const notiApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    let queue = "noti_queue";
    channel.assertQueue(queue, { exclusive: false }, function (error2, q) {
      if (error2) {
        throw error2;
      }
      channel.consume(
        q.queue,
        function (msg) {
          console.log(msg.content.toString());
          channel.ack(msg);
          // getMessaging()
          //   .send(generateMSG(msg))
          //   .then((res) => {
          //     console.log(res);
          //     channel.ack(msg);
          //   })
          //   .catch((err) => {
          //     console.log(err);
          //   });
        },
        {
          noAck: false,
        }
      );
    });
  });
});
