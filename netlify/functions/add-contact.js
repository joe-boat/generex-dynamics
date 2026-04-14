exports.handler = async (event) => {
  try {
    const { email, name, phone } = JSON.parse(event.body);

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY, // 🔐 SECURE
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: name ? name.split(" ")[0] : "",
          LASTNAME: name ? name.split(" ").slice(1).join(" ") : "",
          SMS: phone || "",
        },
        listIds: [3], // your list ID
        updateEnabled: true,
      }),
    });

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      const error = await response.text();
      return {
        statusCode: 400,
        body: JSON.stringify({ error }),
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};