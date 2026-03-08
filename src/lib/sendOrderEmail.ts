// lib/sendOrderEmail.ts

export const sendOrderEmail = async (orderDetails: any) => {
    try {
        const payload = {
            service_id: process.env.EMAILJS_SERVICE_ID || "service_euq9gsm",
            template_id: process.env.EMAILJS_ORDER_TEMPLATE_ID || "template_ayqmmaj", // Using generic for now
            user_id: process.env.EMAILJS_PUBLIC_KEY || "ejWUMJJ_b0PSuayNW",
            template_params: {
                to_email: "saic9524@gmail.com",
                order_number: orderDetails.orderNumber,
                amount: orderDetails.totalAmount,
                payment_method: orderDetails.paymentMethod,
                customer_name: orderDetails.fullName,
                customer_phone: orderDetails.phone,
                customer_address: `${orderDetails.address}, ${orderDetails.city}, ${orderDetails.state} - ${orderDetails.pincode}`,
                items_summary: orderDetails.items.map((i: any) => `${i.quantity}x ${i.chapter.title}`).join(", ")
            }
        };

        const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const textResponse = await res.text();
        console.log(`EmailJS status for order ${orderDetails.orderNumber}: ${res.status}`);
        console.log(`EmailJS response body: ${textResponse}`);

        if (!res.ok) {
            console.error("EmailJS failed to send order email:", textResponse);
        }
    } catch (error) {
        console.error("Error sending order email:", error);
    }
};
