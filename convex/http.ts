// convex/http.ts
import { httpRouter } from "convex/server";

const http = httpRouter();

export default http;


// // convex/http.ts
// import { httpRouter } from "convex/server";
// import { httpAction } from "./_generated/server";
// import { internal } from "./_generated/api";

// const http = httpRouter();

// // Simplify to exactly match the format in Convex docs
// http.route({
//   path: "/stripe-webhooks",  // Changed path
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     const signature = request.headers.get("stripe-signature");

//     if (!signature) {
//       return new Response("No signature", { status: 400 });
//     }

//     const payload = await request.text();
    
//     // Simply pass the webhook data to be processed
//     const result = await ctx.runAction(internal.stripe.fulfill, {
//       signature,
//       payload
//     });

//     return new Response(null, {
//       status: result.success ? 200 : 400
//     });
//   }),
// });

// export default http;