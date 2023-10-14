let ids = [
  "65ae6b7f-52f1-453d-b895-710ab98c73b4",
  "ff0b04b0-e43b-4a9b-b0dd-6d9c7a7d2f8e",
  "b5e9c4af-7404-49a0-89c3-7f56654ca743",
  "75328503-79ef-4fa2-a19d-1c410453eab8",
  "5880d027-6575-4ee7-868f-24a641e26057",
  "6872e6d8-e1f3-4f8f-aa1b-66da6d69dc4a",
  "1a9d7f5f-0750-409f-88d2-1556e56cf851",
  "434a5e49-3d22-4830-bec2-cf3640f5cdae",
  "7f6507ab-10c6-4d06-806d-4475dc7b8333",
  "69ec88de-61f3-4a35-a975-c9ab5b5aed20",
  "455aee27-0225-4b06-ba76-f46f93c77928",
  "3e4d6f40-edad-4535-beca-33db5d673590",
  "38fdc25f-9510-4514-ad1b-90a40d3734ea",
  "4dc1f291-fa13-48ac-84b8-1a4aae62c9f5",
  "4d4d5575-3f6b-4c37-832d-ba0843ae4baf",
  "9058f234-3e47-4ba9-973e-7e20b1a67a3d",
  "1ecea02e-5b89-44ab-8729-ef20a2127803",
  "dd4e76e2-afab-417e-9950-1f412cbe971f",
  "033c7112-66a2-4fe6-bda4-ebae0eeacf67",
  "78bac30a-0519-4dc4-9f89-0d0e4908d9d4",
  "e914cc50-c826-4a37-b5a4-d52ad57c9783",
  "a1e1d0fb-8feb-4661-af57-71d502abe8f4",
  "0d824310-0de8-4adb-8df6-b6b75266875a",
  "9c22d6d4-2b8e-420c-add9-342a124e2190",
  "4a66fd75-a4e6-4c84-818b-c0c43ae7fbed",
  "cc7cf78f-eb65-4464-b999-5243d18b3d24",
  "b5112661-b8fb-438d-b288-de0dcbac4cc2",
  "bc957dea-ec40-4e58-8873-39ead7365ab5",
  "5c5f3098-d253-4979-9f66-fd2d91adfacc",
  "ef9e84e7-4063-4f4f-89fd-97b33b50e71b",
  "94db685c-518e-4335-9261-7edee5f067e8",
  "a83780ac-7694-4cbb-b345-372949d8b5ab",
  "9f87ce5e-88c7-413d-a210-32047834e82f",
  "0cb755ef-01b9-442c-b396-3824b8e8ce14",
  "58febe9a-1799-4f08-bf5f-a783371ba06c",
  "c9f43984-f24e-443b-bb23-be2fbdb494b0",
  "5d08eaa2-1e72-4275-b37c-62c53aec02bb",
  "05bbbb33-215f-4b6f-809e-cefc956c26c2",
  "0ef19106-8f14-4519-806e-4797c8697cdc",
  "e00416df-ed7d-4515-95d8-b092da08a3cc",
  "cd256160-fb7e-43ba-b276-09a93431676c",
  "3a776835-8694-4329-85e1-3e0735da7d2d",
  "98f14609-65d0-452a-b09a-5ae12e7bd0ae",
  "d4f75862-9d0d-4c18-a37c-a0d4887b9ea2",
  "37514a52-bfb3-43c3-b191-69bbeaf325c9",
  "254e2ff5-60ff-4d15-aa23-dbbc120c89f5",
  "28339eec-6a03-47ca-82f5-e0899bb9da0d",
  "da224dac-ad47-4e45-9cd2-da1fc417cf06",
  "cac0ab1d-8feb-4f84-b4e2-c2c3eba8b448",
  "1810f587-4c41-4f3a-998b-8f71c0cf7921",
];

let mType = ["7 KG", "12 KG", "20 KG"];

class Machine {
  constructor(mid, type) {
    this.mid = mid;
    this.type = type;
    this.status = "available";
    this.isOpen = false;
    this.remainingTime = 0;
  }

  close() {
    if (!this.isOpen) {
      console.log("Door is already closed.");
    } else {
      this.isOpen = false;
    }
  }

  open() {
    if (this.status === "available" && this.isOpen) {
      console.log("Door is already open");
    } else if (this.status === "available" && !this.isOpen) {
      console.log("Open door");
      this.isOpen = true;
    } else if (this.status === "working") {
      console.log("Machine is working. can't open the door");
    } else if (this.status === "finished") {
      console.log("Open the finished machine");
      this.status = "available";
      this.isOpen = true;
    }
  }

  // how to clear interval;
  forceFinish() {
    console.log("Machine is Force to be finished");
    this.status = "finished";
    // in case the door is (available,open)
    this.isOpen = false;
    this.remainingTime = 0;
  }

  start() {
    // currently similated in second
    if (this.status !== "available") {
      console.log("The machine is not ready");
    } else if (this.isOpen) {
      console.log("Please Close the Door");
    } else {
      console.log(`Start The Machine ${this.mid}`);
      this.remainingTime = 30;
      this.status = "working";
      let intervel = setInterval(() => {
        if (this.remainingTime === 0) {
          clearInterval(intervel);
          this.forceFinish();
        } else {
          this.remainingTime--;
          console.log(`Remaining Time: ${this.remainingTime} (second)`);
        }
      }, 1000);
      // multiply above with 60 to make it minute
    }
  }
}

module.exports = { mType, ids, Machine };
