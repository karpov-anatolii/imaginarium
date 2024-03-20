"use client";
import { createTransaction } from "@/lib/actions/transaction.action";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";

const PayPalButton = ({ plan, amount, credits, buyerId }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const paypal = useRef();
  const { toast } = useToast();

  const addPayPalScript = () => {
    if (window.paypal) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}`;
    script.async = true;
    script.type = "text/javascript";
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);
  };
  useEffect(() => {
    if (scriptLoaded) {
      window.paypal
        .Buttons({
          createOrder: (data, actions, err) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  description: "Donation",
                  amount: {
                    currency_code: "USD", // currency
                    value: amount,
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            const {
              status,
              id: payPalId,
              create_time: createdAt,
              purchase_units,
            } = details; //"COMPLETED"
            const value = purchase_units[0].amount.value;
            console.log("details=", details, "value=", value);
            if (status === "COMPLETED" && Number(value) == Number(amount)) {
              const res = await createTransaction({
                payPalId,
                amount,
                credits,
                plan,
                buyerId,
                createdAt,
              });
              if (res) {
                toast({
                  title: "The payment was successful!",
                  description: `You have topped up your account with ${credits} credits`,
                  duration: 7000,
                  className: "success-toast",
                });
              }
            } else {
              toast({
                title: "Order canceled!",
                description:
                  "Continue to shop around and checkout when you're ready",
                duration: 5000,
                className: "error-toast",
              });
            }
          },
          onError: (err) => {
            console.log(err);
          },
        })
        .render(paypal.current);
    }
  }, [scriptLoaded]);

  useEffect(() => {
    addPayPalScript();
  }, []);

  return (
    // <div>
    //   <PayPalScriptProvider
    //     options={{
    //       clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    //       "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    //       currency: "USD",
    //       intent: "capture",
    //     }}
    //   >
    //     <PayPalButtons
    //       style={{
    //         color: "gold",
    //         shape: "rect",
    //         label: "pay",
    //         height: 50,
    //       }}
    //       createOrder={async () => {
    //         console.log("START createOrder");
    //         const res = await fetch("/api/paypal/createorder", {
    //           method: "POST",
    //           body: JSON.stringify({
    //             user_id: user._id,
    //             // order_price: amountRef.current.value,
    //             order_price: 100,
    //           }),
    //         });
    //         console.log("createOrder res=", res);
    //         const resJson = await res.json();
    //         console.log(
    //           "CreateOrder : resJson.data.response.order_id=",
    //           resJson.data.response.order_id
    //         );
    //         return resJson.data.response.order_id + "";
    //       }}
    //       onApprove={async (data, actions) => {
    //         console.log("START onApprove, data.orderID=", data.orderID);
    //         const response = await fetch("/api/paypal/cuptureorder", {
    //           method: "POST",
    //           body: JSON.stringify({
    //             orderID: data.orderID,
    //           }),
    //         });
    //         const respondJson = await response.json();

    //         console.log("onApprove : respondJson=", respondJson);
    //         if (respondJson) return true;
    //       }}
    //     />
    //   </PayPalScriptProvider>
    // </div>
    <div>
      <div ref={paypal}></div>
    </div>
  );
};

export default PayPalButton;
