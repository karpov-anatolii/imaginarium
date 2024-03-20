import client from "@utils/paypal";
import paypal from "@paypal/checkout-server-sdk";

export async function POST(req, res) {
  const reqBody = await req.json();
  console.log("reqBody.orderID= ", reqBody.orderID);
  if (!reqBody.orderID)
    return new Respond(
      { success: false, message: "Please Provide Order ID" },
      { status: 400 }
    );

  //Capture order to complete payment
  const { orderID } = reqBody;
  const PaypalClient = client();
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});
  const response = await PaypalClient.execute(request);
  if (!response) {
    return new Response(
      { success: false, message: "Some Error Occured at backend" },
      { status: 500 }
    );
  }

  // Your Custom Code to Update Order Status
  // And Other stuff that is related to that order, like wallet
  // Here I am updateing the wallet and sending it back to frontend to update it on frontend
  return new Response({ success: true, data: { wallet } }, { status: 200 });
}
