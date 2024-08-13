import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { createTodoHandler } from "./server/create-todo-handler.js";
import { vikeHandler } from "./server/vike-handler";

type Middleware<Context extends Record<string | number | symbol, unknown>> = (request: Request, context: Context) => Response | void | Promise<Response> | Promise<void>

export function handlerAdapter<Context extends Record<string | number | symbol, unknown>>(
  handler: Middleware<Context>,
) {
  return createMiddleware(async (context, next) => {
    let ctx = context.get("context");
    if (!ctx) {
      ctx = {};
      context.set("context", ctx);
    }

    const res = await handler(context.req.raw, ctx as Context);
    context.set("context", ctx);

    if (!res) {
      await next();
    }

    return res;
  });
}

const app = new Hono();

app.post("/api/todo/create", handlerAdapter(createTodoHandler));

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", handlerAdapter(vikeHandler));

export default app;
