const { Schema, model } = require("mongoose");

const eventSchema = new Schema(
  {
    eventName: {
      type: String,
      required: true,
      maxLength: 50,
      minLength: 1,
    },
    eventCategory: {
      type: String,

      // On the front end. The input should be a select category. It will be chosen in the front end.
    },
    eventDescription: {
      type: String,
      required: true,
      maxLength: 280,
      minLength: 1,
    },
    // For the images we supose that links are being passed
    mainImg: {
      type: String,
    },
    // For the images we supose that links are being passed
    portraitImg: {
      type: String,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    tags: {
      type: [String],
    },
    usersAssisting: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    eventStartDate: {
      type: String,
      required: true,
    },
    eventLocation: {
      address: String,
      city: String,
      country: String,
      lat: String,
      lon: String,
    },
    eventCapacity: {
      type: Number,
      required: true,
    },
    eventInvitation: {
      type: Boolean,
      default: false,
    },
    minAge: {
      type: Number,
      default: false,
    },
    createdAt: {
      type: String,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    id: false,
  }
);

const Event = model("Event", eventSchema);
module.exports = Event;
