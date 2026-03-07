import ChatTrigger from '@/components/ChatTrigger';

export default function TalkToDataSection() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-8 mb-12 border border-blue-100 dark:border-blue-800">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-800/50 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Talk to the Data</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Use our AI assistant to explore patient risk scores, compare datasets, and run live predictions. Powered by Claude and MCP.
          </p>
        </div>
        <ChatTrigger className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Try the AI Assistant
        </ChatTrigger>
      </div>
    </div>
  );
}
