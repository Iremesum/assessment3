import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({
    serviceName: "assessment3-backend",
  });
}