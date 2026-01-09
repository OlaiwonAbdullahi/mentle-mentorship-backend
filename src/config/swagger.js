const swaggerJsdoc = require("swagger-jsdoc");

const match = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.match(/https?:\/\/([^:]+)/)
  : null;
// Determine the host based on the environment or CLIENT_URL, defaulting to localhost for dev
let host = "localhost:5000";
if (process.env.NODE_ENV === "production" && match) {
  host = match[1];
}

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mantle Mentorship API",
      version: "1.0.0",
      description: "API documentation for the Mantle Mentorship Backend",
      contact: {
        name: "API Support",
        email: "support@mantlementorship.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: "Local Development Server",
      },
      {
        url: "https://mantle-mentorship-backend.onrender.com/api", // Replace with actual production URL if known
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/models/*.js", "./src/server.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
