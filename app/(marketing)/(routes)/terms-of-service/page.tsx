import React from 'react';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold mb-6">
        Terms of Service
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
          Effective Date – November 14, 2024
        </p>
      </div>

      <div className="prose prose-gray max-w-none prose-a:text-orange-400 prose-a:hover:text-orange-500">
        <p className="mb-8 text-gray-700">
          Please read these Terms of Service (collectively with the Privacy Policy at{' '}
          <a href="https://citrusreach.com/privacy-policy" className="text-orange-600 hover:text-orange-700">
            https://citrusreach.com/privacy-policy
          </a>
          , the "Terms of Service") fully and carefully before using{' '}
          <a href="https://citrusreach.com" className="text-orange-600 hover:text-orange-700">
            https://citrusreach.com
          </a>
          {' '}(the "Site") and the services, features, content or applications offered by Citrus Reach 
          ("we" or "Citrus Reach") (collectively with the Site, the "Services"). These Terms of Service 
          set forth the legally binding terms and conditions for your use of the Site and the Services.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          1. Acceptance of Terms
        </h2>

        <p className="text-gray-700 pl-4">
          A. By registering for and/or using the Services in any manner, including but not limited to visiting 
          or browsing the Site, you agree to these Terms of Service and all other operating rules, policies 
          and procedures that may be published from time to time on the Site or through the Services by 
          Citrus Reach, each of which is incorporated by reference and each of which may be updated by 
          Citrus Reach from time to time without notice to you.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          2. Description of Service
        </h2>

        <p className="text-gray-700 pl-4">
          A. Citrus Reach provides web services for creating personalized microsites to improve outreach 
          results. The Service is offered subject to your acceptance of these Terms and all other operating 
          rules and policies published on the website.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">
          3. User Accounts and Content
        </h2>

        <p className="text-gray-700 pl-4">
          A. To access certain features of the Service, you must provide accurate registration information, 
          including your name and email address.
        </p>

        <p className="text-gray-700 pl-4 mt-4">
          B. Paid users receive ownership rights to their microsites and embedded content for 7 days from 
          the date of package purchase. Users of free-tier services acknowledge they have no legal recourse 
          for any loss of data used in site creation.
        </p>

        {/* Add more sections as needed */}

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            For questions about these Terms, please contact us at{' '}
            <a href="mailto:info@citrusreach.com" className="text-orange-400 hover:text-orange-500">
              info@citrusreach.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;