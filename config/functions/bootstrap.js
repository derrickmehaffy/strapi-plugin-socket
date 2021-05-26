"use strict";

module.exports = () => {
  process.nextTick(() => {
    strapi.StrapIO = new (require("strapio"))(strapi);
  });
};
