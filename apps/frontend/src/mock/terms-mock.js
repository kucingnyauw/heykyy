import { FileText, ShieldCheck, AlertCircle } from "lucide-react";

const TermsMock = [
  {
    heading: "Acceptance of Terms",
    content:
      "By using this portfolio website, you agree to these terms. Please read them carefully before interacting with the site.",
    icon: FileText,
  },
  {
    heading: "Use of Content",
    content:
      "All content on this site, including projects, images, and text, is for personal and educational purposes. Reproduction without permission is prohibited.",
    icon: ShieldCheck,
  },
  {
    heading: "User Conduct",
    content:
      "Users must interact respectfully with the site. You may not attempt to harm, manipulate, or disrupt the website or its content.",
    icon: AlertCircle,
  },
  {
    heading: "Limitation of Liability",
    content:
      "The owner of this portfolio is not liable for any damages or losses resulting from the use of this website. Use the content at your own discretion.",
    icon: ShieldCheck,
  },
  {
    heading: "Modifications",
    content:
      "These terms may be updated at any time. Continued use of the site constitutes acceptance of any changes.",
  },
];

export default TermsMock;