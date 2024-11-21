import React from 'react';
// import { Card } from '@/components/ui/card';
import { Pencil, ArrowDownIcon } from 'lucide-react';

const ReverseTimeline = () => {
  const events = [
    {
      phase: "post-surgery",
      type: "follow-up",
      date: "2024-02-15",
      desc: "Return to driving",
      details: "Able to drive short distances after 6 months restriction"
    },
    {
      phase: "post-surgery",
      type: "symptom",
      date: "2023-08-20",
      desc: "Post-surgical symptoms",
      details: "Insomnia, body ache, joint pain in feet and hands, toe pain"
    },
    {
      phase: "surgery",
      type: "surgery",
      date: "2023-08-15",
      desc: "Cranioplasty",
      details: "Surgical procedure"
    }
  ];

  const getTimeDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMonths = (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
    const diffDays = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));

    if (diffMonths > 0) {
      return `${diffMonths} months later`;
    } else if (diffDays > 0) {
      return `${diffDays} days later`;
    }
    return 'Same day';
  };

  return (
    <div className='bg-white min-h-screen'>
      <div className="max-w-2xl mx-auto p-4 bg-white">
        <div className="relative">
          {events.map((event, index) => (
            <div key={index} className="relative">
              {/* Event Card */}
              <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden">
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-600">
                      {event.desc}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Pencil size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.details}
                  </div>
                  <div className="text-xs font-medium text-gray-400">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Time Connector */}
              {index < events.length - 1 && (
                <div className="left-1/2 flex flex-col items-center">
                  <div className="h-4 w-0.5 bg-gray-200"></div>
                  <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                    {getTimeDifference(event.date, events[index + 1].date)}
                  </div>
                  <div className="h-4 w-0.5 bg-gray-200"></div>
                </div>
              )}
            </div>
          ))}

          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default ReverseTimeline;