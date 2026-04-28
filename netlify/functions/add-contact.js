exports.handler = async (event) => {
  try {
    const { email, name, phone } = JSON.parse(event.body);

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email is required" }) };
    }

    const firstName = name ? name.split(" ")[0] : "";
    const lastName = name ? name.split(" ").slice(1).join(" ") : "";

    // Step 1: Create or Update Contact
    const contactResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: phone || "",
        },
        listIds: [3],           // ← Your list ID
        updateEnabled: true,
      }),
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error("Contact creation failed:", errorText);
      // Still continue to send email if you want (optional)
    }

    // Step 2: Send Welcome Transactional Email immediately
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        to: [{ email: email, name: firstName || "" }],
        templateId: YOUR_WELCOME_TEMPLATE_ID,   // ← CHANGE THIS
        params: {
          FIRSTNAME: firstName || "there",
          // Add any other template variables here
        },
        headers: {
          "X-Mailin-Tag": "welcome-email",      // Helpful for tracking
        },
      }),
    });

    if (emailResponse.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: "Contact added and welcome email sent" 
        }),
      };
    } else {
      const error = await emailResponse.text();
      console.error("Email sending failed:", error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Contact added but welcome email failed" }),
      };
    }

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};