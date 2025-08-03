// email_webpage.jsx

import { useState } from 'react';
import './email_webpage.css'

// Strip tags for email preview
function stripTags(email) {
  const tags = /(<([^>]+)>)/gi;
  return email.replace(tags, "");
}

// Dummy data for emails
const emails = [
  {
    id: '1',
    from: 'Unknown Sender <acbdefg@example.com>',
    subject: 'Congratulations!',
    body: `
      <p>You have won a prize!</p>
      <p>Just click the link below to claim your prize worth £10,000!</p>
      <p><a href="https://example.com/agenda" target="_blank" class="text-blue-500 hover:underline">CLICK HERE!</a></p>
    `,
    date: '29/07/2025',
    category: 'inbox',
  },
  {
    id: '2',
    from: 'Amazon <accounts@amaz0n.co.uk>',
    subject: 'Password reset',
    body: `
      <p>Dear customer,</p>
      <p>Your password has appeared in a data leak so needs to be reset immediately.</p>
      <p>Click the link to reset your password: <a href="https://example.com/project-x-staging" target="_blank" class="text-blue-500 hover:underline">reset password</a>.</p>
      <p>Amazon Accounts Team</p>
    `,
    date: '28/07/2025',
    category: 'inbox',
  },
  {
    id: '4',
    from: 'Spam Mail <spam@example.com>',
    subject: 'YOU HAVE WON A MILLION POUNDS!!!',
    body: `
      <p>Congratulations! You have been selected as the lucky winner of our grand lottery. To claim your prize, please click on the link below and provide your bank details:</p>
      <p><a href="https://example.com/claim-prize" target="_blank" class="text-red-500 hover:underline">Claim Your Prize Now!</a></p>
      <p>Act fast! This offer expires soon.</p>
    `,
    date: '27/07/2025',
    category: 'spam',
  },
  {
    id: '5',
    from: 'Raymond <raymond@bettersoftware.com>',
    subject: 'Protect your device now',
    body: `
      <p>Dear valued customer,</p>
      <p>Improve your device performance by cleaning up junk files today. Download this free piece of software and click 'Run' and you're all set!</p>
      <p><a href="../malware.pdf" target="_blank" class="text-red-500 hover:underline" download>Download</a></p>
      <p>All the best,</p>
      <p>Raymond</p>
      <p>Better Software Support Team</p>
    `,
    date: '26/07/2025',
    category: 'inbox',
  },
  {
    id: '6',
    from: 'me <usera@mail.com>',
    subject: 'Draft: Holiday Ideas',
    body: `
      <p>Hi Steve,</p>
      <p>Here is the link to where we stayed on holiday last year. It was great!</p>
      <p><a href="https://example.com/" target="_blank" class="text-red-500 hover:underline">Bath Campsite</a></p>
    `,
    date: '24/07/2025',
    category: 'drafts',
  },
  {
    id: '7',
    from: 'me <usera@mail.com>',
    subject: 'Product Return',
    body: `
      <p>Good morning,</p>
      <p>I would like to return a faulty product. Please can you give instructions on how to do this.</p>
    `,
    date: '24/07/2025',
    category: 'sent',
  },
  {
    id: '8',
    from: 'autoreply <donotreply@shop.com>',
    subject: 'Order Confirmed',
    body: `
      <p>Thank you for your order (order ID: 123456789).</p>
      <p>Your product will be posted shortly.</p>
      <p>Please do not reply to this email.</p>
    `,
    date: '24/07/2025',
    category: 'trash',
  }
];

// Sidebar component for navigation
const Sidebar = ({ onSelectCategory, activeCategory }) => {
  const categories = [
    { name: 'Inbox', icon: 'Mails' },
    { name: 'Sent', icon: 'Send' },
    { name: 'Drafts', icon: 'FileText' },
    { name: 'Spam', icon: 'Bomb' },
    { name: 'Trash', icon: 'Trash2' },
  ];

  return (
    <div className="w-64 p-4 bg-gray-50 border-r border-gray-200 shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Mailbox</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.name}>
            <button
              onClick={() => onSelectCategory(category.name.toLowerCase())}
              className={`flex items-center w-full px-4 py-2 rounded-lg text-lg transition-all duration-200 ease-in-out
                ${activeCategory === category.name.toLowerCase() ? 'bg-blue-500 text-gray-700 shadow-lg' : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'}`}
            >
              {category.icon === 'Mails' && <Mails className="mr-3 w-5 h-5" />}
              {category.icon === 'Send' && <Send className="mr-3 w-5 h-5" />}
              {category.icon === 'FileText' && <FileText className="mr-3 w-5 h-5" />}
              {category.icon === 'Bomb' && <Bomb className="mr-3 w-5 h-5" />}
              {category.icon === 'Trash2' && <Trash2 className="mr-3 w-5 h-5" />}
              <span>{category.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Component to display a list of emails
const EmailList = ({ emails, onSelectEmail, selectedEmailId }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-white border-r border-gray-200 shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search emails..."
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
        />
      </div>
      <ul className="divide-y divide-gray-200">
        {emails.length === 0 ? (
          <p className="text-center text-gray-500 p-4">No emails in this category.</p>
        ) : (
          emails.map((email) => (
            <li
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={`p-4 cursor-pointer transition-all duration-200 ease-in-out rounded-lg m-2
                ${selectedEmailId === email.id ? 'bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400' : 'hover:bg-gray-50'}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700 truncate">{email.from}</span>
                <span className="text-xs text-gray-500">{email.date}</span>
              </div>
              <div className="text-md font-semibold mb-1 truncate">{email.subject}</div>
              <div className="text-sm text-gray-500 truncate">{stripTags(email.body)}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

// Component to show the full email content
const EmailDetail = ({ email }) => {
  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 p-6 rounded-lg shadow-inner">
        <p className="text-gray-500 text-lg">Select an email to view its content.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-white overflow-y-auto shadow-xl rounded-lg">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2" id='captureSubject'>{email.subject}</h2>
        <div className="flex items-center text-gray-600 text-sm">
          <span className="font-semibold mr-2">From:</span>
          <span id='captureFrom'>{email.from}</span>
          <span className="ml-auto text-xs" id='captureDate'>{email.date}</span>
        </div>
      </div>
      <div className="email-body text-gray-800 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: email.body }} id='captureBody'></div>
      <div className="mt-8 pt-4 border-t border-gray-200 flex space-x-4">
        <button className="px-6 py-2 bg-blue-600 text-gray-700 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center">
          <Reply className="mr-2 w-4 h-4" /> Reply
        </button>
        <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center">
          <Forward className="mr-2 w-4 h-4" /> Forward
        </button>
      </div>
    </div>
  );
};

// Icons
const Mails = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
    <path d="M10 12L2 7V5L10 10L22 5V7L14 12L22 17V19L14 14L2 19V17L10 12Z"></path>
  </svg>
);

const Send = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 2L11 13"></path>
    <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
  </svg>
);

const FileText = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const Bomb = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="8"></line>
    <path d="M14.2 14.2L12 12L9.8 9.8"></path>
    <path d="M9.8 14.2L12 12L14.2 9.8"></path>
  </svg>
);

const Trash2 = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const Reply = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="10 8 2 12 10 16"></polyline>
    <path d="M21 12H2"></path>
  </svg>
);

const Forward = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="14 8 22 12 14 16"></polyline>
    <path d="M2 12H22"></path>
  </svg>
);


// Main App component
export default function EmailWebPage() {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeCategory, setActiveCategory] = useState('inbox');

  const filteredEmails = emails.filter(email => email.category === activeCategory); // filter emails based on the active category

  return (
    <div className="min-h-screen bg-gray-100 font-inter antialiased flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Email</h1>
          <div className="flex items-center space-x-4">
            <span className="text-lg">User A</span>
            <img
              src="https://placehold.co/40x40/ADD8E6/000000?text=A"
              className="rounded-full border-2 border-white"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/ADD8E6/000000?text=A"; }}
            />
          </div>
        </div>
      </header>


      <div className="flex flex-1 overflow-hidden container mx-auto my-6 rounded-xl shadow-2xl bg-white">
        <Sidebar onSelectCategory={setActiveCategory} activeCategory={activeCategory} />
        <EmailList emails={filteredEmails} onSelectEmail={setSelectedEmail} selectedEmailId={selectedEmail?.id} />
        <EmailDetail email={selectedEmail} />
      </div>
    </div>
  );
}
