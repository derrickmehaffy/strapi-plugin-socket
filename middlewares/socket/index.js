"use strict";

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

            if (route.action === "bulkdelete") {
              action = "delete";
            } else {
              action = route.action;
            }

            if (
              model.apiName in strapi.controllers &&
              actions().includes(route.action) === true
            ) {
              strapi.StrapIO.emit(
                strapi.controllers[model.apiName],
                action,
                ctx.response.body
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
