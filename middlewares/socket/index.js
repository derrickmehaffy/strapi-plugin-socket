"use strict";

const { sanitizeEntity } = require("strapi-utils");

module.exports = (strapi) => {
  return {
    beforeInitialize() {
      strapi.config.middleware.load.after.unshift("socket");
    },
    initialize() {
      const { actions } = strapi.plugins.socket.services.socket;
      strapi.app.use(async (ctx, next) => {
        await next();
        let route = ctx.request.route;
        try {
          if (!route.plugin) {
            if (
              route.controller in strapi.controllers &&
              actions().includes(route.action) === true
            ) {
              strapi.StrapIO.emit(
                strapi.controllers[route.controller],
                route.action,
                ctx.response.body
              );
            }
          } else if (route.controller === "collection-types") {
            let model = strapi.getModel(ctx.params.model);
            let action;
            let data;

            if (route.action === "bulkdelete") {
              action = "delete";
              let rawData = Object.values(ctx.response.body);
              data = rawData.map((entity) =>
                sanitizeEntity(entity, { model: strapi.models[model.apiName] })
              );
            } else {
              action = route.action;
              data = await sanitizeEntity(ctx.response.body, {
                model: strapi.models[model.apiName],
              });
            }

            if (
              model.apiName in strapi.controllers &&
              actions().includes(route.action) === true
            ) {
              strapi.StrapIO.emit(
                strapi.controllers[model.apiName],
                action,
                data
              );
            }
          }
        } catch (err) {
          console.log(err);
        }
      });
    },
  };
};
