import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold mb-6">
        Privacy Policy
      </h1>
      
      <div className="flex items-center gap-2 mb-8">
        <svg 
          viewBox="0 0 24 24" 
          className="w-6 h-6 text-gray-600"
          fill="none" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <p className="text-gray-600">
          Last Updated – November 14, 2024
        </p>
      </div>

      <div className="prose prose-gray max-w-none prose-a:text-orange-400 prose-a:hover:text-orange-500">
        <p className="mb-8 text-gray-700">
          Welcome to CitrusReach (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). This Privacy Policy explains how we collect, use, 
          disclose, and safeguard your information when you use our web service at{' '}
          <a href="https://citrusreach.com" className="text-orange-600 hover:text-orange-700">
            https://citrusreach.com
          </a>
          , which helps individuals and businesses create personalized microsites to improve outreach results.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          1. Information We Collect
        </h2>

        <h3 className="text-xl font-bold mt-6 mb-3">Personal Data</h3>
        <p className="text-gray-700 pl-4">
          We collect the following personal information:
        </p>
        <ul className="list-disc pl-8 text-gray-700">
          <li>Name</li>
          <li>Email address</li>
          <li>Payment information</li>
        </ul>

        <h3 className="text-xl font-bold mt-6 mb-3">Non-Personal Data</h3>
        <p className="text-gray-700 pl-4">
          We use web cookies to improve your browsing experience and optimize our service functionality.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          2. How We Use Your Information
        </h2>

        <p className="text-gray-700 pl-4">
          We collect and process your information solely for order processing purposes, including:
        </p>
        <ul className="list-disc pl-8 text-gray-700">
          <li>Managing your account</li>
          <li>Processing your payments</li>
          <li>Providing customer support</li>
          <li>Improving our services</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          3. Data Sharing and Disclosure
        </h2>

        <p className="text-gray-700 pl-4">
          We do not share your personal information with any third parties, except as required by law 
          or with your explicit consent.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          4. Children&rsquo;s Privacy
        </h2>

        <p className="text-gray-700 pl-4">
          Our services are not directed to children under 13 years of age. We do not knowingly collect 
          personal information from children. If we become aware that we have inadvertently collected 
          personal information from a child under 13, we will take steps to delete such information.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          5. Cookie Policy
        </h2>

        <p className="text-gray-700 pl-4">
          Our website uses cookies to enhance your browsing experience. You can control cookie settings 
          through your browser preferences.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          6. Updates to This Privacy Policy
        </h2>

        <p className="text-gray-700 pl-4">
          We may update this Privacy Policy from time to time. We will notify you of any changes by 
          sending an email to the address you have provided us.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          7. Your Rights
        </h2>

        <p className="text-gray-700 pl-4">
          You have the right to:
        </p>
        <ul className="list-disc pl-8 text-gray-700">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent at any time</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          8. Security
        </h2>

        <p className="text-gray-700 pl-4">
          We implement appropriate technical and organizational measures to protect your personal 
          information against unauthorized access or disclosure.
        </p>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            For questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:info@citrusreach.com" className="text-orange-400 hover:text-orange-500">
              info@citrusreach.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;