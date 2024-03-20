import client from "@/utils/paypal";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(req) {
  console.log("SERVER START CREATEORDER");
  const reqBody = await req.json();
  console.log(
    "reqBody.order_price= ",
    reqBody.order_price,
    " reqBody.user_id= ",
    reqBody.user_id
  );

  if (!reqBody.order_price || !reqBody.user_id)
    return new Response(
      {
        success: false,
        message: "Please Provide order_price And User ID",
      },
      { status: 400 }
    );

  try {
    const PaypalClient = client();
    //This code is lifted from https://github.com/paypal/Checkout-NodeJS-SDK
    const request = new paypal.orders.OrdersCreateRequest();
    request.headers["prefer"] = "return=representation";
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: reqBody.order_price + "",
          },
        },
      ],
    });
    const response = await PaypalClient.execute(request);
    if (response.statusCode !== 201) {
      console.log("RES: ", response);
      return new Response(
        { success: false, message: "Some Error Occured at backend" },
        { status: 500 }
      );
    }

    // Your Custom Code for doing something with order
    // Usually Store an order in the database like MongoDB
    return new Response({ success: true, data: { response } }, { status: 200 });
  } catch (err) {
    console.log("Err at Create Order: ", err);
    return new Respond(
      { success: false, message: "Could Not Found the user" },
      { status: 500 }
    );
  }
}
