import { ShieldCheck, Lock, Mail } from "lucide-react";

const PrivacyPolicyMock = [
  {
    heading: "Information We Collect",
    content:
      "We may collect your name, email address, and messages you send through the contact form to respond to inquiries.",
    icon: Mail,
  },
  {
    heading: "Data Security",
    content:
      "All information submitted is stored securely and never shared with third parties. Security best practices are implemented to protect your data.",
    icon: Lock,
  },
  {
    heading: "Your Rights",
    content:
      "You can request that any data you submitted be deleted. Your information will not be used for marketing or sold to anyone.",
    icon: ShieldCheck,
  },
];

export default PrivacyPolicyMock;
