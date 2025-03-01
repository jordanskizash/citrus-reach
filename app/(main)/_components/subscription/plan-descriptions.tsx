// components/subscription/plan-descriptions.ts

const planDescriptions = {
    free: {
      name: "Free Plan",
      price: "$0/month",
      tagline: "Try out our platform",
      description: "Basic access with limited features. Perfect for trying out the platform.",
      features: [
        "Up to 5 total sites",
        "Basic features only",
        "Community support"
      ],
      cta: "Upgrade Now",
      recommended: false
    },
    pro: {
      name: "Pro Plan",
      price: "$10/month",
      tagline: "Perfect for professionals",
      description: "Access to 10 sites monthly. Ideal for professionals and small businesses looking to establish an online presence.",
      features: [
        "10 sites per month",
        "Mix of blogs, profiles, and events",
        "Full customization options",
        "Regular updates",
        "Basic analytics",
        "Email support"
      ],
      cta: "Get Pro",
      recommended: true
    },
    enterprise: {
      name: "Enterprise Plan",
      price: "$20/month",
      tagline: "Unlimited possibilities",
      description: "Create unlimited sites with no restrictions. Perfect for agencies, businesses with multiple brands, or content creators managing numerous projects.",
      features: [
        "Unlimited sites",
        "No restrictions on blogs, profiles, or events",
        "Premium customization options",
        "Priority updates",
        "Advanced analytics",
        "Priority support",
        "Dedicated account manager"
      ],
      cta: "Get Enterprise",
      recommended: false
    }
  };
  
  export default planDescriptions;