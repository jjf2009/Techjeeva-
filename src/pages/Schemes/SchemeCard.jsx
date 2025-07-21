import React, { memo } from 'react';
import { ExternalLink, Calendar, DollarSign, Tag, AlertCircle, Bell, Building, Clock } from 'lucide-react';
import Cookies from 'js-cookie';

// Custom Card components to replace Next.js components
const Card = ({ className, children }) => (
  <div className={`flex flex-col h-full overflow-hidden border border-gray-200 rounded-lg transition-all duration-300 hover:shadow-lg hover:border-emerald-200 ${className || ''}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 pt-5 flex-1 ${className || ''}`}>
    {children}
  </div>
);

const CardFooter = ({ className, children }) => (
  <div className={`p-6 pt-0 bg-gray-50 ${className || ''}`}>
    {children}
  </div>
);

// Custom Button component
const Button = ({ className, onClick, asChild, children }) => {
  if (asChild) {
    return children;
  }
  
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded font-medium ${className || ''}`}
    >
      {children}
    </button>
  );
};

// Custom Badge component
const Badge = ({ className, variant, children }) => {
  let baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  if (variant === "outline") {
    baseClass += " border";
  }
  
  return (
    <span className={`${baseClass} ${className || ''}`}>
      {children}
    </span>
  );
};

const SchemeCard = memo(({ scheme }) => {
  // Safely handle date parsing
  const parseDeadline = () => {
    try {
      const deadlineDate = new Date(scheme.deadline);

      // Check if date is valid
      if (isNaN(deadlineDate.getTime())) {
        return {
          formattedDeadline: 'Date not specified',
          daysLeft: null
        };
      }

      const today = new Date();
      const timeDiff = deadlineDate - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      const formattedDeadline = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(deadlineDate);

      return { formattedDeadline, daysLeft };
    } catch (err) {
      console.error('Date parsing error:', err);
      return {
        formattedDeadline: 'Date not specified',
        daysLeft: null
      };
    }
  };

  const { formattedDeadline, daysLeft } = parseDeadline();

  const handleNotify = async () => {
    try {
      const user = JSON.parse(Cookies.get('user') || '{}');

      if (!user.email || !user.name) {
        alert('Please sign in to get notified.');
        return;
      }
      const sheetURL = 'https://script.google.com/macros/s/AKfycbzHdk-A_587bl_RVj_US3T8iznpwp8DiJcteZDwnsfTA20RCSrm9LHTZTxX9HipeEQOvQ/exec';
      const body = `Name=${encodeURIComponent(user.name)}&Email=${encodeURIComponent(user.email)}&Program=${encodeURIComponent(scheme.title)}&Organization=${encodeURIComponent(scheme.organization)}`;
      console.log(body);
      const response =  await fetch(sheetURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      console.log(response)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      alert('You will be notified when this scheme reopens.');
    } catch (err) {
      alert('Failed to register notification. Please try again.');
      console.error('Error:', err);
    }
  };

  const isOpen = scheme.status === 'Open';
  const isClosingSoon = daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && isOpen;

  return (
    <Card>
      <div className={`h-1.5 ${isOpen ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`}></div>

      <CardContent className="flex flex-col min-h-64">
        <div className="space-y-4 h-full">
          {/* Organization */}
          <div className="min-h-6">
            <h3 className="text-xl font-bold tracking-tight text-emerald-700 line-clamp-2 group-hover:text-emerald-600">
              {scheme.organization || 'Not specified'}
            </h3>
          </div>
          
          {/* Scheme Title */}
          <div className="min-h-12">
            <p className="text-lg font-semibold text-gray-900 line-clamp-2">{scheme.title}</p>
          </div>

          {/* Focus Areas */}
          <div className="min-h-16">
            {scheme.focusAreas && scheme.focusAreas.length > 0 ? (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag size={16} className="text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-sm text-gray-600">Focus Areas:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {scheme.focusAreas.map((area, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 truncate max-w-full mb-1"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-6"></div> // Empty space for consistent layout
            )}
          </div>

          {/* Support/Grant - Fixed height container */}
          <div className="min-h-6">
            {scheme.support && (
              <p className="font-extrabold text-gray-900">{scheme.support}</p>
            )}
          </div>

          {/* Funding Type - Fixed height container */}
          <div className="min-h-6">
            {scheme.fundingType && (
              <div className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-600 flex-shrink-0" />
                <p className="font-semibold text-gray-800">{scheme.fundingType}</p>
              </div>
            )}
          </div>

          {/* Status and Deadline */}
          <div className="mt-auto pt-2">
            {/* Deadline */}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-emerald-600 flex-shrink-0" />
              <span className="font-semibold text-sm text-gray-600">Deadline:</span>
              <span className="font-medium text-gray-800">{formattedDeadline}</span>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-1.5 mt-2 h-6">
              {isClosingSoon ? (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-red-600 animate-pulse">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>Closing Soon: {daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                </div>
              ) : !isOpen ? (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                  <Clock size={16} className="flex-shrink-0" />
                  <span>Currently Closed</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {!isOpen ? (
          <Button
            onClick={handleNotify}
            className="w-full bg-amber-500 text-white transition-all duration-300 hover:bg-amber-600 active:bg-amber-700 flex items-center justify-center gap-1.5 shadow-sm py-3 font-semibold"
          >
            <Bell size={16} className="flex-shrink-0" />
            Notify Me When Open
          </Button>
        ) : (
          <Button
            asChild
            className="w-full bg-emerald-600 text-white transition-all duration-300 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm py-3 font-semibold relative overflow-hidden group"
          >
            <a
              href={scheme.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5"
            >
              <span className="relative z-10">Apply Now</span>
              <ExternalLink size={16} className="flex-shrink-0 relative z-10" />
              <span className="absolute inset-0 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});

// Display name for better debugging
SchemeCard.displayName = 'SchemeCard';

export default SchemeCard;